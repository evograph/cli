import type { ECSObject } from "#/core/ECSObject.js";

export interface IObjectRepository {
  save(object: ECSObject): string;

  load(id: string): ECSObject;

}