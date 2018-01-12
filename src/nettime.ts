import * as http from "http";
import * as https from "https";
import { URL } from "url";
import querystring = require('querystring');
import fs = require('fs');


export class OperationResult {
  error: string;

  constructor(error?: string) {
    this.error = error;
  }
}

export class RequestResult {
  public message: http.IncomingMessage;
  public data: string;
}

export class Nettime {

  public sessionCookie: string[];
  private tracing: boolean = false;

  constructor(public url: string) {
  }

  public contact(): Promise<OperationResult> {
    console.log("=================================================================");
    console.log("contact");

    return new Promise<OperationResult>((resolve, reject) => {
      this.get("/").then((res) => {
        this.sessionCookie = <string[]>res.message.headers["set-cookie"];
        resolve(new OperationResult());
      }).catch((result) => {
        reject(new OperationResult("contact failed"));
      })
    });
  }

  public login(user: string, password: string): Promise<OperationResult> {
    console.log("=================================================================");
    console.log("login");

    let data = {
      "F_Login": "Login",
      "F_MandantenNr": "BFFS",
      "F_Passwort": password,
      "F_UNr": user
    };
    return new Promise<OperationResult>((resolve, reject) => {
      this.post("/asp/nt_anmeldung.asp?ProgId=0", data).then((result) => {
        this.traceResponse("login.html", result.data);

        if (result.data.includes("Sie wurden erfolgreich angemeldet.")) {
          resolve(new OperationResult());
        } else {
          reject(new OperationResult("login failed"));
        }
      });
    });
  }

  public logout(): Promise<OperationResult> {
    console.log("=================================================================");
    console.log("logout");

    return new Promise<OperationResult>((resolve, reject) => {
      this.get("/asp/nt_abmelden.asp").then((res) => {
        resolve(new OperationResult());
      });
    });
  }

  public traceResponse(name: string, data: any) {
    if (this.tracing)
      fs.writeFileSync(name, data);
  }

  public traceResponseError(name: string, data: any) {
      fs.writeFileSync(name, data);
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
