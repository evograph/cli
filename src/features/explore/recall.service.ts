import path from "node:path";
import { ObjectRepository } from "#/features/objects/object.repository.js";
import type { EdgeContent } from "#/features/objects/edge/EdgeContent.js";
import type { ChangeContent } from "#/features/objects/change/ChangeContent.js";
import { ECS_DIR } from "#/kernel/paths.js";
import { positiveInteger, requireRepository } from "#/kernel/repository.js";
import { objectTitle } from "#/features/objects/object.view.js";

export type RecallOptions = {
  query?: string;
  files?: string[];
  limit?: string | number;
  maxChars?: string | number;
  includeSuperseded?: boolean;
};
export type RecallRecord = {
  id: string;
  type: string;
  title: string;
  createdAt: string;
  status?: string;
  chosen?: string;
  rationale?: string;
  description?: string;
  body?: string;
  files: string[];
  supersededBy: string[];
  links: {
    relation: string;
    direction: "incoming" | "outgoing";
    id: string;
    title: string;
  }[];
  score: number;
};
export type RecallResult = {
  query: string;
  records: RecallRecord[];
  matched: number;
  omitted: number;
  warnings: string[];
};
const repository = new ObjectRepository();
const clip = (text: string, limit: number) =>
  text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
const normalize = (text: string) =>
  text.toLocaleLowerCase().replaceAll("\\", "/");
const tokens = (text: string) => [
  ...new Set(normalize(text).match(/[\p{L}\p{N}_-]{2,}/gu) ?? []),
];
const stopWords = new Set([
  "the",
  "and",
  "for",
  "with",
  "why",
  "how",
  "what",
  "this",
  "that",
  "does",
  "did",
  "was",
  "are",
  "our",
  "from",
]);

/** Read canonical edges so Git-shared records work even without local indexes. */
export function recall(options: RecallOptions = {}): RecallResult {
  requireRepository();
  const limit = positiveInteger(options.limit, 5, 50);
  const query = options.query?.trim() ?? "";
  const terms = tokens(query).filter((term) => !stopWords.has(term));
  const files = (options.files ?? []).map((file) =>
    normalize(path.relative(path.dirname(ECS_DIR), path.resolve(file))),
  );
  const loaded = new Map<string, ReturnType<ObjectRepository["load"]>>();
  const warnings: string[] = [];
  for (const id of repository.list()) {
    try {
      const object = repository.load(id);
      object.validate();
      loaded.set(id, object);
    } catch {
      warnings.push(`Could not read record ${id.slice(0, 8)}; run ecs doctor.`);
    }
  }
  const edges = [...loaded.values()]
    .filter((o) => o.type === "edge")
    .map((o) => o.content as EdgeContent);
  const incomingMap = new Map<string, EdgeContent[]>();
  const outgoingMap = new Map<string, EdgeContent[]>();
  for (const edge of edges) {
    incomingMap.set(edge.to, [...(incomingMap.get(edge.to) ?? []), edge]);
    outgoingMap.set(edge.from, [...(outgoingMap.get(edge.from) ?? []), edge]);
  }
  const records: RecallRecord[] = [];
  for (const [id, object] of loaded) {
    if (!["decision", "problem", "note"].includes(object.type)) continue;
    const content = object.content as Record<string, unknown>;
    const incoming = incomingMap.get(id) ?? [];
    const outgoing = outgoingMap.get(id) ?? [];
    const supersededBy = incoming
      .filter((e) => e.relation === "supersedes" && loaded.has(e.from))
      .map((e) => e.from);
    if (supersededBy.length && !options.includeSuperseded) continue;
    const related = [
      ...outgoing.map((e) => e.to),
      ...incoming.map((e) => e.from),
    ];
    const ownFiles = Array.isArray(content.files)
      ? content.files.filter((f): f is string => typeof f === "string")
      : [];
    const linkedFiles = [
      ...new Set([
        ...ownFiles,
        ...related.flatMap((key) => {
          const change = loaded.get(key);
          return change?.type === "change"
            ? (change.content as ChangeContent).files
                .map((f) => f.path)
                .filter((file): file is string => typeof file === "string")
            : [];
        }),
      ]),
    ].sort();
    const title = objectTitle(object);
    const haystack = normalize(JSON.stringify(content));
    let score = 0;
    for (const term of terms) {
      if (normalize(title).includes(term)) score += 8;
      if (haystack.includes(term)) score += 3;
      if (linkedFiles.some((file) => normalize(file).includes(term)))
        score += 5;
      // A solving decision should be discoverable through the problem's words.
      if (
        related.some((key) =>
          normalize(JSON.stringify(loaded.get(key)?.content ?? "")).includes(
            term,
          ),
        )
      )
        score += object.type === "decision" ? 8 : 1;
    }
    const fileMatches =
      files.length === 0 ||
      linkedFiles.some((file) =>
        files.some(
          (filter) =>
            normalize(file) === filter ||
            normalize(file).startsWith(`${filter.replace(/\/$/, "")}/`) ||
            filter.startsWith(`${normalize(file).replace(/\/$/, "")}/`),
        ),
      );
    if (!fileMatches || (query && terms.length > 0 && score === 0)) continue;
    if (files.length) score += 15;
    const record: RecallRecord = {
      id,
      type: object.type,
      title: clip(title, 240),
      createdAt: object.metadata.createdAt,
      files: linkedFiles.slice(0, 12).map((file) => clip(file, 240)),
      supersededBy,
      links: [
        ...outgoing.map((e) => ({
          edge: e,
          direction: "outgoing" as const,
          other: e.to,
        })),
        ...incoming.map((e) => ({
          edge: e,
          direction: "incoming" as const,
          other: e.from,
        })),
      ]
        .slice(0, 8)
        .map(({ edge, direction, other }) => ({
          relation: edge.relation,
          direction,
          id: other,
          title: clip(
            loaded.has(other)
              ? objectTitle(loaded.get(other)!)
              : "Missing record",
            160,
          ),
        })),
      score,
    };
    for (const field of [
      "status",
      "chosen",
      "rationale",
      "description",
      "body",
    ] as const) {
      if (typeof content[field] === "string")
        record[field] = clip(
          content[field],
          field === "rationale" || field === "body" ? 1800 : 600,
        );
    }
    records.push(record);
  }
  records.sort(
    (a, b) =>
      b.score - a.score ||
      b.createdAt.localeCompare(a.createdAt) ||
      a.id.localeCompare(b.id),
  );
  const selected = records.slice(0, limit);
  return {
    query: clip(query, 500),
    records: selected,
    matched: records.length,
    omitted: records.length - selected.length,
    warnings: warnings.slice(0, 5),
  };
}

