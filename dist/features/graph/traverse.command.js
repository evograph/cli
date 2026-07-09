import { GraphRepository } from "../../features/graph/graph.repository.js";
import { ObjectRepository } from "../../features/objects/object.repository.js";
import { objectTitle, shortId } from "../../features/objects/object.view.js";
const repository = new ObjectRepository();
const graph = new GraphRepository();
function describeNode(nodeId) {
    const node = repository.load(nodeId);
    return `${node.type}: ${objectTitle(node)} (${shortId(nodeId)})`;
}
function printNeighborList(title, neighbors) {
    if (neighbors.length === 0) {
        console.log(`${title}: none`);
        return;
    }
    console.log(`${title}:`);
    for (const neighbor of neighbors) {
        console.log(`  • ${neighbor.relation} — ${describeNode(neighbor.nodeId)}`);
    }
}
export function neighborsCommand(id) {
    const { incoming, outgoing } = graph.neighbors(id);
    printNeighborList("Incoming", incoming);
    printNeighborList("Outgoing", outgoing);
}
export function ancestorsCommand(id) {
    printNeighborList("Ancestors", graph.ancestors(id));
}
export function descendantsCommand(id) {
    printNeighborList("Descendants", graph.descendants(id));
}
//# sourceMappingURL=traverse.command.js.map