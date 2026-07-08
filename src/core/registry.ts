import type { ECSObject } from "#/core/ECSObject.js";
import type { ECSObjectRecord } from "#/core/ECSObjectRecord.js";
import { Edge } from "#/types/Edge.js";
import type { EdgeContent } from "#/types/EdgeContent.js";
import { Note } from "#/types/Note.js";
import type { NoteContent } from "#/types/NoteContent.js";

const registry: Record<
  string,
  (record: ECSObjectRecord) => ECSObject<unknown>
> = {
  note: (record) => Note.fromJSON(record as ECSObjectRecord<NoteContent>),
  edge: (record) => Edge.fromJSON(record as ECSObjectRecord<EdgeContent>),
};

export function deserialize(record: ECSObjectRecord): ECSObject<unknown> {
  const deserializer = registry[record.header.type];

  if (!deserializer) {
    throw new Error(`Unknown object type: ${record.header.type}`);
  }

  return deserializer(record);
}
