import * as cheerio from 'cheerio';
import { Configuration } from '../commands';
import { Nettime, OperationResult } from '../nettime';
import { TaskNumber } from '../task-number';

export class ProjekteCommand {

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
            const userId = await nettime.getUserId(config.user);
            console.log('UserId', userId);

            // const projects = await this.getProjectIds(nettime, userId);
            // console.log(projects);

            // const subjects = await this.getSubjectsIds(nettime, '27');
            // console.log('subjects', subjects);

            const projects = await this.getProjectIds(nettime, userId);
            projects.forEach(async (projectId) => {
                console.log(`${projectId}`);
                const subjectIds = await this.getSubjectsIds(nettime, projectId);
                subjectIds.forEach(async (subjectId) => {
                    console.log(`  ${subjectId}`);
                    const tasks = await this.getTasks(nettime, subjectId);
                    console.log('-----------------------------------------------------------------');
                    console.log(projectId, subjectId);
                    tasks.forEach((task) => console.log(task));
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

    private async getProjectIds(nettime: Nettime, userId: string): Promise<string[]> {
        const res = await nettime.get(`/asp/nt_projekt_l.asp?RetFields==&QMode=1&QModeKey=${userId}`);

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

            console.log(`${id} ${projekt} ${bezeichnung} ${kunde}`);
        });
        return ids;
    }

    private async getSubjectsIds(nettime: Nettime, projectId: string): Promise<string[]> {
        const res = await nettime.get(`/asp/nt_thema_l.asp?RetFields==&QMode=0&QModeKey=${projectId}`);

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

    private async getTasks(nettime: Nettime, subjectId: string): Promise<TaskNumber[]> {
        const res = await nettime.get(`/asp/nt_Kompart_l.asp?RetFields===&QMode=0&QModeKey=${subjectId}`);

        const $ = cheerio.load(res.data);
        const projektElemente = $('tr[id]');

        const tasks: TaskNumber[] = [];
        projektElemente.each((index, element) => {
            const id = element.attribs.id.substring(7);
            const columns = $(element).find('td');
            const job = $(columns[1]).text();
            tasks.push(new TaskNumber(job));
            const bezeichnung = $(columns[2]).text();
            const kind = $(columns[3]).text();

            // console.log(`${id} ${job} ${bezeichnung} ${kind}`);
        });
        return tasks;
    }

}
