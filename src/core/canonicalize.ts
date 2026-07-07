import type { ECSObjectRecord } from "./ECSObjectRecord.js";

export function canonicalize(record: ECSObjectRecord): string {
  return JSON.stringify({
    header: record.header,
    content: record.content,
  });
}
