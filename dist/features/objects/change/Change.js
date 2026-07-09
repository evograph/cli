import { ECSObject } from "../../../kernel/ECSObject.js";
export class Change extends ECSObject {
    type = "change";
    validate() {
        if (this.content.kind === "commit" && !this.content.commit?.trim()) {
            throw new Error("Commit change requires a commit SHA");
        }
        if (this.content.files.length === 0) {
            throw new Error("Change must reference at least one file");
        }
    }
    static fromJSON(record) {
        return new Change(record.content, record.metadata);
    }
}
//# sourceMappingURL=Change.js.map