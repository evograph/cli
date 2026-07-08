import type { ECSObject } from "#/core/ECSObject.js";
import type { ECSObjectRecord } from "#/core/ECSObjectRecord.js";
import { Change } from "#/types/Change.js";
import type { ChangeContent } from "#/types/ChangeContent.js";
import { Decision } from "#/types/Decision.js";
import type { DecisionContent } from "#/types/DecisionContent.js";
import { Edge } from "#/types/Edge.js";
import type { EdgeContent } from "#/types/EdgeContent.js";
import { Note } from "#/types/Note.js";
import type { NoteContent } from "#/types/NoteContent.js";
import { Problem } from "#/types/Problem.js";
import type { ProblemContent } from "#/types/ProblemContent.js";

const registry: Record<
  string,
  (record: ECSObjectRecord) => ECSObject<unknown>
> = {
  note: (record) => Note.fromJSON(record as ECSObjectRecord<NoteContent>),
  edge: (record) => Edge.fromJSON(record as ECSObjectRecord<EdgeContent>),
  problem: (record) =>
    Problem.fromJSON(record as ECSObjectRecord<ProblemContent>),
  decision: (record) =>
    Decision.fromJSON(record as ECSObjectRecord<DecisionContent>),
  change: (record) => Change.fromJSON(record as ECSObjectRecord<ChangeContent>),
};

export function deserialize(record: ECSObjectRecord): ECSObject<unknown> {
  const deserializer = registry[record.header.type];

  if (!deserializer) {
    throw new Error(`Unknown object type: ${record.header.type}`);
  }

  return deserializer(record);
}
