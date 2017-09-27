# nse-nettime-client
Unofficial client for the NSE time recording tool powered by node.js.


## Installing
> npm install -g nse-nettime-client

## Command Line

> nettime --url https://nettime.nse.de -u testuser -p mysecret book 123213.23.33.01 08:00 16:00

Use `nettime --help` to list all commands and options.

### Command line options

* `--url <url>` Nettime server URL
* `-u, --user <login>` User login
* `-p, --password <password>` Password
* `-c, --config <configFile>` loads the given config file (in json format) to define command line parameters

### Configuration files

To define static options, you can  provide a configuration file in json format.

```javascript
{
  "username": "mynettimeuser",
  "url": "https://nettime.example.org",
  "alias": {
    "pfefferminzia.cosulting": "225487.01.15.02",
    "pfefferminzia.aiting": "345487.01.15.17"
  }
}
```

### Task number aliases

Task numbers are sometimes a bit inconvenient.
To improve booking performance you can define task number alieses as strings and use them in the booking command.

> nettime -c myconfig.json book pfefferminzia.cosulting 08:00 16:00

You have to define task number aliases in the configuration file.

## API
[TBD]