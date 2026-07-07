import type { ECSObject } from "#/core/ECSObject.js";
import type { IObjectRepository } from "./IObjectRepository.js";

import {
  saveObject,
  loadObject,
} from "#/storage/objectStore.js";

export class ObjectRepository implements IObjectRepository {
  save(object: ECSObject): string {
    return saveObject(object);
  }

  load(id: string): ECSObject {
    return loadObject(id);
  }


}