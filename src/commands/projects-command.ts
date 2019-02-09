import { Configuration } from '../commands';
import { Nettime, OperationResult } from '../nettime';
import { ProjectSearchPage } from '../pages/project-search-page';
import { UserSarchPage } from '../pages/user-search-page';

export class ProjectsCommand {

    constructor(private config: Configuration) {
    }

    public run() {
        this.makeBooking(this.config);
    }

    public async makeBooking(config: Configuration) {
        const nettime = new Nettime(config.url);
        try {
            await nettime.contact();
            await nettime.login(config.user, config.password);

            const userSearch = new UserSarchPage(nettime);
            const userId = await userSearch.getUserId(config.user);

            const projectSearchPage = new ProjectSearchPage(nettime);

            const projects = await projectSearchPage.getProjectIdsForUser(userId);
            projects.forEach(async (projectId) => {
                const subjectIds = await projectSearchPage.getSubjectsIds(projectId);
                subjectIds.forEach(async (subjectId) => {
                    const jobs = await projectSearchPage.getJobs(subjectId);
                    jobs.forEach((job) => console.log(job));
                });
            });
        } catch (error) {
            console.log('-----------------------------------------------------------------');
            console.log('\x1b[1m\x1b[31m%s\x1b[0m', '... error', error);
        } finally {
            // if (nettime.sessionCookie) {
            //     await nettime.logout();
            // }
        }
    }
}
