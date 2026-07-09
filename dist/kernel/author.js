import { execSync } from "node:child_process";
function getGitConfig(key) {
    try {
        const value = execSync(`git config ${key}`, { encoding: "utf8" }).trim();
        return value || undefined;
    }
    catch {
        return undefined;
    }
}
export function resolveAuthor(overrides = {}) {
    const name = overrides.name ?? process.env.ECS_AUTHOR ?? getGitConfig("user.name");
    const mail = overrides.mail ??
        process.env.ECS_AUTHOR_EMAIL ??
        getGitConfig("user.email");
    if (!name) {
        return undefined;
    }
    return {
        name,
        ...(mail !== undefined ? { mail } : {}),
    };
}
//# sourceMappingURL=author.js.map