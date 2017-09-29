import { Nettime, OperationResult } from "./nettime";
import { TaskNumber } from "./task-number";
const querystring = require('querystring');
import fs = require('fs');

import * as cheerio from "cheerio";

export class EditableBooking {
    public id: string;
    public task: string;
    public date: string;
    public timeStart: string;
    public timeEnd: string;
}

export class ZeitkontierungPage {

    public editableBookingList: EditableBooking[] = [];

    constructor(public nettime: Nettime) {
    }

    public buchen(target: string, date: string, timeStart: string, timeEnd: string) : Promise<OperationResult> {
        return new Promise<OperationResult>((resolve, reject) => {
            this.ansicht().then((bookingPage) => {
                bookingPage.aktualisieren(target).then((bookingPage) => {
                    bookingPage.speichern(target, date, timeStart, timeEnd).then((htmlResponse) => {
                        if (htmlResponse.includes("Ihre Eingaben wurden erfolgreich gespeichert.")) {
                            resolve(<OperationResult>{});
                        }
                        if (htmlResponse.includes(" Eingabe in Nummernfeld!"))
                            reject({error: "Ungültige Eingabe in Nummernfeld!"});
                        if (htmlResponse.includes("sich mit einer bereits erfassten Zeit!"))
                            reject({error: "Die eingegebene Zeit überschneidet sich mit einer bereits erfassten Zeit!"});
                        reject({error: "unknown error"});
                    })
                })
            })
        });
    }

    public ansicht() : Promise<ZeitkontierungPage> {
        console.log("=================================================================");
        console.log("ansicht");
              
        return new Promise<ZeitkontierungPage>((resolve, reject) => {
            this.nettime.get("/asp/nt_zeitkontierung.asp").then((res) => {
                fs.writeFileSync("ansicht.html", res.data);
                this.parseEditableBookings(res.data);
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
            editable.task = $(columns[6]).text();
            this.editableBookingList.push(editable);
        });
    }

    public aktualisieren(target: string) : Promise<ZeitkontierungPage> {
        console.log("=================================================================");
        console.log("aktualisieren");

        let taskNumber = new TaskNumber(target);

        var data = {
            "F_Aktual": "Aktualisieren",
            "F_PId": taskNumber.getProject(),
        };

        return new Promise<ZeitkontierungPage>((resolve, reject) => {
            this.nettime.post("/asp/nt_zeitkontierung.asp", data).then((res) => {
              fs.writeFile("aktualisieren.html", res.data, null, () => {
                resolve(this);
              });
            });
        });
    }

    public speichern(target: string, date: string, timeStart: string, timeEnd: string) : Promise<string> {
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
              fs.writeFile("speichern.html", res.data, null, () => {
                resolve(res.data);
              });
            });
        });
    }



}