# nse-nettime-client

[![Node.js CI](https://github.com/mweskott/nse-nettime-client/actions/workflows/build.yaml/badge.svg)](https://github.com/mweskott/nse-nettime-client/actions/workflows/build.yaml)

Unofficial client for the NSE time recording tool powered by node.js.

## Installing

> npm install -g nse-nettime-client

## Command Line

> `nettime --url https://nettime.nse.de -u testuser -p mysecret book 123213.23.33.01 15.03.2017 08:00-16:00 -m "meeting"`

Use `nettime --help` to list all commands and options.

### General command line options

* `--url <url>` Nettime server URL
* `-u, --user <login>` User login
* `-p, --password <password>` Password
* `-c, --config <configFile>` loads the given config file (in json format) to define command line parameters

### Configuration files

To define static options, you can provide a configuration file in json format.
If no configuration file is given, the command tries to load the user default configuration file `.nettime.json` from the user home directory.

```javascript
{
  "user": "mynettimeuser",
  "url": "https://nettime.example.org",
  "alias": {
    "pfefferminzia.consulting": "225487.01.15.02",
    "pfefferminzia.waiting": "345487.01.15.17"
  }
}
```

### Task number aliases

Task numbers are sometimes a bit inconvenient.
To improve booking performance you can define task number alieses as strings and use them in the booking command.

> `nettime -c myconfig.json book pfefferminzia.consulting 15.03.2017 08:00-16:00`

You can directly define task number aliases in the configuration file.
It is much easier to use the command line
> `nettime alias pfefferminzia.consulting 225487.01.15.02`

The aliases are stored in the configuration file.
If no configuration filename is given the user default file is used.

To list all defined aliases use
> `nettime alias`

### Best practice

Run the `book` command with the booking details

> `nettime book everyday.task 15.03.2017 8-16`

... let the command prompt for your password.

If you want to publish more than on time period per command, simply type
> `nettime book everyday.task 22.02.2019 7-9 11-13:30 14-17`

Be more expressive and add a message to your bookings
> `nettime book everyday.task 22.02.2019 7-9 11-13:30 14-17 -m "bug fixing"`

