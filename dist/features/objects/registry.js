import { Change } from "../../features/objects/change/Change.js";
import { Decision } from "../../features/objects/decision/Decision.js";
import { Edge } from "../../features/objects/edge/Edge.js";
import { Note } from "../../features/objects/note/Note.js";
import { Problem } from "../../features/objects/problem/Problem.js";
const registry = {
    note: (record) => Note.fromJSON(record),
    edge: (record) => Edge.fromJSON(record),
    problem: (record) => Problem.fromJSON(record),
    decision: (record) => Decision.fromJSON(record),
    change: (record) => Change.fromJSON(record),
};
export function deserialize(record) {
    const deserializer = registry[record.header.type];
    if (!deserializer) {
        throw new Error(`Unknown object type: ${record.header.type}`);
    }
    return deserializer(record);
}
//# sourceMappingURL=registry.js.map