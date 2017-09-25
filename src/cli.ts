import * as program from "commander";
import { Nettime } from "./nettime";
import { ZeitkontierungPage } from "./zeitkontierung-page";



program
  .option('--url <url>', 'Nettime server URL')
  .option('-u, --user <login>', 'User login')
  .option('-p, --password <password>', 'Password');

program
  .command('book [number] [date] [timeStart] [timeEnd]')
  .description('submit booking')
  .action((number: string, date: string, timeStart: string, timeEnd: string) => {

    let url = program.url;
    let user = program.user;
    let password = program.password;

    console.log("book", url, user, password);
    console.log("book", number, date, timeStart, timeEnd);


    let nettime = new Nettime(program.url);
    nettime.contact().then(result => {
      console.log("contact then", result);
      result.login(program.user, program.password).then(result => {
        console.log("login then", result);

        let bookingPage = new ZeitkontierungPage(result);
        bookingPage.buchen(number, date, timeStart, timeEnd).then((page) => {
          console.log("... gebucht");
        });
      });
    });


  });


program
  .command("test")
  .description('make booking')
  .action(() => {
    console.log("book");
  });



program.parse(process.argv);
