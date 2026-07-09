import { execSync } from "node:child_process";

import type { Author } from "#/kernel/ECSObjectRecord.js";

function getGitConfig(key: string): string | undefined {
  try {
    const value = execSync(`git config ${key}`, { encoding: "utf8" }).trim();
    return value || undefined;
  } catch {
    return undefined;
  }
}

export type AuthorOverrides = {
  name?: string;
  mail?: string;
};

export function resolveAuthor(
  overrides: AuthorOverrides = {}
): Author | undefined {
  const name =
    overrides.name ?? process.env.ECS_AUTHOR ?? getGitConfig("user.name");
  const mail =
    overrides.mail ??
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
