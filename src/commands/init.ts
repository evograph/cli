import fs from "node:fs";
import path from "node:path";

export function initRepository() {
  const root = process.cwd();

  const evolution = path.join(root, ".evolution");

  if (fs.existsSync(evolution)) {
    console.log("Repository already initialized.");
    return;
  }

  fs.mkdirSync(evolution);

  console.log("Initialized ECS repository.");
}