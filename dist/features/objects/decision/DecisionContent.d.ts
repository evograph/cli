export declare const DECISION_STATUSES: readonly ["proposed", "in-progress", "successful", "failed"];
export interface DecisionContent {
    title: string;
    problem?: string;
    alternatives: string[];
    chosen: string;
    rationale: string;
    expectedOutcome?: string;
    status: string;
}
//# sourceMappingURL=DecisionContent.d.ts.map