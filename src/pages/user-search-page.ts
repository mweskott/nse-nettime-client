import * as cheerio from 'cheerio';
import { Nettime } from '../nettime';

export class UserSarchPage {

    constructor(public nettime: Nettime) {
    }

    public async getUserId(userName: string): Promise<string> {
        const res = await this.nettime.get(`/asp/nt_users_l.asp?SearchStr=${userName}&RetFields=F_UId=UNr`);
        this.nettime.traceResponse('findUser.html', res.data);
        const $ = cheerio.load(res.data);
        const userElements = $('tr[id]');
        if (userElements.length < 1) {
            return null;
        }
        return  userElements[0].attribs.id.substring(7);
    }
}
