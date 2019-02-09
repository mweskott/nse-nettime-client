import * as cheerio from 'cheerio';
import { Nettime, OperationResult } from '../nettime';
import { TaskNumber } from '../task-number';

export class EditableBooking {
    public id: string;
    public task: string;
    public date: string;
    public timeStart: string;
    public timeEnd: string;
    public hours: number;
}

export class TaskOverview {
    public year: string;
    public month: string;
    public task: string;
    public hours: number;

    constructor(task: string) {
        this.task = task;
        this.hours = 0.0;
    }
}

// tslint:disable-next-line:max-classes-per-file
export class ZeitkontierungPage {

    public editableBookingList: EditableBooking[] = [];
    public bookingList: EditableBooking[] = [];

    constructor(public nettime: Nettime) {
    }

    public async buchen(target: string, date: string, timeStart: string, timeEnd: string): Promise<OperationResult> {
        return new Promise<OperationResult>(async (resolve, reject) => {
            const bookingPage = await this.ansicht();
            await bookingPage.aktualisieren(target);
            const htmlResponse = await bookingPage.speichern(target, date, timeStart, timeEnd);

            if (htmlResponse.includes('Ihre Eingaben wurden erfolgreich gespeichert.')) {
                resolve({} as OperationResult);
            }
            if (htmlResponse.includes(' Eingabe in Nummernfeld!')) {
                reject({error: 'Ungültige Eingabe in Nummernfeld!'});
            }
            if (htmlResponse.includes('sich mit einer bereits erfassten Zeit!')) {
                reject({error: 'Die eingegebene Zeit überschneidet sich mit einer bereits erfassten Zeit!'});
            }

            this.nettime.traceResponseError('buchen-error.html', htmlResponse);
            reject({error: 'unknown error'});
        });
    }

    public async ansicht() : Promise<ZeitkontierungPage> {
        console.log("=================================================================");
        console.log("ansicht");
              
        return new Promise<ZeitkontierungPage>((resolve, reject) => {
            this.nettime.get("/asp/nt_zeitkontierung.asp").then((res) => {
                this.nettime.traceResponse("ansicht.html", res.data);
                this.parseEditableBookings(res.data);
                this.parseBookings(res.data);
                resolve(this);
            });
        });
    }

    private parseEditableBookings(htmlText: string) {
        let $ = cheerio.load(htmlText);
        let editable = $("tr[id]");

        this.editableBookingList = [];
        editable.each((index, element) => {
            let editable = new EditableBooking();
            editable.id = element.attribs["id"].substring(7);
            let columns = $(element).find("td");
            editable.date = $(columns[2]).text();
            editable.timeStart = $(columns[3]).text();
            editable.timeEnd = $(columns[4]).text();
            let hoursText = $(columns[5]).text().replace(",", ".");
            editable.hours = Number.parseFloat(hoursText);
            editable.task = $(columns[6]).text();
            this.editableBookingList.push(editable);
        });
    }

    private parseBookings(htmlText: string) {
        let $ = cheerio.load(htmlText);
        let booking = $("tr[bgcolor]");

        this.bookingList = [];
        booking.each((index, element) => {
            let editable = new EditableBooking();
            let columns = $(element).find("td");
            editable.date = $(columns[2]).text();
            editable.timeStart = $(columns[3]).text();
            editable.timeEnd = $(columns[4]).text();
            let hoursText = $(columns[5]).text().replace(",", ".");
            editable.hours = Number.parseFloat(hoursText);
            editable.task = $(columns[6]).text();
            this.bookingList.push(editable);
        });
    }
    
    public getTaskOverview() : { [key:string]: TaskOverview[] } {
        let overview : { [key:string]: TaskOverview[] } = {};
        this.bookingList.forEach(bookingItem => {
            if(!overview[bookingItem.task]) {
                overview[bookingItem.task] = []; // new TaskOverview(item.task);
            }
            let taskOverview: TaskOverview = null;
            let bookingDateParts = bookingItem.date.split(".");
            overview[bookingItem.task].forEach(overviewItem => {
                if (bookingDateParts[1] === overviewItem.month && bookingDateParts[2] === overviewItem.year) {
                    taskOverview = overviewItem;
                }
            });
            if (!taskOverview) {
                taskOverview = new TaskOverview(bookingItem.task);
                taskOverview.month = bookingDateParts[1];
                taskOverview.year = bookingDateParts[2];
                overview[bookingItem.task].push(taskOverview);
            }
            taskOverview.hours += bookingItem.hours;
        })
        return overview;
    }

    public async aktualisieren(target: string) : Promise<ZeitkontierungPage> {
        console.log("=================================================================");
        console.log("aktualisieren");

        let taskNumber = new TaskNumber(target);

        var data = {
            "F_Aktual": "Aktualisieren",
            "F_PId": taskNumber.getProject(),
        };

        return new Promise<ZeitkontierungPage>((resolve, reject) => {
            this.nettime.post("/asp/nt_zeitkontierung.asp", data).then((res) => {
                this.nettime.traceResponse("aktualisieren.html", res.data);
                resolve(this);
            });
        });
    }

    public async speichern(target: string, date: string, timeStart: string, timeEnd: string) : Promise<string> {
        console.log("=================================================================");
        console.log("speichern");

        let taskNumber = new TaskNumber(target);

        var data = {
            "F_Speichern": "Speichern",

            "F_PId": taskNumber.getProject(),
            "F_ThId": taskNumber.getSubject(),
            "F_KAId": taskNumber.getTask(),

            "F_VonDat": date,
            "F_VonZeit": timeStart,
            "F_BisZeit": timeEnd,

            // "F_Pausebuchen": "True",
            // "F_VonPause": "12:00",
            // "F_BisPause": "13:00",
        };

        return new Promise<string>((resolve, reject) => {
            this.nettime.post("/asp/nt_zeitkontierung.asp", data).then((res) => {
                this.nettime.traceResponse("speichern.html", res.data);
                resolve(res.data);
            });
        });
    }



}