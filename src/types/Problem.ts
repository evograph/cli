import { ECSObject } from "#/core/ECSObject.js";
import type { ECSObjectRecord } from "#/core/ECSObjectRecord.js";
import type { ProblemContent } from "./ProblemContent.js";

export class Problem extends ECSObject<ProblemContent> {
  readonly type = "problem";

  validate(): void {
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

  static fromJSON(record: ECSObjectRecord<ProblemContent>): Problem {
    return new Problem(record.content, record.metadata);
  }
}
