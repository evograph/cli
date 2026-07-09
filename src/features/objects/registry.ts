import type { ECSObject } from "#/kernel/ECSObject.js";
import type { ECSObjectRecord } from "#/kernel/ECSObjectRecord.js";
import { Change } from "#/features/objects/change/Change.js";
import type { ChangeContent } from "#/features/objects/change/ChangeContent.js";
import { Decision } from "#/features/objects/decision/Decision.js";
import type { DecisionContent } from "#/features/objects/decision/DecisionContent.js";
import { Edge } from "#/features/objects/edge/Edge.js";
import type { EdgeContent } from "#/features/objects/edge/EdgeContent.js";
import { Note } from "#/features/objects/note/Note.js";
import type { NoteContent } from "#/features/objects/note/NoteContent.js";
import { Problem } from "#/features/objects/problem/Problem.js";
import type { ProblemContent } from "#/features/objects/problem/ProblemContent.js";

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
