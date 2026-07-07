import type { ECSObject } from "./ECSObject.js";

export function canonicalize(object: ECSObject): string {
  return JSON.stringify({
    header: object.header,
    content: object.content,
  });
}