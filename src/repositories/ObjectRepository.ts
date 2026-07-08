import type { ECSObject } from "#/core/ECSObject.js";
import { deserialize } from "#/core/registry.js";
import { hash } from "#/utils/hash.js";
import type { IObjectRepository } from "./IObjectRepository.js";
import type { SaveObjectResult } from "#/storage/objectStore.js";

import {
  saveObject,
  loadObject,
  objectExists,
  listObjects,
} from "#/storage/objectStore.js";

export class ObjectRepository implements IObjectRepository {
  save(object: ECSObject<unknown>): SaveObjectResult {
    object.validate();
    const id = hash(object.canonicalize());
    return saveObject(object.toJSON(), id);
  }

  load(id: string): ECSObject<unknown> {
    const record = loadObject(id);
    return deserialize(record);
  }

  exists(id: string): boolean {
    return objectExists(id);
  }

  list(): string[] {
    return listObjects();
  }

  listByType(
    type: string
  ): { id: string; object: ECSObject<unknown> }[] {
    const result: { id: string; object: ECSObject<unknown> }[] = [];

    for (const id of this.list()) {
      try {
        const object = this.load(id);

        if (object.type === type) {
          result.push({ id, object });
        }
      } catch {
        // Skip objects that fail to deserialize
      }
    }

    return result;
  }
}
