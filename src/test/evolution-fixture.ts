import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, vi } from "vitest";

/**
 * Mutable path constants for FS tests. Import this module before any
 * code under test so the paths mock is registered.
 */
const mockPaths = vi.hoisted(() => ({
  ECS_DIR: "",
  OBJECTS_DIR: "",
  REFS_DIR: "",
  INDEX_DIR: "",
  ARTIFACTS_DIR: "",
}));

vi.mock("#/kernel/paths.js", () => ({
  get ECS_DIR() {
    return mockPaths.ECS_DIR;
  },
  get OBJECTS_DIR() {
    return mockPaths.OBJECTS_DIR;
  },
  get REFS_DIR() {
    return mockPaths.REFS_DIR;
  },
  get INDEX_DIR() {
    return mockPaths.INDEX_DIR;
  },
  get ARTIFACTS_DIR() {
    return mockPaths.ARTIFACTS_DIR;
  },
}));

export function getMockPaths() {
  return mockPaths;
}

let root = "";

export function useEvolutionFixture() {
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(process.cwd(), ".tmp-ecs-"));
    const evolution = path.join(root, ".evolution");
    mockPaths.ECS_DIR = evolution;
    mockPaths.OBJECTS_DIR = path.join(evolution, "objects");
    mockPaths.REFS_DIR = path.join(evolution, "refs");
    mockPaths.INDEX_DIR = path.join(evolution, "index");
    mockPaths.ARTIFACTS_DIR = path.join(evolution, "artifacts");
    fs.mkdirSync(mockPaths.OBJECTS_DIR, { recursive: true });
    fs.mkdirSync(mockPaths.INDEX_DIR, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  return {
    getRoot: () => root,
  };
}
