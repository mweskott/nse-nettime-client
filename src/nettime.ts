import * as http from "http";
import * as https from "https";
import { URL } from "url";
import querystring = require('querystring');
import fs = require('fs');




export class RequestResult {
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

    let  data = {
      "F_Login": "Login",
      "F_MandantenNr": "BFFS",
      "F_Passwort": password,
      "F_UNr": user
    };
    return new Promise<Nettime>((resolve, reject) => {
      this.post("/asp/nt_anmeldung.asp?ProgId=0", data).then((res) => {
        fs.writeFile("login.html", res.data, null, () => {
          resolve(this);
        });
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

  public get(path: string): Promise<RequestResult> {

    let url = new URL(this.url);
    return new Promise<RequestResult>((resolve, reject) => {
      let options: http.RequestOptions = {
        hostname: url.hostname,
        port: url.port,
        path: path,
        method: 'GET',
        headers: {}
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

  public post(path: string, data: any): Promise<RequestResult> {
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
      let encodedData = querystring.stringify(data);

      options.headers["Content-Length"] = Buffer.byteLength(encodedData);

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
      req.write(encodedData);
      req.end();
    });
  }

}
