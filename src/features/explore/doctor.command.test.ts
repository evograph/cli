import { useEvolutionFixture, getMockPaths } from "#/test/evolution-fixture.js";
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { remember } from "#/features/create/remember.command.js";
import { inspectRepository } from "./doctor.command.js";
import { ObjectRepository } from "#/features/objects/object.repository.js";
import { Edge } from "#/features/objects/edge/Edge.js";

useEvolutionFixture();
describe("store diagnostics", () => {
  it("reports an empty initialized store without treating it as broken", () => {
    const result = inspectRepository();
    expect(result.ok).toBe(true);
    expect(result.initialized).toBe(true);
    expect(result.next).toContain("remember");
  });
  it("reports content tampering and dangling relationships", () => {
    const saved = remember("Use SQLite", { because: "Offline" });
    new ObjectRepository().save(
      new Edge({ from: saved.id, to: "f".repeat(64), relation: "relates_to" }),
    );
    const target = path.join(
      getMockPaths().OBJECTS_DIR,
      "decisions",
      saved.id.slice(0, 2),
      saved.id.slice(2),
    );
    const record = JSON.parse(fs.readFileSync(target, "utf8"));
    record.content.rationale = "Changed without rehashing";
    fs.writeFileSync(target, JSON.stringify(record));
    const result = inspectRepository();
    expect(result.ok).toBe(false);
    expect(result.issues.join("\n")).toContain("content hash");
    expect(result.issues.join("\n")).toContain("missing or invalid record");
  });
});
