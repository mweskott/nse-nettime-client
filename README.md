# nse-nettime-client
Unofficial client for the NSE time recording tool powered by node.js.


## Installing
> npm install -g nse-nettime-client

## Command Line

> nettime --url https://nettime.nse.de -u testuser -p mysecret book 123213.23.33.01 15.03.2017 08:00 16:00

Use `nettime --help` to list all commands and options.

### Command line options

* `--url <url>` Nettime server URL
* `-u, --user <login>` User login
* `-p, --password <password>` Password
* `-c, --config <configFile>` loads the given config file (in json format) to define command line parameters

### Configuration files

To define static options, you can provide a configuration file in json format.
If no configuration file is given, the command tries to load the file `nettime.json`.

```javascript
{
  "user": "mynettimeuser",
  "url": "https://nettime.example.org",
  "alias": {
    "pfefferminzia.consulting": "225487.01.15.02",
    "pfefferminzia.aiting": "345487.01.15.17"
  }
}
```

### Task number aliases

Task numbers are sometimes a bit inconvenient.
To improve booking performance you can define task number alieses as strings and use them in the booking command.

> nettime -c myconfig.json book pfefferminzia.consulting 15.03.2017 08:00 16:00

You have to define task number aliases in the configuration file.

### Best practice

Place a `nettime.json` with the server url, your user and your favorite aliases in the current directory.

Run the a command with the booking details

> nettime book everyday.task 15.03.2017 08:00 16:00

Let the command prompt for your password.

To list the aliases use
> nettime alias

## API
[TBD]