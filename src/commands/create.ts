import {
  confirm,
  intro,
  log,
  multiselect,
  outro,
  select,
} from "@clack/prompts";

import { resolveAuthor } from "#/config/author.js";
import { ECSObject } from "#/core/ECSObject.js";
import type { ECSObjectMetadata } from "#/core/ECSObjectRecord.js";
import {
  ensure,
  optionalText,
  requiredText,
  selectWithCustom,
} from "#/prompts/helpers.js";
import { GraphRepository } from "#/repositories/GraphRepository.js";
import { ObjectRepository } from "#/repositories/ObjectRepository.js";
import {
  getCommitChanges,
  getRecentCommits,
  getWorktreeChanges,
  isGitRepo,
} from "#/services/git.js";
import { Change } from "#/types/Change.js";
import type { ChangedFile } from "#/types/ChangeContent.js";
import { Decision } from "#/types/Decision.js";
import { DECISION_STATUSES } from "#/types/DecisionContent.js";
import { Note } from "#/types/Note.js";
import { Problem } from "#/types/Problem.js";
import { SEVERITIES } from "#/types/ProblemContent.js";

const repository = new ObjectRepository();
const graph = new GraphRepository();

const OBJECT_TYPES = ["note", "problem", "decision"] as const;
type ObjectType = (typeof OBJECT_TYPES)[number];

export type CreateOptions = {
  author?: string;
  authorEmail?: string;
};

function shortId(id: string): string {
  return id.substring(0, 8);
}

function sortFiles(files: ChangedFile[]): ChangedFile[] {
  return [...files].sort((a, b) => a.path.localeCompare(b.path));
}

function contentTitle(object: ECSObject<unknown>): string {
  const content = object.content as { title?: string };
  return content.title ?? "(untitled)";
}

async function buildNote(
  meta: Partial<ECSObjectMetadata>
): Promise<Note> {
  const title = await requiredText("Title", "Short summary");
  const body = await requiredText("Body", "The note itself");

  return new Note({ title, body }, meta);
}

async function buildProblem(
  meta: Partial<ECSObjectMetadata>
): Promise<Problem> {
  const title = await requiredText("Problem title", "What is wrong?");
  const description = await requiredText("Description", "Describe the problem");
  const context = await optionalText("Context (optional)", "Background, links");
  const severity = await selectWithCustom({
    message: "Severity",
    choices: SEVERITIES,
  });

  return new Problem(
    {
      title,
      description,
      severity,
      ...(context !== undefined ? { context } : {}),
    },
    meta
  );
}

async function buildDecision(
  meta: Partial<ECSObjectMetadata>
): Promise<Decision> {
  const title = await requiredText("Decision title", "What was decided?");
  const problem = await optionalText(
    "Problem this addresses (optional)",
    "Short description"
  );
  const alternativesRaw = await optionalText(
    "Alternatives considered (comma-separated, optional)",
    "Option A, Option B"
  );
  const alternatives = alternativesRaw
    ? alternativesRaw
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    : [];
  const chosen = await requiredText("Chosen option", "What you picked");
  const rationale = await requiredText("Rationale", "Why this choice");
  const expectedOutcome = await optionalText(
    "Expected outcome (optional)",
    "What you expect to happen"
  );
  const status = await selectWithCustom({
    message: "Status",
    choices: DECISION_STATUSES,
  });

  return new Decision(
    {
      title,
      alternatives,
      chosen,
      rationale,
      status,
      ...(problem !== undefined ? { problem } : {}),
      ...(expectedOutcome !== undefined ? { expectedOutcome } : {}),
    },
    meta
  );
}

async function maybeLinkProblem(
  decisionId: string,
  meta: Partial<ECSObjectMetadata>
): Promise<void> {
  const problems = repository.listByType("problem");

  if (problems.length === 0) {
    return;
  }

  const doLink = ensure(
    await confirm({
      message: "Link this decision to an existing problem?",
      initialValue: true,
    })
  );

  if (!doLink) {
    return;
  }

  const problemId = ensure(
    await select({
      message: "Select a problem",
      options: problems.map((entry) => ({
        value: entry.id,
        label: contentTitle(entry.object),
        hint: shortId(entry.id),
      })),
    })
  ) as string;

  graph.link(decisionId, problemId, "solves", meta);
  log.success(`Linked decision --solves--> problem (${shortId(problemId)})`);
}

