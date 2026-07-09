import { GraphRepository } from "../../features/graph/graph.repository.js";
import { ObjectRepository } from "../../features/objects/object.repository.js";
import { objectTitle, renderHumanSummary, shortId, } from "../../features/objects/object.view.js";
import { resolveObjectId } from "../../features/objects/object.store.js";
const repository = new ObjectRepository();
const graph = new GraphRepository();
export function showObject(id) {
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
            console.log(`  • ${neighbor.relation} ← ${node.type}: ${objectTitle(node)} (${shortId(neighbor.nodeId)})`);
        }
    }
    if (outgoing.length > 0) {
        console.log("Outgoing:");
        for (const neighbor of outgoing) {
            const node = repository.load(neighbor.nodeId);
            console.log(`  • ${neighbor.relation} → ${node.type}: ${objectTitle(node)} (${shortId(neighbor.nodeId)})`);
        }
    }
}
//# sourceMappingURL=show.command.js.map