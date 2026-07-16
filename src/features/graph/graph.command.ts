import fs from "node:fs";

import { GraphRepository } from "#/features/graph/graph.repository.js";
import { ObjectRepository } from "#/features/objects/object.repository.js";
import { objectTitle, shortId } from "#/features/objects/object.view.js";
import { resolveObjectId } from "#/features/objects/object.store.js";
import { ECS_DIR } from "#/kernel/paths.js";

const repository = new ObjectRepository();
const graph = new GraphRepository();

const TYPE_ORDER: Record<string, number> = {
  decision: 0,
  problem: 1,
  note: 2,
  change: 3,
};

function ensureRepo(): boolean {
  if (!fs.existsSync(ECS_DIR)) {
    console.error(
      "No ECS repository found. Run `ecs init` in this directory first."
    );
    process.exitCode = 1;
    return false;
  }
  return true;
}

function describeNode(nodeId: string): string {
  const node = repository.load(nodeId);
  return `${node.type}: ${objectTitle(node)} (${shortId(nodeId)})`;
}

function printTree(nodeId: string, depth: number, visited: Set<string>) {
  const indent = "    ".repeat(depth);

  if (visited.has(nodeId)) {
    console.log(`${indent}${describeNode(nodeId)} (already shown)`);
    return;
  }

  visited.add(nodeId);
  console.log(`${indent}${describeNode(nodeId)}`);

  for (const neighbor of graph.outgoing(nodeId)) {
    console.log(`${indent}    │ ${neighbor.relation}`);
    console.log(`${indent}    ▼`);
    printTree(neighbor.nodeId, depth + 1, visited);
  }
}

function listNodeIds(): string[] {
  const ids: string[] = [];

  for (const id of repository.list()) {
    try {
      const object = repository.load(id);
      if (object.type !== "edge") {
        ids.push(id);
      }
    } catch {
      // Skip objects that fail to deserialize
    }
  }

  return ids;
}

function sortNodeIds(ids: string[]): string[] {
  return [...ids].sort((a, b) => {
    const objectA = repository.load(a);
    const objectB = repository.load(b);
    const typeDiff =
      (TYPE_ORDER[objectA.type] ?? 99) - (TYPE_ORDER[objectB.type] ?? 99);
    if (typeDiff !== 0) {
      return typeDiff;
    }
    return objectB.metadata.createdAt.localeCompare(
      objectA.metadata.createdAt
    );
  });
}

function findRoots(nodeIds: string[]): string[] {
  return nodeIds.filter((id) => graph.incoming(id).length === 0);
}

function printFullGraph() {
  const nodeIds = listNodeIds();

  if (nodeIds.length === 0) {
    console.log("No objects found.");
    return;
  }

  const visited = new Set<string>();
  const roots = sortNodeIds(findRoots(nodeIds));
  let printed = false;

  for (const rootId of roots) {
    if (visited.has(rootId)) {
      continue;
    }
    if (printed) {
      console.log("");
    }
    printTree(rootId, 0, visited);
    printed = true;
  }

  // Cover cycles / components with no true root
  const remaining = sortNodeIds(nodeIds.filter((id) => !visited.has(id)));
  for (const nodeId of remaining) {
    if (visited.has(nodeId)) {
      continue;
    }
    if (printed) {
      console.log("");
    }
    printTree(nodeId, 0, visited);
    printed = true;
  }
}

export function graphCommand(id?: string) {
  if (!ensureRepo()) {
    return;
  }

  if (!id) {
    printFullGraph();
    return;
  }

  const resolvedId = resolveObjectId(id);
  printTree(resolvedId, 0, new Set());
}
