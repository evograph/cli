import { saveObject } from "#/storage/objectStore.js";
import type { ECSObject } from "#/core/ECSObject.js";

export function createTestObject() {
  const object: ECSObject = {
    header: {
      type: "note",
      schemaVersion: 1,
    },

    content: {
      title: "Hello ECS Object",
      body: "My first ECS object",
    },

    metadata: {
      createdAt: new Date().toISOString(),
      version: 1,
    },
  };

  const { id, created } = saveObject(object);

  if (created) {
    console.log(`Evolved: new object recorded at ${id}`);
  } else {
    console.log(
      `No evolution: header and content are unchanged — this state already exists at ${id}`
    );
  }
}