import type { ChangedFile } from "../../features/objects/change/ChangeContent.js";
export declare function isGitRepo(): boolean;
export interface CommitInfo {
    sha: string;
    shortSha: string;
    message: string;
}
export declare function getRecentCommits(limit?: number): CommitInfo[];
export declare function getWorktreeChanges(): ChangedFile[];
export declare function getCommitChanges(sha: string): ChangedFile[];
//# sourceMappingURL=git.service.d.ts.map