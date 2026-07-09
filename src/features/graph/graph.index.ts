import fs from "node:fs";
import path from "node:path";

import { INDEX_DIR } from "#/kernel/paths.js";

// The graph index maps node IDs to the edge IDs that touch them, so
// traversal doesn't require scanning every object in the store.
//
// .evolution/index/
//   outgoing/<node-id>  → JSON array of edge IDs where node is `from`
//   incoming/<node-id>  → JSON array of edge IDs where node is `to`

type Direction = "outgoing" | "incoming";

function getIndexPath(direction: Direction, nodeId: string): string {
  return path.join(INDEX_DIR, direction, nodeId);
}

function readEdgeIds(direction: Direction, nodeId: string): string[] {
  const filePath = getIndexPath(direction, nodeId);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8")) as string[];
}

function appendEdgeId(
  direction: Direction,
  nodeId: string,
  edgeId: string
): void {
  const filePath = getIndexPath(direction, nodeId);
  const edgeIds = readEdgeIds(direction, nodeId);

  if (edgeIds.includes(edgeId)) {
    return;
  }

  edgeIds.push(edgeId);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(edgeIds), "utf8");
}

export function indexEdge(edgeId: string, from: string, to: string): void {
  appendEdgeId("outgoing", from, edgeId);
  appendEdgeId("incoming", to, edgeId);
}

export function getOutgoingEdgeIds(nodeId: string): string[] {
  return readEdgeIds("outgoing", nodeId);
}

export function getIncomingEdgeIds(nodeId: string): string[] {
  return readEdgeIds("incoming", nodeId);
}
