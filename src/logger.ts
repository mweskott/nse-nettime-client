
export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
}

class Logger {
    public level: LogLevel = LogLevel.INFO;

    public info(message?: any, ...optionalParams: any[]) {
        if (this.level >= LogLevel.INFO) {
            console.log(message, ...optionalParams);
        }
    }

    public debug(message?: any, ...optionalParams: any[]) {
        if (this.level >= LogLevel.DEBUG) {
            console.log(message, ...optionalParams);
        }
    }

    public error(message?: any, ...optionalParams: any[]) {
        if (this.level >= LogLevel.ERROR) {
            console.log(message, ...optionalParams);
        }
    }

}

export const logger = new Logger();
