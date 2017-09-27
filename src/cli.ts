#!/usr/bin/env node

import * as program from "commander";
import { Nettime, OperationResult } from "./nettime";
import { ZeitkontierungPage } from "./zeitkontierung-page";
import fs = require('fs');
import * as readline from 'readline';

class Alias {
  [header: string]: string;
}

class Configuration {
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

class Booking {
  public config: Configuration;
  public task: string;
  public date: string;
  public timeStart: string;
  public timeEnd: string;
}

class BookingCommand {

  constructor(private booking: Booking) {
  }

  public run() {
    this.makeBooking(this.booking);
  }

  public async makeBooking(booking: Booking) {
    if (!booking.config.password) {
      booking.config.password = await this.promptForPassword();
    }
    let resolvedTask = booking.config.resolveAlias(booking.task);
    if (!!resolvedTask && !!booking.date && !!booking.timeStart && !!booking.timeEnd) {
      try {
        let nettime = new Nettime(booking.config.url);
        await nettime.contact();
        await nettime.login(booking.config.user, booking.config.password);
        let bookingPage = new ZeitkontierungPage(nettime);
        await bookingPage.buchen(resolvedTask, booking.date, booking.timeStart, booking.timeEnd);
        console.log("=================================================================");
        console.log("\x1b[32m%s\x1b[0m", "... OK");
      }
      catch (error) {
        console.log("=================================================================");
        console.log("\x1b[1m\x1b[31m%s\x1b[0m", "... error", error);
      }
    }
  }

  private async promptForPassword(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question('Enter your nettime password? ', (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }
}



program
  .option('--url <url>', 'Nettime server URL')
  .option('-u, --user <login>', 'User login')
  .option('-p, --password <password>', 'Password')
  .option('-c, --config <configFile>', 'Configuration file');

program
  .command('book [task] [date] [timeStart] [timeEnd]')
  .description('submit booking')
  .action((task: string, date: string, timeStart: string, timeEnd: string) => {
    let cfg = Configuration.createConfigurationFromFile(program.config);

    cfg.url = program.url || cfg.url;
    cfg.user = program.user || cfg.user;
    cfg.password = program.password || cfg.password;

    let booking = new Booking();
    booking.config = cfg;
    booking.task = task;
    booking.date = date;
    booking.timeStart = timeStart;
    booking.timeEnd = timeEnd;

    console.log(booking);
    new BookingCommand(booking).run();
  });

program
  .command("alias")
  .description('list task number aliases')
  .action(() => {
    let cfg = Configuration.createConfigurationFromFile(program.config);
    if (cfg.alias) {
      Object.keys(cfg.alias).forEach((name) => {
        console.log(name, cfg.alias[name]);
      });
    }
  });


program.parse(process.argv);

