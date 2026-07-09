import { GraphRepository } from "../../features/graph/graph.repository.js";
import { ObjectRepository } from "../../features/objects/object.repository.js";
import { objectTitle, shortId } from "../../features/objects/object.view.js";
import { resolveObjectId } from "../../features/objects/object.store.js";
const repository = new ObjectRepository();
const graph = new GraphRepository();
function describeNode(nodeId) {
    const node = repository.load(nodeId);
    return `${node.type}: ${objectTitle(node)} (${shortId(nodeId)})`;
}
function printTree(nodeId, depth, visited) {
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
export function graphCommand(id) {
    const resolvedId = resolveObjectId(id);
    printTree(resolvedId, 0, new Set());
}
//# sourceMappingURL=graph.command.js.map