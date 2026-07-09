import { execSync } from "node:child_process";
function git(args) {
    return execSync(`git ${args}`, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }).trim();
}
export function isGitRepo() {
    try {
        return git("rev-parse --is-inside-work-tree") === "true";
    }
    catch {
        return false;
    }
}
export function getRecentCommits(limit = 10) {
    try {
        const out = git(`log --pretty=format:%H%x1f%h%x1f%s -n ${limit}`);
        if (!out) {
            return [];
        }
        return out.split("\n").map((line) => {
            const [sha = "", shortSha = "", message = ""] = line.split("\x1f");
            return { sha, shortSha, message };
        });
    }
    catch {
        return [];
    }
}
export function getWorktreeChanges() {
    try {
        const out = git("status --porcelain");
        if (!out) {
            return [];
        }
        return out.split("\n").map((line) => {
            const status = line.slice(0, 2).trim();
            const path = line.slice(3);
            return { status, path };
        });
    }
    catch {
        return [];
    }
}
export function getCommitChanges(sha) {
    try {
        const out = git(`show --name-status --pretty=format: ${sha}`);
        return out
            .split("\n")
            .filter((line) => line.trim().length > 0)
            .map((line) => {
            const tab = line.indexOf("\t");
            const status = tab >= 0 ? line.slice(0, tab).trim() : line.trim();
            const path = tab >= 0 ? line.slice(tab + 1).trim() : "";
            return { status, path };
        });
    }
    catch {
        return [];
    }
}
//# sourceMappingURL=git.service.js.map