# nse-nettime-client
Unofficial client for the NSE time recording tool powered by node.js.


## Installing
> npm install -g nse-nettime-client

## Command Line

> nettime --url https://nettime.nse.de -u testuser -p mysecret book 123213.23.33.01 08:00 16:00

Use `nettime --help` to list all commands and options.

* `--url <url>` Nettime server URL
* `-u, --user <login>` User login
* `-p, --password <password>` Password
* `-c, --config <configFile>` loads the given config file (in json format) to define command line parameters

## API
[TBD]