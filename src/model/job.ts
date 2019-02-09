import { TaskNumber } from '../task-number';

export class Job {
    constructor(public taskNumber: TaskNumber, public name: string) {
    }
}
