import { Nettime, OperationResult } from "./nettime";
import { ZeitkontierungPage } from "./pages/zeitkontierung-page";
import fs = require('fs');
import path = require('path');
import os = require('os');
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
        const configurationFile = filename || path.join(os.homedir(), '.nettime.json');
        if (!fs.existsSync(configurationFile)) {
            console.log("no configuration file found at %s", configurationFile);
            return cfg;
        }
        try {
            console.log("reading configuration from file %s", configurationFile);
            var contents = fs.readFileSync(configurationFile);
            let fileConfiguration = JSON.parse(contents.toString());
            Object.assign(cfg, fileConfiguration);
        }
        catch (e) {
            console.log("cannot read configuration file ", filename, e);
        }
        return cfg;
    }

    public resolveAlias(name: string) {
        if (!this.alias) return name;
        return this.alias[name] || name;
    }
}

export class BookingCommandData {
    public config: Configuration;
    public bookings: BookingData[];
}

export class BookingData {
    public config: Configuration;
    public task: string;    
    public date: string;
    public timeStart: string;
    public timeEnd: string;
}

// tslint:disable-next-line:max-classes-per-file
export class BookingCommand {

    constructor(private bookingCommandData: BookingCommandData) {
    }

    public run() {
        this.makeBooking(this.bookingCommandData);
    }

    public async makeBooking(bookingCommands: BookingCommandData) {
        const nettime = new Nettime(bookingCommands.config.url);
        try {
            await nettime.contact();
            await nettime.login(bookingCommands.config.user, bookingCommands.config.password);
            for (const booking of bookingCommands.bookings) {
                const resolvedTask = bookingCommands.config.resolveAlias(booking.task);
                if (!!resolvedTask && !!booking.date && !!booking.timeStart && !!booking.timeEnd) {
                    const bookingPage = new ZeitkontierungPage(nettime);
                    const bookingResult = await bookingPage.buchen(resolvedTask, booking.date, booking.timeStart, booking.timeEnd);
                    console.log('-----------------------------------------------------------------');
                    console.log('\x1b[32m%s\x1b[0m', '... OK');
                }
            }
        } catch (error) {
            console.log('-----------------------------------------------------------------');
            console.log('\x1b[1m\x1b[31m%s\x1b[0m', '... error', error);
        } finally {
            if (nettime.sessionCookie) {
                await nettime.logout();
            }
        }
    }
}


export class ListCommand {
    
        constructor(private config: Configuration) {
        }
    
        public run() {
            this.makeBooking(this.config);
        }
    
        public async makeBooking(config: Configuration) {
            let nettime = new Nettime(config.url);
            try {
                await nettime.contact();
                await nettime.login(config.user, config.password);
                let bookingPage = new ZeitkontierungPage(nettime);
                await bookingPage.ansicht();
                console.log("-----------------------------------------------------------------");
                for(let booking of bookingPage.editableBookingList) {
                    console.log(booking);    
                }
                console.log(bookingPage.getTaskOverview());
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
