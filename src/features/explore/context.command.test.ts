import { useEvolutionFixture } from "#/test/evolution-fixture.js";
import { describe, expect, it, vi } from "vitest";

useEvolutionFixture();

describe("contextCommand", () => {
  it("prints CLI version in the context dump", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const { contextCommand } = await import("./context.command.js");
    const { getCliVersion } = await import("#/kernel/package-version.js");

    contextCommand();

    const output = log.mock.calls.flat().join("\n");
    expect(output).toContain(`CLI version: ${getCliVersion()}`);
    log.mockRestore();
  });
});
