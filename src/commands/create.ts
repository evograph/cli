import { saveObject } from "#/storage/objectStore.js";

export function createTestObject() {

    const object = {

        type: "note",

        title: "Hello ECS",

        createdAt: new Date().toISOString()

    };

    const id = saveObject(object);

    console.log("Object created:", id);

}