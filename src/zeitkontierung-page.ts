import { Nettime } from "./nettime";
const querystring = require('querystring');
import fs = require('fs');




export class ZeitkontierungPage {

    constructor(public nettime: Nettime) {
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

    public buchen() : Promise<ZeitkontierungPage> {
        return new Promise<ZeitkontierungPage>((resolve, reject) => {
            this.ansicht().then((bookingPage) => {
                bookingPage.aktualisieren().then((bookingPage) => {
                    bookingPage.speichern().then((bookingPage) => {
                        resolve(this);
                    })
                })
            })
        });
    }

    public aktualisieren() : Promise<ZeitkontierungPage> {
        console.log("=================================================================");
        console.log("aktualisieren");

        var data = querystring.stringify({
            "F_Aktual": "Aktualisieren",

            "F_PId": "000970.02",
        });

        return new Promise<ZeitkontierungPage>((resolve, reject) => {
            this.nettime.post("/asp/nt_zeitkontierung.asp", data).then((res) => {
              fs.writeFile("aktualisieren.html", res.data, null, null);
              resolve(this);
            });
        });
    }

    public speichern() : Promise<ZeitkontierungPage> {
        console.log("=================================================================");
        console.log("speichern");

        var data = querystring.stringify({
            "F_Speichern": "Speichern",

            "F_PId": "000970.02",
            "F_ThId": "000970.02.23",
            "F_KAId": "000970.02.23.02",

            "F_VonDat": "25.09.2017",
            "F_VonZeit": "07:00",
            "F_BisZeit": "16:00",

            "F_Pausebuchen": "True",
            "F_VonPause": "12:00",
            "F_BisPause": "13:00",
        });

        return new Promise<ZeitkontierungPage>((resolve, reject) => {
            this.nettime.post("/asp/nt_zeitkontierung.asp", data).then((res) => {
              fs.writeFile("speichern.html", res.data, null, null);
              resolve(this);
            });
        });
    }



}