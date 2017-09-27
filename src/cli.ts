#!/usr/bin/env node

import * as program from "commander";
import { Nettime } from "./nettime";
import { ZeitkontierungPage, OperationResult } from "./zeitkontierung-page";
import fs = require('fs');
import * as readline from 'readline';

class Alias {
    [header: string]: string;
}

class Configuration {
  public url: string;
  public username: string;
  public password: string;
  public alias: Alias;

  public static createConfigurationFromFile(filename: string) {
    let cfg = new Configuration();
    if (filename) {
      var contents = fs.readFileSync(program.config);
      let fileConfiguration = JSON.parse(contents.toString());
      Object.assign(cfg, fileConfiguration);
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

  public makeBooking() {
    let nettime = new Nettime(this.config.url);
    if (!!this.task && !!this.date && !!this.timeStart && !!this.timeEnd) {
      nettime.contact().then(result => {
        result.login(this.config.username, this.config.password).then(result => {
          let bookingPage = new ZeitkontierungPage(result);
          bookingPage.buchen(this.task, this.date, this.timeStart, this.timeEnd)
            .then((result) => {
              console.log("... booked");
            })
            .catch((result) => {
              console.log("... error", result.error);
            })
        });
      });
    }
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
    cfg.username = program.user || cfg.username;
    cfg.password = program.password || cfg.password;

    console.log("config", cfg);
    console.log("parameter", task, date, timeStart, timeEnd);

    let booker = new BookingCommand();
    booker.config = cfg;
    booker.task = cfg.resolveAlias(task);
    booker.date = date;
    booker.timeStart = timeStart;
    booker.timeEnd = timeEnd;

    if (!booker.config.password) {
      let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('Enter your nettime password? ', (answer) => {
        rl.close();
        booker.config.password = answer;
        booker.makeBooking();
      });
    } else {
      booker.makeBooking();
    }
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

