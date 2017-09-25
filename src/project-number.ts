


export class ProjectNumber {

    constructor(public text: string) {
    }

    public getProject() {
        let parts = this.text.split(".");
        let project = parts[0] + "." + parts[1];
        return project;
    }

    public getWorkItem() {
        let parts = this.text.split(".");
        let workItem = parts[0] + "." + parts[1] +  "." + parts[2];
        return workItem;
    }

}