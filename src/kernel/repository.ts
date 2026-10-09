import fs from "node:fs";
import { ECS_DIR, OBJECTS_DIR } from "./paths.js";

export function requireRepository(): void {
  if (!fs.existsSync(OBJECTS_DIR) || !fs.statSync(OBJECTS_DIR).isDirectory()) {
    throw new Error(
      `No initialized ECS store at ${ECS_DIR}. Run 'ecs init --yes' in your project first.`,
    );
  }
}

export function positiveInteger(
  value: string | number | undefined,
  fallback: number,
  maximum: number,
): number {
  if (value === undefined) return fallback;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1 || number > maximum) {
    throw new Error(
      `Expected a whole number between 1 and ${maximum}; received '${value}'.`,
    );
  }
  return number;
}
