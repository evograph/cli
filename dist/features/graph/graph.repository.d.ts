import type { ECSObjectMetadata } from "../../kernel/ECSObjectRecord.js";
import type { Relation } from "../../features/objects/edge/EdgeContent.js";
export type LinkResult = {
    edgeId: string;
    created: boolean;
    from: string;
    to: string;
    relation: Relation;
};
export type Neighbor = {
    edgeId: string;
    relation: Relation;
    nodeId: string;
};
export declare class GraphRepository {
    link(from: string, to: string, relation: Relation, metadata?: Partial<ECSObjectMetadata>): LinkResult;
    outgoing(nodeId: string): Neighbor[];
    incoming(nodeId: string): Neighbor[];
    neighbors(nodeId: string): {
        incoming: Neighbor[];
        outgoing: Neighbor[];
    };
    descendants(nodeId: string): Neighbor[];
    ancestors(nodeId: string): Neighbor[];
    private walk;
}
//# sourceMappingURL=graph.repository.d.ts.map