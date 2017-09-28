import { Nettime, OperationResult } from "./nettime";
import { ZeitkontierungPage } from "./zeitkontierung-page";
import fs = require('fs');
import * as readline from 'readline';


export class Alias {
    [header: string]: string;
}

export class Configuration {
    public url: string;
    public user: string;
    public password: string;
    public alias: Alias;

    public static createConfigurationFromFile(filename: string) {
        let cfg = new Configuration();
        let configurationFile = filename || "nettime.json";
        if (fs.existsSync(configurationFile)) {
            try {
                console.log("reading configuration from file %s", configurationFile);
                var contents = fs.readFileSync(configurationFile);
                let fileConfiguration = JSON.parse(contents.toString());
                Object.assign(cfg, fileConfiguration);
            }
            catch (e) {
                console.log("cannot read configuration file ", filename, e);
            }
        }
        return cfg;
    }

    public resolveAlias(name: string) {
        if (!this.alias) return name;
        return this.alias[name] || name;
    }
}

export class Booking {
    public config: Configuration;
    public task: string;
    public date: string;
    public timeStart: string;
    public timeEnd: string;
}


export class BookingCommand {

    constructor(private booking: Booking) {
    }

    public run() {
        this.makeBooking(this.booking);
    }

    public async makeBooking(booking: Booking) {
        let resolvedTask = booking.config.resolveAlias(booking.task);
        if (!!resolvedTask && !!booking.date && !!booking.timeStart && !!booking.timeEnd) {
            let nettime = new Nettime(booking.config.url);
            try {
                await nettime.contact();
                await nettime.login(booking.config.user, booking.config.password);
                let bookingPage = new ZeitkontierungPage(nettime);
                await bookingPage.buchen(resolvedTask, booking.date, booking.timeStart, booking.timeEnd);
                console.log("-----------------------------------------------------------------");
                console.log("\x1b[32m%s\x1b[0m", "... OK");
            }
            catch (error) {
                console.log("-----------------------------------------------------------------");
                console.log("\x1b[1m\x1b[31m%s\x1b[0m", "... error", error);
            }
            finally {
                if (nettime.sessionCookie) {
                    await nettime.logout();
                }
            }
        }
    }
}



export async function promptForPassword(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter your nettime password! ', (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}
