import { ECSObject } from "../../../kernel/ECSObject.js";
import type { ECSObjectRecord } from "../../../kernel/ECSObjectRecord.js";
import type { ProblemContent } from "./ProblemContent.js";
export declare class Problem extends ECSObject<ProblemContent> {
    readonly type = "problem";
    validate(): void;
    static fromJSON(record: ECSObjectRecord<ProblemContent>): Problem;
}
//# sourceMappingURL=Problem.d.ts.map