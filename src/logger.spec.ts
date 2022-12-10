import {logger, LogLevel} from "./logger";

describe("logger should", () => {
    logger.level = LogLevel.INFO;
    it("log înfo message and params", () => {
        logger.info("info", {k1: "v1"});
    });
    it("log debug message and params", () => {
        logger.debug("debug", {k1: "v1"});
    });
});
