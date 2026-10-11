import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { findProjectRoot } from "./paths.js";
const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    fs.rmSync(root, { recursive: true, force: true });
});

describe("project discovery", () => {
  it("finds the store from a nested directory and stops at a nested Git project", () => {
    const root = fs.mkdtempSync(path.join(process.cwd(), ".tmp-ecs-paths-"));
    roots.push(root);
    fs.mkdirSync(path.join(root, ".evolution"));
    const nested = path.join(root, "src", "auth");
    fs.mkdirSync(nested, { recursive: true });
    expect(findProjectRoot(nested)).toBe(root);
    fs.mkdirSync(path.join(root, "src", ".git"));
    expect(findProjectRoot(nested)).toBe(path.join(root, "src"));
  });
});
