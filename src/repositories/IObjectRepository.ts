import type { ECSObject } from "#/core/ECSObject.js";
import type { SaveObjectResult } from "#/storage/objectStore.js";

export interface IObjectRepository {
  save(object: ECSObject): SaveObjectResult;

  load(id: string): ECSObject;

  exists(id: string): boolean;

  list(): string[];
}