import { saveObject } from "#/storage/objectStore.js";
import type { ECSObject } from "#/core/ECSObject.js";

export function createTestObject() {
  const object: ECSObject = {
    header: {
      type: "note",
      schemaVersion: 1,
    },

    content: {
      title: "Hello ECS",
      body: "My first ECS object",
    },

    metadata: {
      createdAt: new Date().toISOString(),
      version: 1,
    },
  };

  const id = saveObject(object);

  console.log("Object created:", id);
}