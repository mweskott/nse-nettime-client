

export class TaskNumber {

    constructor(public task: string) {
    }

    public getProject() {
        let parts = this.task.split(".");
        let project = parts[0] + "." + parts[1];
        return project;
    }

    public getSubject() {
        let parts = this.task.split(".");
        let subject = parts[0] + "." + parts[1] +  "." + parts[2];
        return subject;
    }

    public getTask() {
        return this.task;
    }
}