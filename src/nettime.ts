import fs = require("fs");
import * as cheerio from "cheerio";
import * as http from "http";
import * as https from "https";
import querystring = require("querystring");
import { URL } from "url";
import { logger } from "./logger";
import {AxiosResponse} from "axios";
const axios = require("axios");

export class OperationResult {
  public error: string;

  constructor(error?: string) {
    this.error = error;
  }
}

export class RequestResult {
  // public message: http.IncomingMessage;
  public message: string;
  public data: string;
}

// tslint:disable-next-line:max-classes-per-file
export class Nettime {

  public sessionCookie: string;

  constructor(public url: string, private tracing?: boolean | false) {
  }

  public contact(): Promise<OperationResult> {
    logger.debug("=================================================================");
    logger.debug("contact");

    return new Promise<OperationResult>((resolve, reject) => {
      this.get("/").then((res) => {
        resolve(new OperationResult());
      }).catch((result) => {
        reject(new OperationResult(`contact failed: ${result}`));
      });
    });
  }

  public login(user: string, password: string): Promise<OperationResult> {
    logger.debug("=================================================================");
    logger.debug("login");

    let data = {
      "F_Login": "Login",
      "F_MandantenNr": "CEGEKA",
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
    logger.debug("=================================================================");
    logger.debug("logout");

    return new Promise<OperationResult>((resolve, reject) => {
      this.get("/asp/nt_abmelden.asp").then((res) => {
        resolve(new OperationResult());
      });
    });
  }

  public traceResponse(name: string, data: any) {
    if (this.tracing) {
      fs.writeFileSync(name, data);
    }
  }

  public traceResponseError(name: string, data: any) {
      fs.writeFileSync(name, data);
  }

  public get(path: string): Promise<RequestResult> {
    return axios.get(path,{
      baseURL: this.url,
      headers: { Cookie: this.sessionCookie },
      responseType: 'arraybuffer',
      reponseEncoding: 'binary'
    })
    .then((response: AxiosResponse) => {
      const cookies = response.headers["set-cookie"];
      if (cookies) {
        this.sessionCookie = cookies[0].split("; ")[0];
      }
      const decoder = new TextDecoder("ISO-8859-1");
      const html = decoder.decode(response.data);
      return {data: html} as RequestResult;
    });
  }

  public post(path: string, data: any): Promise<RequestResult> {
    return axios.post(path, data,{
      baseURL: this.url,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": this.sessionCookie,
      },
    })
        .then((response: AxiosResponse) => {
          return {data: response.data} as RequestResult;
        });
  }
}
