#!/usr/bin/env node

import { Command } from "commander";
import os = require("os");
import * as prompt from "prompt-sync";
import { BookingCommand, BookingCommandData, BookingData, Configuration, ListCommand } from "./commands";
import { JobsCommand } from "./commands/jobs-command";

function inputPassword(username: string) {
  return prompt()(`enter password for user ${username}: `, {echo: "."});
}

function getStartTime(interval: string): string {
  return interval.split("-")[0];
}

function getEndTime(interval: string): string {
  return interval.split("-")[1];
}

const program = new Command();
program
  .option("--url <url>", "Nettime server URL")
  .option("-u, --user <login>", "User login")
  .option("-p, --password <password>", "Password")
  .option("-c, --config <configFile>", "Configuration file")
    .option("--trace", "write server responses to files in current directory");

program
  .command("book <task> <date> <intervals...>")
  .description("submit booking")
  .action(async (task: string, date: string, intervals: string[]) => {
    const config = Configuration.createConfigurationFromFile(program.opts().config);
    config.url = program.opts().url || config.url;
    config.user = program.opts().user || config.user || os.userInfo().username;
    config.password = program.opts().password || config.password;

    if (!config.password) {
      config.password = inputPassword(config.user);
    }

    const commandData = new BookingCommandData();
    commandData.config = config;
    commandData.bookings = intervals.map((interval) => {
      const booking = new BookingData();
      booking.config = config;
      booking.task = task;
      booking.date = date;
      booking.timeStart = getStartTime(interval);
      booking.timeEnd = getEndTime(interval);
      console.log(booking);
      return booking;
    });

    await new BookingCommand(commandData).run();
  });

program
  .command("list")
  .description("list all editable bookings")
  .action(async () => {
    const config = Configuration.createConfigurationFromFile(program.opts().config);
    config.url = program.opts().url || config.url;
    config.user = program.opts().user || config.user;
    config.password = program.opts().password || config.password;

    if (!config.password) {
      config.password = inputPassword(config.user);
    }
    new ListCommand(config).run();
  });

program
  .command("jobs")
  .description("list all jobs with booking rights of the user")
  .action(async () => {
    const config = Configuration.createConfigurationFromFile(program.opts().config);
    config.url = program.opts().url || config.url;
    config.user = program.opts().user || config.user;
    config.password = program.opts().password || config.password;

    if (!config.password) {
      config.password = inputPassword(config.user);
    }
    new JobsCommand(config).run();
  });

program
  .command("alias [aliasname] [tasknumber]")
  .description("list task number aliases")
  .action((aliasname, tasknumber) => {
    const cfg = Configuration.createConfigurationFromFile(program.opts().config);

    if (tasknumber) {
      cfg.alias[aliasname] = tasknumber;
      console.log("setting alias entry", aliasname, cfg.alias[aliasname]);
      Configuration.writeConfigurationToFile(cfg, program.opts().config);
    } else if (aliasname) {
      console.log(`remove alias entry ${aliasname} ${cfg.alias[aliasname]}`);
      cfg.alias[aliasname] = undefined;
      Configuration.writeConfigurationToFile(cfg, program.opts().config);
    } else {
      if (cfg.alias) {
        Object.keys(cfg.alias).forEach((name) => {
          console.log(name, cfg.alias[name]);
        });
      }
    }
  });

// async main
(async () => {
  program.parse(process.argv);
})();
