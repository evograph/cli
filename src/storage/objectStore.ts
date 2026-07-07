import fs from "node:fs";
import path from "node:path";

import type { ECSObjectRecord } from "#/core/ECSObjectRecord.js";
import { OBJECTS_DIR } from "#/config/paths.js";

function getObjectPath(id: string): string {
  const dir = id.substring(0, 2);
  const file = id.substring(2);

  return path.join(OBJECTS_DIR, dir, file);
}

export function resolveObjectId(input: string): string {
  if (objectExists(input)) {
    return input;
  }

  const allIds = listObjects();

  const matches = allIds.filter(
    (id) =>
      id.startsWith(input) ||
      id.substring(2) === input ||
      id.substring(2).startsWith(input)
  );

  if (matches.length === 1) {
    return matches[0]!;
  }

  if (matches.length > 1) {
    throw new Error(
      `Ambiguous object id '${input}'. Matches: ${matches.join(", ")}`
    );
  }

  throw new Error(`Object '${input}' not found.`);
}

export type SaveObjectResult = {
  id: string;
  created: boolean;
};

export function saveObject(
  record: ECSObjectRecord,
  id: string
): SaveObjectResult {
  const filePath = getObjectPath(id);

  fs.mkdirSync(path.dirname(filePath), {
    recursive: true,
  });

  const created = !fs.existsSync(filePath);

  if (created) {
    fs.writeFileSync(filePath, JSON.stringify(record), "utf8");
  }

  return { id, created };
}

export function loadObject(id: string): ECSObjectRecord {
  const resolvedId = resolveObjectId(id);
  const filePath = getObjectPath(resolvedId);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Object '${resolvedId}' not found.`);
  }

  const json = fs.readFileSync(filePath, "utf8");

  return JSON.parse(json) as ECSObjectRecord;
}

export function objectExists(id: string): boolean {
  return fs.existsSync(getObjectPath(id));
}

export function listObjects(): string[] {
  if (!fs.existsSync(OBJECTS_DIR)) {
    return [];
  }

  const ids: string[] = [];

  for (const dir of fs.readdirSync(OBJECTS_DIR)) {
    const dirPath = path.join(OBJECTS_DIR, dir);

    if (!fs.statSync(dirPath).isDirectory()) {
      continue;
    }

    for (const file of fs.readdirSync(dirPath)) {
      ids.push(dir + file);
    }
  }

  return ids;
}
