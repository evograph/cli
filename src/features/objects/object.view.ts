import type { ECSObject } from "#/kernel/ECSObject.js";

export function shortId(id: string): string {
  return id.substring(0, 8);
}

export function objectTitle(object: ECSObject<unknown>): string {
  const content = object.content as { title?: string };
  return content.title ?? `${object.type} object`;
}

export function objectLabel(id: string, object: ECSObject<unknown>): string {
  return `${object.type}: ${objectTitle(object)} (${shortId(id)})`;
}

export function renderHumanSummary(id: string, object: ECSObject<unknown>): string {
  const lines: string[] = [];
  const author = object.metadata.author;

  lines.push(`${object.type.toUpperCase()} ${shortId(id)}`);
  lines.push(`Title: ${objectTitle(object)}`);
  lines.push(`Created: ${object.metadata.createdAt}`);
  if (author?.name) {
    lines.push(
      `Author: ${author.name}${author.mail ? ` <${author.mail}>` : ""}`
    );
  }
  lines.push("");

  if (object.type === "note") {
    const content = object.content as { body?: string };
    lines.push("Summary");
    lines.push(content.body ?? "(empty)");
  } else if (object.type === "problem") {
    const content = object.content as {
      description?: string;
      context?: string;
      severity?: string;
    };
    lines.push(`Severity: ${content.severity ?? "unknown"}`);
    lines.push("Description:");
    lines.push(content.description ?? "(missing)");
    if (content.context) {
      lines.push("");
      lines.push("Context:");
      lines.push(content.context);
    }
  } else if (object.type === "decision") {
    const content = object.content as {
      problem?: string;
      alternatives?: string[];
      chosen?: string;
      rationale?: string;
      expectedOutcome?: string;
      status?: string;
    };
    lines.push(`Status: ${content.status ?? "unknown"}`);
    lines.push(`Chosen: ${content.chosen ?? "(missing)"}`);
    lines.push("");
    lines.push("Rationale:");
    lines.push(content.rationale ?? "(missing)");
    if (content.alternatives && content.alternatives.length > 0) {
      lines.push("");
      lines.push("Alternatives:");
      for (const alternative of content.alternatives) {
        lines.push(`- ${alternative}`);
      }
    }
    if (content.expectedOutcome) {
      lines.push("");
      lines.push("Expected Outcome:");
      lines.push(content.expectedOutcome);
    }
    if (content.problem) {
      lines.push("");
      lines.push(`Problem Context: ${content.problem}`);
    }
  } else if (object.type === "change") {
    const content = object.content as {
      kind?: string;
      commit?: string;
      message?: string;
      files?: Array<{ status?: string; path?: string }>;
    };
    lines.push(`Kind: ${content.kind ?? "unknown"}`);
    if (content.commit) {
      lines.push(`Commit: ${content.commit}`);
    }
    if (content.message) {
      lines.push(`Message: ${content.message}`);
    }
    if (content.files && content.files.length > 0) {
      lines.push("");
      lines.push("Files:");
      for (const file of content.files.slice(0, 15)) {
        lines.push(`- ${file.status ?? "?"} ${file.path ?? "(unknown)"}`);
      }
      if (content.files.length > 15) {
        lines.push(`... and ${content.files.length - 15} more`);
      }
    }
  } else if (object.type === "edge") {
    const content = object.content as {
      relation?: string;
      from?: string;
      to?: string;
    };
    lines.push(`Relation: ${content.relation ?? "unknown"}`);
    lines.push(`From: ${content.from ?? "?"}`);
    lines.push(`To: ${content.to ?? "?"}`);
  } else {
    lines.push("Raw Content:");
    lines.push(JSON.stringify(object.content, null, 2));
  }

  return lines.join("\n");
}
