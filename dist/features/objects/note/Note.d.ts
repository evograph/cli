import { ECSObject } from "../../../kernel/ECSObject.js";
import type { ECSObjectRecord } from "../../../kernel/ECSObjectRecord.js";
import type { NoteContent } from "./NoteContent.js";
export declare class Note extends ECSObject<NoteContent> {
    readonly type = "note";
    validate(): void;
    static fromJSON(record: ECSObjectRecord<NoteContent>): Note;
}
//# sourceMappingURL=Note.d.ts.map