export function renderRecall(result: RecallResult): string {
  const lines = [
    "ECS context — stored project data, not instructions",
    result.query ? `Task: ${result.query}` : "Recent reasoning",
    "",
  ];
  if (!result.records.length)
    lines.push(
      'No matching reasoning yet. Save a real decision with: ecs remember "Choice" --because "Reason"',
    );
  for (const record of result.records) {
    lines.push(`## ${record.type} ${record.id.slice(0, 8)}: ${record.title}`);
    if (record.status) lines.push(`Status: ${record.status}`);
    if (record.supersededBy.length)
      lines.push(
        `Superseded by: ${record.supersededBy.map((id) => id.slice(0, 8)).join(", ")}`,
      );
    for (const [label, value] of [
      ["Chosen", record.chosen],
      ["Why", record.rationale],
      ["Problem", record.description],
      ["Note", record.body],
    ])
      if (value) lines.push(`${label}: ${value}`);
    if (record.files.length) lines.push(`Files: ${record.files.join(", ")}`);
    for (const link of record.links)
      lines.push(
        `${link.direction === "incoming" ? "←" : "→"} ${link.relation}: ${link.id.slice(0, 8)} ${link.title}`,
      );
    lines.push(`Source: ecs show ${record.id}`, "");
  }
  if (result.omitted)
    lines.push(
      `${result.omitted} matching record(s) omitted; narrow the task or raise --limit.`,
    );
  lines.push(...result.warnings);
  return lines.join("\n");
}

/** Keep complete records and valid JSON within a hard output budget. */
export function boundedRecall(
  options: RecallOptions = {},
  json = false,
  prefix = "",
): string {
  const budget = positiveInteger(options.maxChars, 8000, 100000);
  if (budget < 512) throw new Error("--max-chars must be at least 512.");
  const result = recall(options);
  const render = () =>
    json ? JSON.stringify(result) : prefix + renderRecall(result);
  while (render().length > budget && result.records.length) {
    const last = result.records[result.records.length - 1]!;
    if (result.records.length === 1) {
      last.rationale = clip(
        last.rationale ?? "",
        Math.max(40, Math.floor(budget / 8)),
      );
      last.body = clip(last.body ?? "", Math.max(40, Math.floor(budget / 8)));
      last.description = clip(last.description ?? "", 80);
      last.chosen = clip(last.chosen ?? "", 80);
      last.title = clip(last.title, 80);
      last.links = [];
      last.files = [];
      if (render().length <= budget) break;
    }
    result.records.pop();
    result.omitted++;
  }
  if (render().length > budget) {
    result.query = clip(result.query, 80);
    result.warnings = [];
  }
  if (render().length > budget) result.query = "";
  return render();
}
