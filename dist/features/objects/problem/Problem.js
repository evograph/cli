import { ECSObject } from "../../../kernel/ECSObject.js";
export class Problem extends ECSObject {
    type = "problem";
    validate() {
        if (!this.content.title.trim()) {
            throw new Error("Problem title is required");
        }
        if (!this.content.description.trim()) {
            throw new Error("Problem description is required");
        }
        if (!this.content.severity.trim()) {
            throw new Error("Problem severity is required");
        }
    }
    static fromJSON(record) {
        return new Problem(record.content, record.metadata);
    }
}
//# sourceMappingURL=Problem.js.map