import { describe, expect, it } from "vitest";
import {
  agentProtocolMarkdown,
  agentsMdMarkdown,
  thinAdapterBlurb,
} from "./templates.js";

describe("templates", () => {
  it("interpolates the default cli prefix", () => {
    expect(agentProtocolMarkdown()).toContain("npm run dev -- context");
    expect(thinAdapterBlurb()).toContain("`npm run dev -- context`");
    expect(agentsMdMarkdown()).toContain(".evolution/AGENT.md");
  });

  it("interpolates a custom cli prefix", () => {
    const markdown = agentProtocolMarkdown("ecs");
    expect(markdown).toContain("ecs context");
    expect(markdown).toContain("ecs close-session");
    expect(markdown).not.toContain("npm run dev -- context");
  });
});
