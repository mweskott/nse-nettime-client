import { Configuration } from '../commands';
import { Nettime, OperationResult } from '../nettime';
import { ProjectSearchPage } from '../pages/project-search-page';
import { UserSarchPage } from '../pages/user-search-page';
import { Job } from '../model/job';

export class JobsCommand {

    constructor(private config: Configuration) {
    }

    public run() {
        this.collectJobsforUser(this.config);
    }

    public async collectJobsforUser(config: Configuration) {
        const nettime = new Nettime(config.url);
        try {
            await nettime.contact();
            await nettime.login(config.user, config.password);
            console.log('=================================================================');
            console.log('collecting jobs of user projects');
            const userSearch = new UserSarchPage(nettime);
            const userId = await userSearch.getUserId(config.user);
            const jobs = await this.collectJobsAsync(nettime, userId);
            console.log('-----------------------------------------------------------------');
            console.log(`found ${jobs.length} jobs`);
            jobs.forEach((job) => console.log(job.taskNumber.task, job.name));

        } catch (error) {
            console.log('-----------------------------------------------------------------');
            console.log('\x1b[1m\x1b[31m%s\x1b[0m', '... error', error);
        } finally {
            if (nettime.sessionCookie) {
                await nettime.logout();
            }
        }
    }

    private async collectJobsAsync(nettime: Nettime, userId: string): Promise<Job[]> {
        const projectSearchPage = new ProjectSearchPage(nettime);

        const info = await projectSearchPage.getProjectsForUser(userId);
        console.log(info);

        const projects = await projectSearchPage.getProjectIdsForUser(userId);
        const jobMap = await this.collectJobsForProjectList(projectSearchPage, projects);
        return jobMap;
    }

    private async collectJobsForProjectList(projectSearchPage: ProjectSearchPage, projectList: string[]): Promise<Job[]> {
        const promises = projectList.map((projectId) => this.collectJobsForProject(projectSearchPage, projectId));
        return this.flatJobs(await Promise.all(promises));
    }

    private async collectJobsForProject(projectSearchPage: ProjectSearchPage, projectId: string): Promise<Job[]> {
        const subjectIds = await projectSearchPage.getSubjectsIds(projectId);
        const jobPromises = subjectIds.map((subjectId) => projectSearchPage.getJobs(subjectId));
        return this.flatJobs(await Promise.all(jobPromises));
    }

    private flatJobs(jobListList: Job[][]): Job[] {
        const jobs: Job[] = [];
        jobListList.forEach((jobList) => {
            jobList.forEach((job) => jobs.push(job));
        });
        return jobs;
    }

    private async collectJobs(nettime: Nettime, userId: string): Promise<Job[]> {
        const projectSearchPage = new ProjectSearchPage(nettime);
        const jobs: Job[] = [];
        const projects = await projectSearchPage.getProjectIdsForUser(userId);
        console.log('projects', projects.length);
        for (const projectId of projects) {
            const subjectIds = await projectSearchPage.getSubjectsIds(projectId);
            console.log('subjectIds', subjectIds.length);
            for (const subjectId of subjectIds) {
                const subjectJobs = await projectSearchPage.getJobs(subjectId);
                console.log('collected', subjectId, subjectJobs.length);
                subjectJobs.forEach((job) => jobs.push(job));
            }
        }
        return jobs;
    }
}
