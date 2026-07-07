import type { ECSObject } from "#/core/ECSObject.js";
import type { IObjectRepository } from "./IObjectRepository.js";
import type { SaveObjectResult } from "#/storage/objectStore.js";

import {
  saveObject,
  loadObject,
  objectExists,
  listObjects,
} from "#/storage/objectStore.js";

export class ObjectRepository implements IObjectRepository {
  save(object: ECSObject): SaveObjectResult {
    return saveObject(object);
  }

  load(id: string): ECSObject {
    return loadObject(id);
  }

  exists(id: string): boolean {
    return objectExists(id);
  }

  list(): string[] {
    return listObjects();
  }
}