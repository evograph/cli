import fs from "node:fs";
import path from "node:path";
import { INDEX_DIR } from "../../kernel/paths.js";
function getIndexPath(direction, nodeId) {
    return path.join(INDEX_DIR, direction, nodeId);
}
function readEdgeIds(direction, nodeId) {
    const filePath = getIndexPath(direction, nodeId);
    if (!fs.existsSync(filePath)) {
        return [];
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
function appendEdgeId(direction, nodeId, edgeId) {
    const filePath = getIndexPath(direction, nodeId);
    const edgeIds = readEdgeIds(direction, nodeId);
    if (edgeIds.includes(edgeId)) {
        return;
    }
    edgeIds.push(edgeId);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(edgeIds), "utf8");
}
export function indexEdge(edgeId, from, to) {
    appendEdgeId("outgoing", from, edgeId);
    appendEdgeId("incoming", to, edgeId);
}
export function getOutgoingEdgeIds(nodeId) {
    return readEdgeIds("outgoing", nodeId);
}
export function getIncomingEdgeIds(nodeId) {
    return readEdgeIds("incoming", nodeId);
}
//# sourceMappingURL=graph.index.js.map