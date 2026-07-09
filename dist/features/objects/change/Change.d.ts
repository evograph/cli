import { ECSObject } from "../../../kernel/ECSObject.js";
import type { ECSObjectRecord } from "../../../kernel/ECSObjectRecord.js";
import type { ChangeContent } from "./ChangeContent.js";
export declare class Change extends ECSObject<ChangeContent> {
    readonly type = "change";
    validate(): void;
    static fromJSON(record: ECSObjectRecord<ChangeContent>): Change;
}
//# sourceMappingURL=Change.d.ts.map