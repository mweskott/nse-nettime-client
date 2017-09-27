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

class BookingCommand {
  public config: Configuration;
  public task: string;
  public date: string;
  public timeStart: string;
  public timeEnd: string;

  public async makeBooking() {
    if (!this.config.password) {
      this.config.password = await this.promptForPassword();
    }
    let resolvedTask = this.config.resolveAlias(this.task);
    if (!!resolvedTask && !!this.date && !!this.timeStart && !!this.timeEnd) {
      try {
        let nettime = new Nettime(this.config.url);
        await nettime.contact();
        await nettime.login(this.config.user, this.config.password);
        let bookingPage = new ZeitkontierungPage(nettime);
        await bookingPage.buchen(resolvedTask, this.date, this.timeStart, this.timeEnd);
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

    let booker = new BookingCommand();
    booker.config = cfg;
    booker.task = task;
    booker.date = date;
    booker.timeStart = timeStart;
    booker.timeEnd = timeEnd;

    console.log(booker);
    booker.makeBooking();
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

