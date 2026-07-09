export declare const RELATIONS: readonly ["solves", "informed_by", "implemented_by", "supersedes", "relates_to"];
export type Relation = (typeof RELATIONS)[number];
export declare function isRelation(value: string): value is Relation;
export interface EdgeContent {
    from: string;
    to: string;
    relation: Relation;
}
//# sourceMappingURL=EdgeContent.d.ts.map