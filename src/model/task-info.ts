import { TaskNumber } from '../task-number';

export class TaskInfo {
    public childs: TaskInfo[] = [];

    constructor(public taskNumber: TaskNumber, public name: string, public id: string) {
    }
}
