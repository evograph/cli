import { ECSObject } from "../../../kernel/ECSObject.js";
import { isRelation, RELATIONS } from "./EdgeContent.js";
export class Edge extends ECSObject {
    type = "edge";
    validate() {
        if (!this.content.from.trim()) {
            throw new Error("Edge 'from' id is required");
        }
        if (!this.content.to.trim()) {
            throw new Error("Edge 'to' id is required");
        }
        if (this.content.from === this.content.to) {
            throw new Error("Edge cannot link an object to itself");
        }
        if (!isRelation(this.content.relation)) {
            throw new Error(`Unknown relation '${this.content.relation}'. Valid relations: ${RELATIONS.join(", ")}`);
        }
    }
    static fromJSON(record) {
        return new Edge(record.content, record.metadata);
    }
}
//# sourceMappingURL=Edge.js.map