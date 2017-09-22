import * as http from "http";
import * as https from "https";
import { URL } from "url";
import querystring = require('querystring');
import fs = require('fs');




class RequestResult {
  public message: http.IncomingMessage;
  public data: string;
}



export class Nettime {

  public sessionCookie: string[];

  constructor(public url: string)  {
  }

  public login(user: string, password: string): Promise<Nettime> {
    console.log("=================================================================");
    console.log("login");

    var data = querystring.stringify({
          "F_Login": "Login",
          "F_MandantenNr": "BFFS",
          "F_Passwort": password,
          "F_UNr": user
        });
    return new Promise<Nettime>((resolve, reject) => {
      this.post("/asp/nt_anmeldung.asp?ProgId=0", data).then((res) => {
        fs.writeFile("login.html", res.data, null, null);
        resolve(this);
      });
    });
  }


  public contact(): Promise<Nettime> {
    console.log("=================================================================");
    console.log("contact");

    return new Promise<Nettime>((resolve, reject) => {
      this.get("/").then((res) => {
        this.sessionCookie = <string[]>res.message.headers["set-cookie"];
        resolve(this);
      });
    });
  }

  private get(path: string): Promise<RequestResult> {

    let url = new URL(this.url);
    return new Promise<RequestResult>((resolve, reject) => {
      let options: http.RequestOptions = {
        hostname: url.hostname,
        port: url.port,
        path: path,
        method: 'GET'
      };
      if (this.sessionCookie) {
        options.headers["Cookie"] = this.sessionCookie;
      }

      let req = https.request(options, (res: http.IncomingMessage) => {
        let rawData = "";
        res.on('data', (d) => {
          rawData += d;
        });
        res.on('end', () => {
          resolve(<RequestResult>{
            message: res,
            data: rawData
          });
        });
      });
      req.end();
    });
  }

  private post(path: string, data: string): Promise<RequestResult> {
    return new Promise<RequestResult>((resolve, reject) => {
      let url = new URL(this.url);
      let options: http.RequestOptions = {
        hostname: url.hostname,
        port: url.port,
        path: path,
        method: 'POST',
        headers: {
          "Content-Type": 'application/x-www-form-urlencoded'
        }
      };
      if (this.sessionCookie) {
        options.headers["Cookie"] = this.sessionCookie;
      }
      options.headers["Content-Length"] = Buffer.byteLength(data);

      let req = https.request(options, (res: http.IncomingMessage) => {
        let rawData = "";
        res.on('data', (d) => {
          rawData += d;
        });
        res.on('end', () => {
          resolve(<RequestResult>{
            message: res,
            data: rawData
          });
        });
      });
      req.write(data);
      req.end();
    });
  }

}
