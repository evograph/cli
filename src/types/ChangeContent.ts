export type ChangeKind = "commit" | "worktree";

export interface ChangedFile {
  path: string;
  status: string;
}

export interface ChangeContent {
  kind: ChangeKind;
  commit?: string;
  message?: string;
  files: ChangedFile[];
}
