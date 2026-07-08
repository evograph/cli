import type { ECSObject } from "#/core/ECSObject.js";
import type { SaveObjectResult } from "#/storage/objectStore.js";

export interface IObjectRepository {
  save(object: ECSObject<unknown>): SaveObjectResult;

  load(id: string): ECSObject<unknown>;

  exists(id: string): boolean;

  list(): string[];

  listByType(type: string): { id: string; object: ECSObject<unknown> }[];
}
