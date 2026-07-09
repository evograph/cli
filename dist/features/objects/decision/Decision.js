import { ECSObject } from "../../../kernel/ECSObject.js";
export class Decision extends ECSObject {
    type = "decision";
    validate() {
        if (!this.content.title.trim()) {
            throw new Error("Decision title is required");
        }
        if (!this.content.chosen.trim()) {
            throw new Error("Decision 'chosen' option is required");
        }
        if (!this.content.rationale.trim()) {
            throw new Error("Decision rationale is required");
        }
        if (!this.content.status.trim()) {
            throw new Error("Decision status is required");
        }
    }
    static fromJSON(record) {
        return new Decision(record.content, record.metadata);
    }
}
//# sourceMappingURL=Decision.js.map