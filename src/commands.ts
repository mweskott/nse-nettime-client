import { Nettime, OperationResult } from "./nettime";
import { ZeitkontierungPage } from "./pages/zeitkontierung-page";
import fs = require("fs");
import path = require("path");
import os = require("os");
import * as readline from "readline";
import {logger} from "./logger";

export class Alias {
    [header: string]: string;
}

// tslint:disable-next-line:max-classes-per-file
export class Configuration {
    public static createConfigurationFromFile(filename: string): Configuration {
        let cfg = new Configuration();
        const configurationFile = filename || path.join(os.homedir(), ".nettime.json");
        if (!fs.existsSync(configurationFile)) {
            logger.error("no configuration file found at %s", configurationFile);
            return cfg;
        }
        try {
            logger.debug("reading configuration from file %s", configurationFile);
            const contents = fs.readFileSync(configurationFile);
            const fileConfiguration = JSON.parse(contents.toString());
            Object.assign(cfg, fileConfiguration);
        } catch (e) {
            logger.error("cannot read configuration file ", filename, e);
        }
        return cfg;
    }

    public static writeConfigurationToFile(cfg: Configuration, filename: string) {
        const configurationFile = filename || path.join(os.homedir(), ".nettime.json");
        logger.info("writing configuration to file %s", configurationFile);
        fs.writeFileSync(configurationFile, JSON.stringify(cfg));
    }

    public url: string;
    public user: string;
    public password: string;
    public tracing: boolean = false;
    public alias: Alias = new Alias();

    public resolveAlias(name: string) {
        if (!this.alias) {
            return name;
        }
        return this.alias[name] || name;
    }
}

export class BookingCommandData {
    public config: Configuration;
    public bookings: BookingData[];
}

export interface BookingData {
    config: Configuration;
    task: string;
    date: string;
    timeStart: string;
    timeEnd: string;
    message: string;
}

// tslint:disable-next-line:max-classes-per-file
export class BookingCommand {

    constructor(private bookingCommandData: BookingCommandData) {
    }

    public run() {
        this.makeBooking(this.bookingCommandData);
    }

    public async makeBooking(bookingCommands: BookingCommandData) {
        const nettime = new Nettime(bookingCommands.config.url, bookingCommands.config.tracing);
        try {
            await nettime.contact();
            await nettime.login(bookingCommands.config.user, bookingCommands.config.password);
            for (const booking of bookingCommands.bookings) {
                const resolvedTask = bookingCommands.config.resolveAlias(booking.task);
                await this.executeBookingOperation(resolvedTask, booking, nettime);
            }
        } catch (error) {
            logger.debug("-----------------------------------------------------------------");
            logger.error("\x1b[1m\x1b[31m%s\x1b[0m", "... error", error.error);
        } finally {
            if (nettime.sessionCookie) {
                await nettime.logout();
            }
        }
    }

    private async executeBookingOperation(resolvedTask: string, booking: BookingData, nettime: Nettime) {
        try {
            logger.info(`booking operation: ${resolvedTask}(${booking.task}) ${booking.date} ${booking.timeStart}-${booking.timeEnd} \"${booking.message}\"`);
            if (!!resolvedTask && !!booking.date && !!booking.timeStart && !!booking.timeEnd) {
                const bookingPage = new ZeitkontierungPage(nettime);
                const bookingResult = await bookingPage.buchen(resolvedTask, booking.date,
                    booking.timeStart, booking.timeEnd, booking.message);
                logger.debug("-----------------------------------------------------------------");
                logger.debug("\x1b[32m%s\x1b[0m", "... OK");
            } else {
                logger.error("Error: booking operation not executed due to missing data!");
            }
        } catch (error) {
            logger.error("Error in booking operation:", error.error);
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
        const nettime = new Nettime(config.url, config.tracing);
        try {
            await nettime.contact();
            await nettime.login(config.user, config.password);
            let bookingPage = new ZeitkontierungPage(nettime);
            await bookingPage.ansicht();
            logger.debug("-----------------------------------------------------------------");
            for(let booking of bookingPage.editableBookingList) {
                logger.info(booking);
            }
            logger.info(bookingPage.getTaskOverview());
        }
        catch (error) {
            logger.debug("-----------------------------------------------------------------");
            logger.error("\x1b[1m\x1b[31m%s\x1b[0m", "... error", error);
        }
        finally {
            if (nettime.sessionCookie) {
                await nettime.logout();
            }
        }
    }
}
