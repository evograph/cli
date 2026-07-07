import { ECSObject } from "#/core/ECSObject.js";
import type { ECSObjectRecord } from "#/core/ECSObjectRecord.js";
import type { NoteContent } from "./NoteContent.js";

export class Note extends ECSObject<NoteContent> {
  readonly type = "note";

  validate(): void {
    if (!this.content.title.trim()) {
      throw new Error("Note title is required");
    }

    if (!this.content.body.trim()) {
      throw new Error("Note body is required");
    }
  }

  static fromJSON(record: ECSObjectRecord<NoteContent>): Note {
    return new Note(record.content, record.metadata);
  }
}
