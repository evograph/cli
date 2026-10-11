import path from "node:path";
import { execFileSync } from "node:child_process";
import { Decision } from "#/features/objects/decision/Decision.js";
import { Problem } from "#/features/objects/problem/Problem.js";
import { Change } from "#/features/objects/change/Change.js";
import { DECISION_STATUSES } from "#/features/objects/decision/DecisionContent.js";
import { ObjectRepository } from "#/features/objects/object.repository.js";
import { resolveObjectId } from "#/features/objects/object.store.js";
import { GraphRepository } from "#/features/graph/graph.repository.js";
import { ECS_DIR } from "#/kernel/paths.js";
import { hash } from "#/kernel/hash.js";
import { requireRepository } from "#/kernel/repository.js";
import { resolveCreateMeta, type AuthorOptions } from "./create.service.js";

export type RememberOptions = AuthorOptions & {
  because?: string;
  problem?: string;
  problemId?: string;
  files?: string[];
  commit?: string;
  supersedes?: string;
  status?: string;
  dryRun?: boolean;
  json?: boolean;
};
const repository = new ObjectRepository();
const graph = new GraphRepository();

export function remember(title: string, options: RememberOptions = {}) {
  requireRepository();
  if (!title.trim())
    throw new Error(
      'Provide a decision: ecs remember "Use SQLite" --because "Runs locally"',
    );
  if (!options.because?.trim())
    throw new Error(
      'Explain the reason with --because "Why this choice helps".',
    );
  if (title.length > 500 || options.because.length > 20000)
    throw new Error(
      "Keep the choice under 500 characters and its reason under 20,000 characters.",
    );
  const status = options.status ?? "in-progress";
  if (!(DECISION_STATUSES as readonly string[]).includes(status))
    throw new Error(
      `Unknown status '${status}'. Use ${DECISION_STATUSES.join(", ")}.`,
    );
  if (options.problem && options.problemId)
    throw new Error("Use either --problem or --problem-id, not both.");
  const root = path.dirname(ECS_DIR);
  const files = [
    ...new Set(
      (options.files ?? []).map((file) => {
        const relative = path
          .relative(root, path.resolve(file))
          .split(path.sep)
          .join("/");
        if (
          !relative ||
          relative === ".." ||
          relative.startsWith("../") ||
          path.isAbsolute(relative)
        )
          throw new Error(`File '${file}' must be inside the project.`);
        return relative;
      }),
    ),
  ].sort();
  const meta = resolveCreateMeta(options);
  let problemId: string | undefined;
  let problem: Problem | undefined;
  if (options.problemId) {
    problemId = resolveObjectId(options.problemId);
    if (repository.load(problemId).type !== "problem")
      throw new Error("--problem-id must identify a problem.");
  } else if (options.problem !== undefined) {
    problem = new Problem(
      {
        title: options.problem.trim(),
        description: options.problem.trim(),
        severity: "medium",
      },
      meta,
    );
    problem.validate();
    problemId = hash(problem.canonicalize());
  }
  let previous: string | undefined;
  if (options.supersedes) {
    previous = resolveObjectId(options.supersedes);
    if (repository.load(previous).type !== "decision")
      throw new Error("--supersedes must identify a decision.");
  }
  let change: Change | undefined;
  if (options.commit) {
    try {
      const git = (...args: string[]) =>
        execFileSync("git", ["-C", root, ...args], {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      const sha = git(
        "rev-parse",
        "--verify",
        "--end-of-options",
        `${options.commit}^{commit}`,
      ).trim();
      const paths = git(
        "diff-tree",
        "--root",
        "--no-commit-id",
        "--name-only",
        "-r",
        "-z",
        sha,
      )
        .split("\0")
        .filter(
          (file) =>
            file && file !== ".evolution" && !file.startsWith(".evolution/"),
        );
      change = new Change(
        {
          kind: "commit",
          commit: sha,
          message: git("show", "-s", "--format=%s", sha).trim(),
          files: paths.map((file) => ({ path: file, status: "committed" })),
        },
        meta,
      );
      change.validate();
    } catch {
      throw new Error(
        `Could not attach commit '${options.commit}'. Check the ref and that it changes files.`,
      );
    }
  }
  const decision = new Decision(
    {
      title: title.trim(),
      chosen: title.trim(),
      rationale: options.because.trim(),
      alternatives: [],
      status,
      ...(files.length ? { files } : {}),
      ...(problem ? { problem: problem.content.description } : {}),
    },
    meta,
  );
  decision.validate();
  const id = hash(decision.canonicalize());
  if (previous === id)
    throw new Error(
      "A decision cannot supersede itself. Explain what changed.",
    );
  const result = {
    id,
    created: !repository.exists(id),
    dryRun: options.dryRun ?? false,
    decision: decision.content,
    ...(problemId ? { problemId } : {}),
    ...(previous ? { supersedes: previous } : {}),
    ...(change ? { commit: change.content.commit } : {}),
  };
  if (options.dryRun) return result;
  // Validate every input before creating anything; the store is append-only.
  if (problem) repository.save(problem);
  repository.save(decision);
  if (problemId) graph.link(id, problemId, "solves", meta);
  if (previous) graph.link(id, previous, "supersedes", meta);
  if (change)
    graph.link(id, repository.save(change).id, "implemented_by", meta);
  return result;
}

export function rememberCommand(
  title: string,
  options: RememberOptions = {},
): void {
  const result = remember(title, options);
  if (options.json || options.dryRun)
    console.log(JSON.stringify(result, null, 2));
  else
    console.log(
      `${result.created ? "Saved" : "Already saved"} decision ${result.id.slice(0, 8)}.\nRecall it with: ecs recall "${title.replaceAll('"', "'")}"`,
    );
}
