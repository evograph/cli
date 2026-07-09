import type { ECSObjectMetadata } from "#/kernel/ECSObjectRecord.js";
import { Edge } from "#/features/objects/edge/Edge.js";
import type { EdgeContent, Relation } from "#/features/objects/edge/EdgeContent.js";
import { ObjectRepository } from "#/features/objects/object.repository.js";
import { resolveObjectId } from "#/features/objects/object.store.js";
import {
  indexEdge,
  getIncomingEdgeIds,
  getOutgoingEdgeIds,
} from "#/features/graph/graph.index.js";

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

const repository = new ObjectRepository();

function loadEdgeContent(edgeId: string): EdgeContent {
  const edge = repository.load(edgeId);

  if (!(edge instanceof Edge)) {
    throw new Error(`Object '${edgeId}' is not an edge.`);
  }

  return edge.content;
}

export class GraphRepository {
  link(
    from: string,
    to: string,
    relation: Relation,
    metadata: Partial<ECSObjectMetadata> = {}
  ): LinkResult {
    const fromId = resolveObjectId(from);
    const toId = resolveObjectId(to);

    const edge = new Edge({ from: fromId, to: toId, relation }, metadata);

    const { id: edgeId, created } = repository.save(edge);

    indexEdge(edgeId, fromId, toId);

    return { edgeId, created, from: fromId, to: toId, relation };
  }

  outgoing(nodeId: string): Neighbor[] {
    const resolvedId = resolveObjectId(nodeId);

    return getOutgoingEdgeIds(resolvedId).map((edgeId) => {
      const content = loadEdgeContent(edgeId);
      return { edgeId, relation: content.relation, nodeId: content.to };
    });
  }

  incoming(nodeId: string): Neighbor[] {
    const resolvedId = resolveObjectId(nodeId);

    return getIncomingEdgeIds(resolvedId).map((edgeId) => {
      const content = loadEdgeContent(edgeId);
      return { edgeId, relation: content.relation, nodeId: content.from };
    });
  }

  neighbors(nodeId: string): { incoming: Neighbor[]; outgoing: Neighbor[] } {
    return {
      incoming: this.incoming(nodeId),
      outgoing: this.outgoing(nodeId),
    };
  }

  descendants(nodeId: string): Neighbor[] {
    return this.walk(nodeId, (id) => this.outgoing(id));
  }

  ancestors(nodeId: string): Neighbor[] {
    return this.walk(nodeId, (id) => this.incoming(id));
  }

  private walk(
    startId: string,
    next: (id: string) => Neighbor[]
  ): Neighbor[] {
    const start = resolveObjectId(startId);
    const visited = new Set<string>([start]);
    const result: Neighbor[] = [];
    const queue = [start];

    while (queue.length > 0) {
      const current = queue.shift()!;

      for (const neighbor of next(current)) {
        if (visited.has(neighbor.nodeId)) {
          continue;
        }

        visited.add(neighbor.nodeId);
        result.push(neighbor);
        queue.push(neighbor.nodeId);
      }
    }

    return result;
  }
}
