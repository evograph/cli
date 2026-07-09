import { ECSObject } from "#/kernel/ECSObject.js";
import type { ECSObjectRecord } from "#/kernel/ECSObjectRecord.js";
import type { ChangeContent } from "./ChangeContent.js";

export class Change extends ECSObject<ChangeContent> {
  readonly type = "change";

  validate(): void {
    if (this.content.kind === "commit" && !this.content.commit?.trim()) {
      throw new Error("Commit change requires a commit SHA");
    }

    if (this.content.files.length === 0) {
      throw new Error("Change must reference at least one file");
    }
  }

  static fromJSON(record: ECSObjectRecord<ChangeContent>): Change {
    return new Change(record.content, record.metadata);
  }
}
