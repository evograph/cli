import { ECSObject } from "../../../kernel/ECSObject.js";
export class Note extends ECSObject {
    type = "note";
    validate() {
        if (!this.content.title.trim()) {
            throw new Error("Note title is required");
        }
        if (!this.content.body.trim()) {
            throw new Error("Note body is required");
        }
    }
    static fromJSON(record) {
        return new Note(record.content, record.metadata);
    }
}
//# sourceMappingURL=Note.js.map