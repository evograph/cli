import fs from "node:fs";
import path from "node:path";

import { canonicalize } from "#/core/canonicalize.js";
import type { ECSObject } from "#/core/ECSObject.js";
import { hash } from "#/utils/hash.js";
import { OBJECTS_DIR } from "#/config/paths.js";



function getObjectPath(id: string): string {
  const dir = id.substring(0, 2);
  const file = id.substring(2);

  return path.join(OBJECTS_DIR, dir, file);
}

export function saveObject(object: ECSObject): string {
  // Generate the object ID from its canonical representation
  const id = hash(canonicalize(object));

  const filePath = getObjectPath(id);

  // Ensure the directory exists
  fs.mkdirSync(path.dirname(filePath), {
    recursive: true,
  });

  // Store the complete object only once
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      JSON.stringify(object),
      "utf8"
    );
  }

  return id;
}

export function loadObject(id: string): ECSObject {
  const filePath = getObjectPath(id);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Object '${id}' not found.`);
  }

  const json = fs.readFileSync(filePath, "utf8");

  return JSON.parse(json) as ECSObject;
}

export function objectExists(id: string): boolean {
  return fs.existsSync(getObjectPath(id));
}