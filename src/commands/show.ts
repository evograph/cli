import { GraphRepository } from "#/repositories/GraphRepository.js";
import { ObjectRepository } from "#/repositories/ObjectRepository.js";
import { objectTitle, renderHumanSummary, shortId } from "#/services/objectView.js";
import { resolveObjectId } from "#/storage/objectStore.js";

const repository = new ObjectRepository();
const graph = new GraphRepository();

export function showObject(id: string) {
  const resolvedId = resolveObjectId(id);
  const object = repository.load(resolvedId);

  console.log(renderHumanSummary(resolvedId, object));

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
        `  • ${neighbor.relation} ← ${node.type}: ${objectTitle(node)} (${shortId(neighbor.nodeId)})`
      );
    }
  }

  if (outgoing.length > 0) {
    console.log("Outgoing:");
    for (const neighbor of outgoing) {
      const node = repository.load(neighbor.nodeId);
      console.log(
        `  • ${neighbor.relation} → ${node.type}: ${objectTitle(node)} (${shortId(neighbor.nodeId)})`
      );
    }
  }
}
