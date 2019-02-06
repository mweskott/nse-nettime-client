#!/usr/bin/env node

import * as program from 'commander';
import os = require('os');
import * as prompt from 'prompt-sync';
import { Booking, BookingCommand, Configuration, ListCommand } from './commands';

function inputPassword(username: string) {
  return prompt()(`enter password for user ${username}: `, {echo: '.'});
}

program
  .option('--url <url>', 'Nettime server URL')
  .option('-u, --user <login>', 'User login')
  .option('-p, --password <password>', 'Password')
  .option('-c, --config <configFile>', 'Configuration file');

program
  .command('book <task> <date> <timeStart> <timeEnd>')
  .description('submit booking')
  .action(async (task: string, date: string, timeStart: string, timeEnd: string) => {
    const config = Configuration.createConfigurationFromFile(program.config);
    config.url = program.url || config.url;
    config.user = program.user || config.user || os.userInfo().username;
    config.password = program.password || config.password;

    if (!config.password) {
      config.password = inputPassword(config.user);
    }

    const booking = new Booking();
    booking.config = config;
    booking.task = task;
    booking.date = date;
    booking.timeStart = timeStart;
    booking.timeEnd = timeEnd;

    console.log(booking);
    await new BookingCommand(booking).run();
  });

program
  .command('list')
  .description('list all editable bookings')
  .action(async () => {
    const config = Configuration.createConfigurationFromFile(program.config);
    config.url = program.url || config.url;
    config.user = program.user || config.user;
    config.password = program.password || config.password;

    if (!config.password) {
      config.password = inputPassword(config.user);
    }
    new ListCommand(config).run();
  });

program
  .command('alias')
  .description('list task number aliases')
  .action(() => {
    const cfg = Configuration.createConfigurationFromFile(program.config);
    if (cfg.alias) {
      Object.keys(cfg.alias).forEach((name) => {
        console.log(name, cfg.alias[name]);
      });
    }
  });

// async main
(async () => {
  program.parse(process.argv);
})();
