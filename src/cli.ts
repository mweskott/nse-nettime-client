import * as program from "commander";
import { Nettime } from "./nettime";



program
  .option('--url <url>', 'Nettime server URL')
  .option('-u, --user <login>', 'User login')
  .option('-p, --password <password>', 'Password');

program
  .command('login')
  .description('first command test')
  .action(() => {

    let url = program.url;
    let user = program.user;
    let password = program.password;

    console.log("login", url, user, password);


    let nettime = new Nettime(program.url);

    nettime.contact().then(result => {
      console.log("contact then", result);
      result.login(program.user, program.password).then(result => {
        console.log("login then", result);
      });
    });


  });


program
  .command("book")
  .description('make booking')
  .action(() => {
    console.log("book");
  });



program.parse(process.argv);
