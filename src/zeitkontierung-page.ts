import { Nettime } from "./nettime";
import { ProjectNumber } from "./project-number";
const querystring = require('querystring');
import fs = require('fs');




export class ZeitkontierungPage {

    constructor(public nettime: Nettime) {
    }

    public buchen(target: string, date: string, timeStart: string, timeEnd: string) : Promise<ZeitkontierungPage> {
        return new Promise<ZeitkontierungPage>((resolve, reject) => {
            this.ansicht().then((bookingPage) => {
                bookingPage.aktualisieren(target).then((bookingPage) => {
                    bookingPage.speichern(target, date, timeStart, timeEnd).then((bookingPage) => {
                        resolve(this);
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
                fs.writeFile("ansicht.html", res.data, null, () => {
                    resolve(this);
                });
            });
        });
    }

    public aktualisieren(target: string) : Promise<ZeitkontierungPage> {
        console.log("=================================================================");
        console.log("aktualisieren");

        let projectNumber = new ProjectNumber(target);
        let project = projectNumber.getProject();

        var data = querystring.stringify({
            "F_Aktual": "Aktualisieren",

            "F_PId": project,
        });

        return new Promise<ZeitkontierungPage>((resolve, reject) => {
            this.nettime.post("/asp/nt_zeitkontierung.asp", data).then((res) => {
              fs.writeFile("aktualisieren.html", res.data, null, () => {
                resolve(this);
              });
            });
        });
    }

    public speichern(target: string, date: string, timeStart: string, timeEnd: string) : Promise<ZeitkontierungPage> {
        console.log("=================================================================");
        console.log("speichern");

        let targetNumber = new ProjectNumber(target);
        let targetProject = targetNumber.getProject();
        let targetWorkItem = targetNumber.getWorkItem();

        var data = querystring.stringify({
            "F_Speichern": "Speichern",

            "F_PId": targetProject,
            "F_ThId": targetWorkItem,
            "F_KAId": target,

            "F_VonDat": date,
            "F_VonZeit": timeStart,
            "F_BisZeit": timeEnd,

            // "F_Pausebuchen": "True",
            // "F_VonPause": "12:00",
            // "F_BisPause": "13:00",
        });

        return new Promise<ZeitkontierungPage>((resolve, reject) => {
            this.nettime.post("/asp/nt_zeitkontierung.asp", data).then((res) => {
              fs.writeFile("speichern.html", res.data, null, () => {
                resolve(this);
              });
            });
        });
    }



}