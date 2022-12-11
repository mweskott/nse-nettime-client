
export class DayRange {

    public static parseDays(text: string): string[] {
        const [first, last] = text.split("-");
        if (!last) {
            return [text];
        }
        const [day, month, year] = DayRange.splitDay(first);
        const [lastDay, lastMonth, lastYear] = DayRange.splitDay(last);
        if (month !== lastMonth || year !== lastYear) {
            throw new Error(`day ranges over month boundaries are not supported: ${text}`);
        }
        return Array.from(Array(Math.abs(lastDay - day) + 1).keys())
            .map((index) => Math.min(day, lastDay) + index)
            .map((current) => DayRange.toDay([current, month, year]));
    }

    private static splitDay(text: string): number[] {
        return text.split(".").map((part) => Number(part));
    }

    private static toDay([day, month, year]: number[]): string {
        return `${day}.${month}.${year}`;
    }
}