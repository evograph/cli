import path from "node:path";
import fs from "node:fs";

/** Find the nearest store, stopping at a Git boundary to avoid another project. */
export function findProjectRoot(start = process.cwd()): string {
  const initial = path.resolve(start);
  let current = initial;
  while (true) {
    if (fs.existsSync(path.join(current, ".evolution"))) return current;
    if (fs.existsSync(path.join(current, ".git"))) return current;
    const parent = path.dirname(current);
    if (parent === current) return initial;
    current = parent;
  }
}

export const ECS_DIR = path.join(findProjectRoot(), ".evolution");

export const OBJECTS_DIR = path.join(ECS_DIR, "objects");

export const REFS_DIR = path.join(ECS_DIR, "refs");

export const INDEX_DIR = path.join(ECS_DIR, "index");

export const ARTIFACTS_DIR = path.join(ECS_DIR, "artifacts");
