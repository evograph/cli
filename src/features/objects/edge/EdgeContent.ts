export const RELATIONS = [
  "solves",
  "informed_by",
  "implemented_by",
  "supersedes",
  "relates_to",
] as const;

export type Relation = (typeof RELATIONS)[number];

export function isRelation(value: string): value is Relation {
  return (RELATIONS as readonly string[]).includes(value);
}

export interface EdgeContent {
  from: string;
  to: string;
  relation: Relation;
}
