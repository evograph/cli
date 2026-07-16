import fs from "node:fs";

import type { ECSObject } from "#/kernel/ECSObject.js";
import { GraphRepository } from "#/features/graph/graph.repository.js";
import { ObjectRepository } from "#/features/objects/object.repository.js";
import {
  objectTitle,
  shortId,
} from "#/features/objects/object.view.js";
import { ECS_DIR } from "#/kernel/paths.js";

const repository = new ObjectRepository();
const graph = new GraphRepository();

export type ContextOptions = {
  limit?: string;
};

type ListedObject = { id: string; object: ECSObject<unknown> };

function ensureRepo(): void {
  if (!fs.existsSync(ECS_DIR)) {
    console.error(
      "No ECS repository found. Run `ecs init` in this directory first."
    );
    process.exitCode = 1;
  }
}

function sortByCreatedDesc(entries: ListedObject[]): ListedObject[] {
  return [...entries].sort((a, b) =>
    b.object.metadata.createdAt.localeCompare(a.object.metadata.createdAt)
  );
}

function describeNode(nodeId: string): string {
  try {
    const node = repository.load(nodeId);
    return `${node.type}: ${objectTitle(node)} (${shortId(nodeId)})`;
  } catch {
    return `unknown (${shortId(nodeId)})`;
  }
}

function printMiniGraph(nodeId: string, maxDepth = 2): void {
  const visited = new Set<string>();

  function walk(id: string, depth: number): void {
    const indent = "  ".repeat(depth);
    if (visited.has(id)) {
      console.log(`${indent}${describeNode(id)} (already shown)`);
      return;
    }
    visited.add(id);
    console.log(`${indent}${describeNode(id)}`);

    if (depth >= maxDepth) {
      return;
    }

    for (const neighbor of graph.outgoing(id)) {
      console.log(`${indent}  │ ${neighbor.relation}`);
      console.log(`${indent}  ▼`);
      walk(neighbor.nodeId, depth + 1);
    }
  }

  walk(nodeId, 0);
}

export function contextCommand(options: ContextOptions = {}): void {
  ensureRepo();
  if (process.exitCode === 1) {
    return;
  }

  const limit = Math.max(1, Number.parseInt(options.limit ?? "5", 10) || 5);

  const problems = sortByCreatedDesc(repository.listByType("problem"));
  const decisions = sortByCreatedDesc(repository.listByType("decision"));

  console.log("=== ECS CONTEXT ===");
  console.log("");

  console.log("## Problems");
  if (problems.length === 0) {
    console.log("(none)");
  } else {
    for (const entry of problems) {
      const content = entry.object.content as {
        title?: string;
        severity?: string;
      };
      console.log(
        `- ${shortId(entry.id)}  [${content.severity ?? "?"}] ${content.title ?? "(untitled)"}  (${entry.id})`
      );
    }
  }

  console.log("");
  console.log("## Decisions");
  if (decisions.length === 0) {
    console.log("(none)");
  } else {
    for (const entry of decisions) {
      const content = entry.object.content as {
        title?: string;
        status?: string;
        chosen?: string;
      };
      console.log(
        `- ${shortId(entry.id)}  [${content.status ?? "?"}] ${content.title ?? "(untitled)"} → ${content.chosen ?? "?"}  (${entry.id})`
      );
    }
  }

  console.log("");
  console.log(`## Recent decision graphs (limit ${limit})`);
  const recent = decisions.slice(0, limit);
  if (recent.length === 0) {
    console.log("(none)");
  } else {
    for (const entry of recent) {
      console.log("");
      console.log(`### ${objectTitle(entry.object)} (${shortId(entry.id)})`);
      printMiniGraph(entry.id);
    }
  }

  console.log("");
  console.log("=== END ECS CONTEXT ===");
}
