import fs from "node:fs";
import path from "node:path";
import { ECS_DIR, OBJECTS_DIR } from "#/kernel/paths.js";
import { ObjectRepository } from "#/features/objects/object.repository.js";
import type { EdgeContent } from "#/features/objects/edge/EdgeContent.js";
import { hash } from "#/kernel/hash.js";
import { getCliVersion } from "#/kernel/package-version.js";

export function inspectRepository() {
  const repository = new ObjectRepository();
  const issues: string[] = [];
  const counts: Record<string, number> = {};
  const ids = repository.list();
  const valid = new Set<string>();
  const edges: { id: string; content: EdgeContent }[] = [];
  const initialized =
    fs.existsSync(OBJECTS_DIR) && fs.statSync(OBJECTS_DIR).isDirectory();
  if (!initialized)
    issues.push("Store is not initialized. Run ecs init --yes.");
  for (const id of ids) {
    try {
      const object = repository.load(id);
      object.validate();
      if (hash(object.canonicalize()) !== id)
        throw new Error("content hash does not match its ID");
      valid.add(id);
      counts[object.type] = (counts[object.type] ?? 0) + 1;
      if (object.type === "edge")
        edges.push({ id, content: object.content as EdgeContent });
    } catch (error) {
      issues.push(
        `${id.slice(0, 8)}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  for (const { id, content } of edges) {
    if (!valid.has(content.from) || !valid.has(content.to))
      issues.push(
        `${id.slice(0, 8)}: relationship points to a missing or invalid record.`,
      );
  }
  const root = path.dirname(ECS_DIR);
  const adapters = [
    "AGENTS.md",
    "CLAUDE.md",
    ".cursor/rules/ecs.mdc",
    ".github/copilot-instructions.md",
    ".windsurf/rules/ecs.md",
  ].filter(
    (file) =>
      fs.existsSync(path.join(root, file)) &&
      fs.readFileSync(path.join(root, file), "utf8").includes(".evolution"),
  );
  return {
    ok: issues.length === 0,
    initialized,
    version: getCliVersion(),
    root,
    store: ECS_DIR,
    counts,
    adapters,
    issues,
    next: !initialized
      ? "ecs init --yes"
      : (counts.decision ?? 0) === 0
        ? 'ecs remember "Your choice" --because "Why it matters"'
        : 'ecs recall "Your task"',
  };
}

export function doctorCommand(options: { json?: boolean } = {}): void {
  const result = inspectRepository();
  if (options.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(
      `ECS ${result.version} — ${result.ok ? "ready" : "needs attention"}\nProject: ${result.root}\nStore: ${result.store}`,
    );
    console.log(
      `Records: ${
        Object.entries(result.counts)
          .map(([type, count]) => `${count} ${type}`)
          .join(", ") || "none"
      }`,
    );
    console.log(
      `Agent instructions: ${result.adapters.join(", ") || "none; run ecs init --yes to add them"}`,
    );
    for (const issue of result.issues) console.log(`! ${issue}`);
    console.log(`Next: ${result.next}`);
  }
  if (!result.ok) process.exitCode = 1;
}

export function statusCommand(options: { json?: boolean } = {}): void {
  const result = inspectRepository();
  if (options.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(
      `Evograph ${result.version}\n${result.root}\n${result.initialized ? `${result.counts.decision ?? 0} decisions · ${result.counts.problem ?? 0} problems · ${result.counts.note ?? 0} notes` : "Get started in this project."}\n\nNext: ${result.next}\nHelp: ecs --help`,
    );
    if (result.issues.length && result.initialized)
      console.log("Some records need attention. Run ecs doctor.");
  }
}
