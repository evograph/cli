import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const execSync = vi.fn();

vi.mock("node:child_process", () => ({
  execSync: (...args: unknown[]) => execSync(...args),
}));

describe("resolveAuthor", () => {
  beforeEach(() => {
    execSync.mockReset();
    vi.stubEnv("ECS_AUTHOR", "");
    vi.stubEnv("ECS_AUTHOR_EMAIL", "");
    delete process.env.ECS_AUTHOR;
    delete process.env.ECS_AUTHOR_EMAIL;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function load() {
    return import("./author.js");
  }

  it("returns undefined when no name is available", async () => {
    execSync.mockImplementation(() => {
      throw new Error("no git");
    });

    const { resolveAuthor } = await load();
    expect(resolveAuthor()).toBeUndefined();
  });

  it("prefers overrides over env and git", async () => {
    vi.stubEnv("ECS_AUTHOR", "Env User");
    vi.stubEnv("ECS_AUTHOR_EMAIL", "env@example.com");
    execSync.mockReturnValue("Git User\n");

    const { resolveAuthor } = await load();
    expect(
      resolveAuthor({ name: "Override", mail: "override@example.com" }),
    ).toEqual({
      name: "Override",
      mail: "override@example.com",
    });
  });

  it("falls back to env then git", async () => {
    vi.stubEnv("ECS_AUTHOR", "Env User");
    execSync.mockImplementation((cmd: string) => {
      if (cmd.includes("user.email")) return "git@example.com\n";
      throw new Error("missing");
    });

    const { resolveAuthor } = await load();
    expect(resolveAuthor()).toEqual({
      name: "Env User",
      mail: "git@example.com",
    });
  });

  it("omits mail when only name is resolved", async () => {
    execSync.mockImplementation((cmd: string) => {
      if (cmd.includes("user.name")) return "Git Only\n";
      throw new Error("no email");
    });

    const { resolveAuthor } = await load();
    expect(resolveAuthor()).toEqual({ name: "Git Only" });
  });

  it("treats empty git config as missing", async () => {
    execSync.mockReturnValue("   \n");

    const { resolveAuthor } = await load();
    expect(resolveAuthor()).toBeUndefined();
  });
});
