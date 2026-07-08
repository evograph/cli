import { GraphRepository } from "#/repositories/GraphRepository.js";
import { ObjectRepository } from "#/repositories/ObjectRepository.js";
import { objectTitle, shortId } from "#/services/objectView.js";
import { resolveObjectId } from "#/storage/objectStore.js";
import type { Neighbor } from "#/repositories/GraphRepository.js";

const repository = new ObjectRepository();
const graph = new GraphRepository();

function describeNode(nodeId: string): string {
  const node = repository.load(nodeId);
  return `${node.type}: ${objectTitle(node)} (${shortId(nodeId)})`;
}

function printNeighborList(title: string, neighbors: Neighbor[]) {
  if (neighbors.length === 0) {
    console.log(`${title}: none`);
    return;
  }

  console.log(`${title}:`);
  for (const neighbor of neighbors) {
    console.log(`  • ${neighbor.relation} — ${describeNode(neighbor.nodeId)}`);
  }
}

export function neighborsCommand(id: string) {
  const { incoming, outgoing } = graph.neighbors(id);

  printNeighborList("Incoming", incoming);
  printNeighborList("Outgoing", outgoing);
}

export function ancestorsCommand(id: string) {
  printNeighborList("Ancestors", graph.ancestors(id));
}

export function descendantsCommand(id: string) {
  printNeighborList("Descendants", graph.descendants(id));
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

export function graphCommand(id: string) {
  const resolvedId = resolveObjectId(id);
  printTree(resolvedId, 0, new Set());
}
