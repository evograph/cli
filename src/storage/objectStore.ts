import fs from "node:fs";
import path from "node:path";
import { hash } from "#/utils/hash.js";
import type { ECSObject } from "#/core/ECSObject.js";

const OBJECTS_DIR = path.join(process.cwd(), ".evolution", "objects");

export function saveObject(data: unknown): string {
    const object = data as ECSObject;

    // Hash ONLY the content
    const contentJson = JSON.stringify(object.content);
    
    const id = hash(contentJson);
    
    // Store everything
    const json = JSON.stringify(
        object,
        null,
        2
    );

  // Split hash into directory + filename
  const dir = id.substring(0, 2);
  const file = id.substring(2);

  const directory = path.join(OBJECTS_DIR, dir);

  fs.mkdirSync(directory, { recursive: true });

  const filePath = path.join(directory, file);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, json);
  }

  return id;
}

export function loadObject(id: string): unknown {
    const dir = id.substring(0, 2);
    const file = id.substring(2);
  
    const filePath = path.join(
      OBJECTS_DIR,
      dir,
      file
    );
  
    if (!fs.existsSync(filePath)) {
      throw new Error("Object not found");
    }
  
    const json = fs.readFileSync(filePath, "utf8");
  
    return JSON.parse(json);
  }