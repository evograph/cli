import { intro, outro, select } from "@clack/prompts";

import { ensure } from "#/kernel/prompts.js";
import { GraphRepository } from "#/features/graph/graph.repository.js";
import { ObjectRepository } from "#/features/objects/object.repository.js";
import {
  objectLabel,
  objectTitle,
  renderHumanSummary,
  shortId,
} from "#/features/objects/object.view.js";

const repository = new ObjectRepository();
const graph = new GraphRepository();

const BACK_TO_LIST = "__back__";
const EXIT = "__exit__";

function getBrowseCandidates(): { id: string; label: string }[] {
  const decisions = repository.listByType("decision");
  const problems = repository.listByType("problem");

  const nodes = [...decisions, ...problems];

  return nodes.map(({ id, object }) => ({
    id,
    label: objectLabel(id, object),
  }));
}

function printRelationships(id: string): Array<{ id: string; label: string }> {
  const { incoming, outgoing } = graph.neighbors(id);
  const links: Array<{ id: string; label: string }> = [];

  console.log("");
  if (incoming.length === 0 && outgoing.length === 0) {
    console.log("No linked objects yet.");
    return links;
  }

  if (incoming.length > 0) {
    console.log("Incoming:");
    for (const item of incoming) {
      const node = repository.load(item.nodeId);
      const label = `${item.relation} ← ${node.type}: ${objectTitle(node)} (${shortId(item.nodeId)})`;
      console.log(`  • ${label}`);
      links.push({ id: item.nodeId, label });
    }
  }

  if (outgoing.length > 0) {
    console.log("Outgoing:");
    for (const item of outgoing) {
      const node = repository.load(item.nodeId);
      const label = `${item.relation} → ${node.type}: ${objectTitle(node)} (${shortId(item.nodeId)})`;
      console.log(`  • ${label}`);
      links.push({ id: item.nodeId, label });
    }
  }

  return links;
}

export async function browseCommand() {
  intro("ecs browse");

  const candidates = getBrowseCandidates();
  if (candidates.length === 0) {
    outro("No decisions/problems found yet. Create them first with `ecs create`.");
    return;
  }

  let currentId: string | undefined;

  while (true) {
    if (!currentId) {
      const selected = ensure(
        await select({
          message: "Choose a decision or problem",
          options: [
            ...candidates.map((entry) => ({
              value: entry.id,
              label: entry.label,
            })),
            { value: EXIT, label: "Exit" },
          ],
        })
      ) as string;

      if (selected === EXIT) {
        outro("Done browsing.");
        return;
      }

      currentId = selected;
    }

    const object = repository.load(currentId);
    console.log("\n" + renderHumanSummary(currentId, object));
    const links = printRelationships(currentId);

    const selectedLink = ensure(
      await select({
        message: "What next?",
        options: [
          ...links.map((entry) => ({
            value: entry.id,
            label: `Open linked: ${entry.label}`,
          })),
          { value: BACK_TO_LIST, label: "Back to object list" },
          { value: EXIT, label: "Exit" },
        ],
      })
    ) as string;

    if (selectedLink === EXIT) {
      outro("Done browsing.");
      return;
    }

    if (selectedLink === BACK_TO_LIST) {
      currentId = undefined;
      continue;
    }

    currentId = selectedLink;
  }
}
