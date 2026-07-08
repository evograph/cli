import { GraphRepository } from "#/repositories/GraphRepository.js";
import { ObjectRepository } from "#/repositories/ObjectRepository.js";
import { resolveObjectId } from "#/storage/objectStore.js";

const repository = new ObjectRepository();
const graph = new GraphRepository();

function shortId(id: string): string {
  return id.substring(0, 8);
}

export function showObject(id: string) {
  const resolvedId = resolveObjectId(id);
  const object = repository.load(resolvedId);

  console.log(JSON.stringify(object.toJSON(), null, 2));

  const { incoming, outgoing } = graph.neighbors(resolvedId);

  if (incoming.length === 0 && outgoing.length === 0) {
    return;
  }

  console.log("");

  if (incoming.length > 0) {
    console.log("Incoming:");
    for (const neighbor of incoming) {
      const node = repository.load(neighbor.nodeId);
      console.log(
        `  • ${neighbor.relation} ← ${node.type} (${shortId(neighbor.nodeId)})`
      );
    }
  }

  if (outgoing.length > 0) {
    console.log("Outgoing:");
    for (const neighbor of outgoing) {
      const node = repository.load(neighbor.nodeId);
      console.log(
        `  • ${neighbor.relation} → ${node.type} (${shortId(neighbor.nodeId)})`
      );
    }
  }
}
