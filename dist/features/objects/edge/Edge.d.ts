import { ECSObject } from "../../../kernel/ECSObject.js";
import type { ECSObjectRecord } from "../../../kernel/ECSObjectRecord.js";
import type { EdgeContent } from "./EdgeContent.js";
export declare class Edge extends ECSObject<EdgeContent> {
    readonly type = "edge";
    validate(): void;
    static fromJSON(record: ECSObjectRecord<EdgeContent>): Edge;
}
//# sourceMappingURL=Edge.d.ts.map