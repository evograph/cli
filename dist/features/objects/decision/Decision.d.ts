import { ECSObject } from "../../../kernel/ECSObject.js";
import type { ECSObjectRecord } from "../../../kernel/ECSObjectRecord.js";
import type { DecisionContent } from "./DecisionContent.js";
export declare class Decision extends ECSObject<DecisionContent> {
    readonly type = "decision";
    validate(): void;
    static fromJSON(record: ECSObjectRecord<DecisionContent>): Decision;
}
//# sourceMappingURL=Decision.d.ts.map