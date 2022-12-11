import {expect} from "chai";
import {DayRange} from "./day-range";

describe("DayRange.parseDays()", () => {
    it("should parse day range of one day", () => {
        expect(DayRange.parseDays("6.4.2020")).to.have.members(["6.4.2020"]);
    });
    it("should parse day range of multiple days", () => {
        expect(DayRange.parseDays("6.4.2020-8.4.2020")).to.have.members(
            ["6.4.2020", "7.4.2020", "8.4.2020"]
        );
    });
    it("should throw error on range over month boundary", () => {
        expect(() => DayRange.parseDays("6.4.2020-2.5.2020")).to.throw(Error);
    });
    it("should parse inverse day range of multiple days", () => {
        expect(DayRange.parseDays("6.4.2020-4.4.2020")).to.have.members(
            ["4.4.2020", "5.4.2020", "6.4.2020"]
        );
    });
});
