export const DECISION_STATUSES = [
  "proposed",
  "in-progress",
  "successful",
  "failed",
] as const;

export interface DecisionContent {
  title: string;
  problem?: string;
  alternatives: string[];
  chosen: string;
  rationale: string;
  expectedOutcome?: string;
  status: string;
}
