import { resolveAuthor } from "#/kernel/author.js";
import type { ECSObjectMetadata } from "#/kernel/ECSObjectRecord.js";
import { ObjectRepository } from "#/features/objects/object.repository.js";
import type { SaveObjectResult } from "#/features/objects/object.store.js";
import { Decision } from "#/features/objects/decision/Decision.js";
import type { DecisionContent } from "#/features/objects/decision/DecisionContent.js";
import { Note } from "#/features/objects/note/Note.js";
import type { NoteContent } from "#/features/objects/note/NoteContent.js";
import { Problem } from "#/features/objects/problem/Problem.js";
import type { ProblemContent } from "#/features/objects/problem/ProblemContent.js";

const repository = new ObjectRepository();

export type AuthorOptions = {
  author?: string;
  authorEmail?: string;
};

export function resolveCreateMeta(
  options: AuthorOptions = {}
): Partial<ECSObjectMetadata> {
  const author = resolveAuthor({
    ...(options.author !== undefined ? { name: options.author } : {}),
    ...(options.authorEmail !== undefined ? { mail: options.authorEmail } : {}),
  });

  return author ? { author } : {};
}

export function parseCommaList(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function saveNote(
  content: NoteContent,
  meta: Partial<ECSObjectMetadata> = {}
): SaveObjectResult {
  const note = new Note(content, meta);
  return repository.save(note);
}

export function saveProblem(
  content: ProblemContent,
  meta: Partial<ECSObjectMetadata> = {}
): SaveObjectResult {
  const problem = new Problem(content, meta);
  return repository.save(problem);
}

export function saveDecision(
  content: DecisionContent,
  meta: Partial<ECSObjectMetadata> = {}
): SaveObjectResult {
  const decision = new Decision(content, meta);
  return repository.save(decision);
}

export type NoteFlags = {
  title?: string;
  body?: string;
};

export type ProblemFlags = {
  title?: string;
  description?: string;
  severity?: string;
  context?: string;
};

export type DecisionFlags = {
  title?: string;
  chosen?: string;
  rationale?: string;
  alternatives?: string;
  status?: string;
  problem?: string;
  expectedOutcome?: string;
};

export function hasNoteFlags(flags: NoteFlags): boolean {
  return Boolean(flags.title && flags.body);
}

export function hasProblemFlags(flags: ProblemFlags): boolean {
  return Boolean(flags.title && flags.description && flags.severity);
}

export function hasDecisionFlags(flags: DecisionFlags): boolean {
  return Boolean(
    flags.title && flags.chosen && flags.rationale && flags.status
  );
}

export function noteFromFlags(
  flags: NoteFlags,
  meta: Partial<ECSObjectMetadata> = {}
): SaveObjectResult {
  if (!flags.title || !flags.body) {
    throw new Error("Note requires --title and --body");
  }

  return saveNote({ title: flags.title, body: flags.body }, meta);
}

export function problemFromFlags(
  flags: ProblemFlags,
  meta: Partial<ECSObjectMetadata> = {}
): SaveObjectResult {
  if (!flags.title || !flags.description || !flags.severity) {
    throw new Error("Problem requires --title, --description, and --severity");
  }

  return saveProblem(
    {
      title: flags.title,
      description: flags.description,
      severity: flags.severity,
      ...(flags.context !== undefined ? { context: flags.context } : {}),
    },
    meta
  );
}

export function decisionFromFlags(
  flags: DecisionFlags,
  meta: Partial<ECSObjectMetadata> = {}
): SaveObjectResult {
  if (!flags.title || !flags.chosen || !flags.rationale || !flags.status) {
    throw new Error(
      "Decision requires --title, --chosen, --rationale, and --status"
    );
  }

  return saveDecision(
    {
      title: flags.title,
      alternatives: parseCommaList(flags.alternatives),
      chosen: flags.chosen,
      rationale: flags.rationale,
      status: flags.status,
      ...(flags.problem !== undefined ? { problem: flags.problem } : {}),
      ...(flags.expectedOutcome !== undefined
        ? { expectedOutcome: flags.expectedOutcome }
        : {}),
    },
    meta
  );
}
