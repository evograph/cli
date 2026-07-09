import { confirm, intro, log, multiselect, outro, select, } from "@clack/prompts";
import { resolveAuthor } from "../../kernel/author.js";
import { ECSObject } from "../../kernel/ECSObject.js";
import { ensure, optionalText, requiredText, selectWithCustom, } from "../../kernel/prompts.js";
import { GraphRepository } from "../../features/graph/graph.repository.js";
import { ObjectRepository } from "../../features/objects/object.repository.js";
import { getCommitChanges, getRecentCommits, getWorktreeChanges, isGitRepo, } from "../../features/create/git.service.js";
import { Change } from "../../features/objects/change/Change.js";
import { Decision } from "../../features/objects/decision/Decision.js";
import { DECISION_STATUSES } from "../../features/objects/decision/DecisionContent.js";
import { Note } from "../../features/objects/note/Note.js";
import { Problem } from "../../features/objects/problem/Problem.js";
import { SEVERITIES } from "../../features/objects/problem/ProblemContent.js";
const repository = new ObjectRepository();
const graph = new GraphRepository();
const OBJECT_TYPES = ["note", "problem", "decision"];
function shortId(id) {
    return id.substring(0, 8);
}
function sortFiles(files) {
    return [...files].sort((a, b) => a.path.localeCompare(b.path));
}
function contentTitle(object) {
    const content = object.content;
    return content.title ?? "(untitled)";
}
async function buildNote(meta) {
    const title = await requiredText("Title", "Short summary");
    const body = await requiredText("Body", "The note itself");
    return new Note({ title, body }, meta);
}
async function buildProblem(meta) {
    const title = await requiredText("Problem title", "What is wrong?");
    const description = await requiredText("Description", "Describe the problem");
    const context = await optionalText("Context (optional)", "Background, links");
    const severity = await selectWithCustom({
        message: "Severity",
        choices: SEVERITIES,
    });
    return new Problem({
        title,
        description,
        severity,
        ...(context !== undefined ? { context } : {}),
    }, meta);
}
async function buildDecision(meta) {
    const title = await requiredText("Decision title", "What was decided?");
    const problem = await optionalText("Problem this addresses (optional)", "Short description");
    const alternativesRaw = await optionalText("Alternatives considered (comma-separated, optional)", "Option A, Option B");
    const alternatives = alternativesRaw
        ? alternativesRaw
            .split(",")
            .map((value) => value.trim())
            .filter((value) => value.length > 0)
        : [];
    const chosen = await requiredText("Chosen option", "What you picked");
    const rationale = await requiredText("Rationale", "Why this choice");
    const expectedOutcome = await optionalText("Expected outcome (optional)", "What you expect to happen");
    const status = await selectWithCustom({
        message: "Status",
        choices: DECISION_STATUSES,
    });
    return new Decision({
        title,
        alternatives,
        chosen,
        rationale,
        status,
        ...(problem !== undefined ? { problem } : {}),
        ...(expectedOutcome !== undefined ? { expectedOutcome } : {}),
    }, meta);
}
async function maybeLinkProblem(decisionId, meta) {
    const problems = repository.listByType("problem");
    if (problems.length === 0) {
        return;
    }
    const doLink = ensure(await confirm({
        message: "Link this decision to an existing problem?",
        initialValue: true,
    }));
    if (!doLink) {
        return;
    }
    const problemId = ensure(await select({
        message: "Select a problem",
        options: problems.map((entry) => ({
            value: entry.id,
            label: contentTitle(entry.object),
            hint: shortId(entry.id),
        })),
    }));
    graph.link(decisionId, problemId, "solves", meta);
    log.success(`Linked decision --solves--> problem (${shortId(problemId)})`);
}
async function maybeLinkGitChanges(objectId, type, meta) {
    if (!isGitRepo()) {
        return;
    }
    const worktree = getWorktreeChanges();
    const commits = getRecentCommits(10);
    if (worktree.length === 0 && commits.length === 0) {
        return;
    }
    const doLink = ensure(await confirm({
        message: `Link code changes to this ${type}?`,
        initialValue: true,
    }));
    if (!doLink) {
        return;
    }
    const sourceOptions = [];
    if (worktree.length > 0) {
        sourceOptions.push({
            value: "worktree",
            label: `Uncommitted changes (${worktree.length} file(s))`,
        });
    }
    if (commits.length > 0) {
        sourceOptions.push({ value: "commit", label: "A specific commit" });
    }
    const source = ensure(await select({ message: "Which changes?", options: sourceOptions }));
    let change;
    if (source === "worktree") {
        const selected = ensure(await multiselect({
            message: "Select files to link",
            options: worktree.map((file) => ({
                value: file.path,
                label: `${file.status || "?"} ${file.path}`,
            })),
            initialValues: worktree.map((file) => file.path),
            required: true,
        }));
        const files = sortFiles(worktree.filter((file) => selected.includes(file.path)));
        change = new Change({ kind: "worktree", files }, meta);
    }
    else {
        const sha = ensure(await select({
            message: "Select a commit",
            options: commits.map((commit) => ({
                value: commit.sha,
                label: `${commit.shortSha} ${commit.message}`,
            })),
        }));
        const commit = commits.find((entry) => entry.sha === sha);
        const files = sortFiles(getCommitChanges(sha));
        change = new Change({
            kind: "commit",
            commit: commit.sha,
            message: commit.message,
            files,
        }, meta);
    }
    const { id: changeId } = repository.save(change);
    graph.link(objectId, changeId, "implemented_by", meta);
    log.success(`Linked ${type} --implemented_by--> change (${shortId(changeId)})`);
}
export async function createCommand(typeArg, options = {}) {
    intro("ecs create");
    const author = resolveAuthor({
        ...(options.author !== undefined ? { name: options.author } : {}),
        ...(options.authorEmail !== undefined ? { mail: options.authorEmail } : {}),
    });
    const meta = author ? { author } : {};
    let type;
    if (typeArg && OBJECT_TYPES.includes(typeArg)) {
        type = typeArg;
    }
    else {
        if (typeArg) {
            log.warn(`Unknown type '${typeArg}'. Choose one below.`);
        }
        type = ensure(await select({
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
        }));
    }
    let object;
    if (type === "note") {
        object = await buildNote(meta);
    }
    else if (type === "problem") {
        object = await buildProblem(meta);
    }
    else {
        object = await buildDecision(meta);
    }
    const { id, created } = repository.save(object);
    if (created) {
        log.success(`Created ${type} ${id}`);
    }
    else {
        log.info(`No evolution: this ${type} already exists at ${id}`);
    }
    if (type === "decision") {
        await maybeLinkProblem(id, meta);
    }
    await maybeLinkGitChanges(id, type, meta);
    outro(`Done — ${type} ${shortId(id)}`);
}
//# sourceMappingURL=create.command.js.map