import fs from "node:fs";

import {
  decisionFromFlags,
  problemFromFlags,
  resolveCreateMeta,
  type AuthorOptions,
} from "#/features/create/create.service.js";
import { GraphRepository } from "#/features/graph/graph.repository.js";
import { ObjectRepository } from "#/features/objects/object.repository.js";
import { resolveObjectId } from "#/features/objects/object.store.js";
import { shortId } from "#/features/objects/object.view.js";
import { ECS_DIR } from "#/kernel/paths.js";
import { Decision } from "#/features/objects/decision/Decision.js";
import { Problem } from "#/features/objects/problem/Problem.js";

const repository = new ObjectRepository();
const graph = new GraphRepository();

export type CloseSessionOptions = AuthorOptions & {
  problemId?: string;
  problemTitle?: string;
  problemDescription?: string;
  severity?: string;
  problemContext?: string;
  decisionTitle?: string;
  chosen?: string;
  rationale?: string;
  alternatives?: string;
  status?: string;
  expectedOutcome?: string;
  dryRun?: boolean;
};

function ensureRepo(): boolean {
  if (!fs.existsSync(ECS_DIR)) {
    console.error(
      "No ECS repository found. Run `ecs init` in this directory first.",
    );
    process.exitCode = 1;
    return false;
  }
  return true;
}

export function closeSessionCommand(options: CloseSessionOptions = {}): void {
  if (!ensureRepo()) {
    return;
  }

  const meta = resolveCreateMeta(options);

  const decisionTitle = options.decisionTitle;
  const chosen = options.chosen;
  const rationale = options.rationale;

  if (!decisionTitle || !chosen || !rationale) {
    console.error(
      "close-session requires --decision-title, --chosen, and --rationale",
    );
    process.exitCode = 1;
    return;
  }

  let problemId: string;
  let problemCreated = false;

  // Validate before saving a problem, including in dry-run mode.
  new Decision({
    title: decisionTitle,
    chosen,
    rationale,
    alternatives: [],
    status: options.status ?? "in-progress",
  }).validate();
  if (
    !options.problemId &&
    options.problemTitle &&
    options.problemDescription
  ) {
    new Problem({
      title: options.problemTitle,
      description: options.problemDescription,
      severity: options.severity ?? "medium",
    }).validate();
  }

  if (options.problemId) {
    try {
      problemId = resolveObjectId(options.problemId);
      const problem = repository.load(problemId);
      if (problem.type !== "problem") {
        console.error(`Object '${options.problemId}' is not a problem.`);
        process.exitCode = 1;
        return;
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
      return;
    }
  } else {
    if (!options.problemTitle || !options.problemDescription) {
      console.error(
        "close-session requires --problem-title and --problem-description (or --problem-id)",
      );
      process.exitCode = 1;
      return;
    }

    if (options.dryRun) {
      console.log("[dry-run] Would create problem:");
      console.log(`  title: ${options.problemTitle}`);
      console.log(`  description: ${options.problemDescription}`);
      console.log(`  severity: ${options.severity ?? "medium"}`);
      console.log("[dry-run] Would create decision:");
      console.log(`  title: ${decisionTitle}`);
      console.log(`  chosen: ${chosen}`);
      console.log(`  rationale: ${rationale}`);
      console.log(`  alternatives: ${options.alternatives ?? "(none)"}`);
      console.log(`  status: ${options.status ?? "in-progress"}`);
      console.log("[dry-run] Would link decision --[solves]--> problem");
      return;
    }

    const result = problemFromFlags(
      {
        title: options.problemTitle,
        description: options.problemDescription,
        severity: options.severity ?? "medium",
        ...(options.problemContext !== undefined
          ? { context: options.problemContext }
          : {}),
      },
      meta,
    );
    problemId = result.id;
    problemCreated = result.created;
  }

  if (options.dryRun) {
    console.log(`[dry-run] Would reuse problem ${problemId}`);
    console.log("[dry-run] Would create decision and link solves");
    return;
  }

  const decisionProblemText = options.problemTitle ?? options.problemId;

  const decisionResult = decisionFromFlags(
    {
      title: decisionTitle,
      chosen,
      rationale,
      status: options.status ?? "in-progress",
      ...(options.alternatives !== undefined
        ? { alternatives: options.alternatives }
        : {}),
      ...(options.expectedOutcome !== undefined
        ? { expectedOutcome: options.expectedOutcome }
        : {}),
      ...(decisionProblemText !== undefined
        ? { problem: decisionProblemText }
        : {}),
    },
    meta,
  );

  const link = graph.link(decisionResult.id, problemId, "solves", meta);

  if (options.problemId) {
    console.log(`Problem ${problemId} (reused)`);
  } else if (problemCreated) {
    console.log(`Created problem ${problemId}`);
  } else {
    console.log(`No evolution: problem already exists at ${problemId}`);
  }

  if (decisionResult.created) {
    console.log(`Created decision ${decisionResult.id}`);
  } else {
    console.log(
      `No evolution: decision already exists at ${decisionResult.id}`,
    );
  }

  if (link.created) {
    console.log(
      `Linked: ${shortId(decisionResult.id)} --[solves]--> ${shortId(problemId)}`,
    );
    console.log(`Edge recorded at ${link.edgeId}`);
  } else {
    console.log(
      `No evolution: this relationship already exists at ${link.edgeId}`,
    );
  }
}
