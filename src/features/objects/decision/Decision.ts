import { ECSObject } from "#/kernel/ECSObject.js";
import type { ECSObjectRecord } from "#/kernel/ECSObjectRecord.js";
import type { DecisionContent } from "./DecisionContent.js";

export class Decision extends ECSObject<DecisionContent> {
  readonly type = "decision";

  validate(): void {
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

  static fromJSON(record: ECSObjectRecord<DecisionContent>): Decision {
    return new Decision(record.content, record.metadata);
  }
}
