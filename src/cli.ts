#!/usr/bin/env node

import * as program from "commander";
import { Nettime } from "./nettime";
import { ZeitkontierungPage } from "./zeitkontierung-page";
import fs = require('fs');
import * as readline from 'readline';

class Configuration {
  url: string;
  username: string;
  password: string;
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

    let cfg = new Configuration();
    if (program.config) {
      var contents = fs.readFileSync(program.config);
      cfg = JSON.parse(contents.toString());
    }

    cfg.url = program.url || cfg.url;
    cfg.username = program.user || cfg.username;
    cfg.password = program.password || cfg.password;

    console.log("config", cfg);
    console.log("parameter", task, date, timeStart, timeEnd);

    let booker = new BookingCommand();
    booker.config = cfg;
    booker.task = task;
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

class BookingCommand {
  public config: Configuration;
  public task: string;
  public date: string;
  public timeStart: string;
  public timeEnd: string;

  public makeBooking() {
    let nettime = new Nettime(this.config.url);
    if(!!this.task && !!this.date && !!this.timeStart && !!this.timeEnd) {
      nettime.contact().then(result => {
        console.log("contact then", result);
        result.login(this.config.username, this.config.password).then(result => {
          console.log("login then", result);

          let bookingPage = new ZeitkontierungPage(result);
          bookingPage.buchen(this.task, this.date, this.timeStart, this.timeEnd).then((page) => {
            console.log("... gebucht");
          });
        });
      });
    }
  }
}

program
  .command("test")
  .description('make booking')
  .action(() => {
    console.log("book");
  });



program.parse(process.argv);
