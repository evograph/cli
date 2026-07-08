export const SEVERITIES = ["low", "medium", "high", "critical"] as const;

export interface ProblemContent {
  title: string;
  description: string;
  context?: string;
  severity: string;
}
