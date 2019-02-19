import * as cheerio from 'cheerio';
import { Job } from '../model/job';
import { TaskInfo } from '../model/task-info';
import { Nettime } from '../nettime';
import { TaskNumber } from '../task-number';

export class ProjectSearchPage {

    constructor(public nettime: Nettime) {
    }

    public async getProjectIdsForUser( userId: string): Promise<string[]> {
        const res = await this.nettime.get(`/asp/nt_projekt_l.asp?RetFields==&QMode=1&QModeKey=${userId}`);

        const $ = cheerio.load(res.data);
        const projektElemente = $('tr[id]');

        const ids: string[] = [];
        projektElemente.each((index, element) => {
            const id = element.attribs.id.substring(7);
            ids.push(id);
            const columns = $(element).find('td');
            const projekt = $(columns[1]).text();
            const bezeichnung = $(columns[2]).text();
            const kunde = $(columns[3]).text();

            // console.log(`${id} ${projekt} ${bezeichnung} ${kunde}`);
        });
        return ids;
    }

    public async getProjectsForUser(userId: string): Promise<TaskInfo[]> {
        const res = await this.nettime.get(`/asp/nt_projekt_l.asp?RetFields==&QMode=1&QModeKey=${userId}`);

        const $ = cheerio.load(res.data);
        const projektElemente = $('tr[id]');

        const projects: TaskInfo[] = [];
        projektElemente.each((index, element) => {
            const id = element.attribs.id.substring(7);
            const columns = $(element).find('td');
            const projekt = $(columns[1]).text();
            const projectNumber = new TaskNumber(projekt);
            const bezeichnung = $(columns[2]).text();
            const kunde = $(columns[3]).text();
            const taskInfo = new TaskInfo(projectNumber, bezeichnung, id);
            projects.push(taskInfo);
            // console.log(`${id} ${projekt} ${bezeichnung} ${kunde}`);
        });
        return projects;
    }

    public async getSubjectsIds(projectId: string): Promise<string[]> {
        const res = await this.nettime.get(`/asp/nt_thema_l.asp?RetFields==&QMode=0&QModeKey=${projectId}`);

        const $ = cheerio.load(res.data);
        const projektElemente = $('tr[id]');

        const ids: string[] = [];
        projektElemente.each((index, element) => {
            const id = element.attribs.id.substring(7);
            ids.push(id);
            const columns = $(element).find('td');
            const subject = $(columns[1]).text();
            const bezeichnung = $(columns[2]).text();

            // console.log(`${id} ${subject} ${bezeichnung}`);
        });
        return ids;
    }

    public async getJobs(subjectId: string): Promise<Job[]> {
        const res = await this.nettime.get(`/asp/nt_Kompart_l.asp?RetFields===&QMode=0&QModeKey=${subjectId}`);

        const $ = cheerio.load(res.data);
        const projektElemente = $('tr[id]');

        const jobs: Job[] = [];
        projektElemente.each((index, element) => {
            const id = element.attribs.id.substring(7);
            const columns = $(element).find('td');
            const jobNumber = $(columns[1]).text();
            const taskNumber = new TaskNumber(jobNumber);
            const bezeichnung = $(columns[2]).text();
            jobs.push(new Job(taskNumber, bezeichnung));
            const kind = $(columns[3]).text();

            // console.log(`${id} ${job} ${bezeichnung} ${kind}`);
        });
        return jobs;
    }
}
