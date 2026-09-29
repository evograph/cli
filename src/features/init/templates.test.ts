import { describe, expect, it } from "vitest";
import {
  agentProtocolMarkdown,
  agentsMdMarkdown,
  thinAdapterBlurb,
} from "./templates.js";

describe("templates", () => {
  it("interpolates the default cli prefix", () => {
    expect(agentProtocolMarkdown()).toContain("ecs context");
    expect(thinAdapterBlurb()).toContain("`ecs context`");
    expect(thinAdapterBlurb()).toContain("`ecs create`");
    expect(agentsMdMarkdown()).toContain(".evolution/AGENT.md");
  });

  it("interpolates a custom cli prefix", () => {
    const markdown = agentProtocolMarkdown("npm run dev --");
    expect(markdown).toContain("npm run dev -- context");
    expect(markdown).toContain("npm run dev -- close-session");
    expect(markdown).not.toContain("ecs context");
  });
});