async function maybeLinkGitChanges(
  objectId: string,
  type: ObjectType,
  meta: Partial<ECSObjectMetadata>
): Promise<void> {
  if (!isGitRepo()) {
    return;
  }

  const worktree = getWorktreeChanges();
  const commits = getRecentCommits(10);

  if (worktree.length === 0 && commits.length === 0) {
    return;
  }

  const doLink = ensure(
    await confirm({
      message: `Link code changes to this ${type}?`,
      initialValue: true,
    })
  );

  if (!doLink) {
    return;
  }

  const sourceOptions: { value: string; label: string }[] = [];

  if (worktree.length > 0) {
    sourceOptions.push({
      value: "worktree",
      label: `Uncommitted changes (${worktree.length} file(s))`,
    });
  }

  if (commits.length > 0) {
    sourceOptions.push({ value: "commit", label: "A specific commit" });
  }

  const source = ensure(
    await select({ message: "Which changes?", options: sourceOptions })
  ) as string;

  let change: Change;

  if (source === "worktree") {
    const selected = ensure(
      await multiselect({
        message: "Select files to link",
        options: worktree.map((file) => ({
          value: file.path,
          label: `${file.status || "?"} ${file.path}`,
        })),
        initialValues: worktree.map((file) => file.path),
        required: true,
      })
    ) as string[];

    const files = sortFiles(
      worktree.filter((file) => selected.includes(file.path))
    );

    change = new Change({ kind: "worktree", files }, meta);
  } else {
    const sha = ensure(
      await select({
        message: "Select a commit",
        options: commits.map((commit) => ({
          value: commit.sha,
          label: `${commit.shortSha} ${commit.message}`,
        })),
      })
    ) as string;

    const commit = commits.find((entry) => entry.sha === sha)!;
    const files = sortFiles(getCommitChanges(sha));

    change = new Change(
      {
        kind: "commit",
        commit: commit.sha,
        message: commit.message,
        files,
      },
      meta
    );
  }

  const { id: changeId } = repository.save(change);
  graph.link(objectId, changeId, "implemented_by", meta);
  log.success(
    `Linked ${type} --implemented_by--> change (${shortId(changeId)})`
  );
}

export async function createCommand(
  typeArg: string | undefined,
  options: CreateOptions = {}
): Promise<void> {
  intro("ecs create");

  const author = resolveAuthor({
    ...(options.author !== undefined ? { name: options.author } : {}),
    ...(options.authorEmail !== undefined ? { mail: options.authorEmail } : {}),
  });
  const meta: Partial<ECSObjectMetadata> = author ? { author } : {};

  let type: ObjectType;

  if (typeArg && (OBJECT_TYPES as readonly string[]).includes(typeArg)) {
    type = typeArg as ObjectType;
  } else {
    if (typeArg) {
      log.warn(`Unknown type '${typeArg}'. Choose one below.`);
    }

    type = ensure(
      await select({
        message: "What do you want to create?",
        options: [
          { value: "note", label: "Note", hint: "A freeform note" },
          { value: "problem", label: "Problem", hint: "Something to solve" },
          {
            value: "decision",
            label: "Decision",
            hint: "A choice with rationale",
          },
        ],
      })
    ) as ObjectType;
  }

  let object: ECSObject<unknown>;

  if (type === "note") {
    object = await buildNote(meta);
  } else if (type === "problem") {
    object = await buildProblem(meta);
  } else {
    object = await buildDecision(meta);
  }

  const { id, created } = repository.save(object);

  if (created) {
    log.success(`Created ${type} ${id}`);
  } else {
    log.info(`No evolution: this ${type} already exists at ${id}`);
  }

  if (type === "decision") {
    await maybeLinkProblem(id, meta);
  }

  await maybeLinkGitChanges(id, type, meta);

  outro(`Done — ${type} ${shortId(id)}`);
}
