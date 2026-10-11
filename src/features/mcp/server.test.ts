import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const binary = fileURLToPath(new URL("../../../bin/ecs.js", import.meta.url));
let root = "";
let client: Client | undefined;
let stderr = "";
const decode = (result: { content: unknown[] }) =>
  JSON.parse((result.content[0] as { text: string }).text);
beforeEach(() => {
  root = fs.mkdtempSync(path.join(process.cwd(), ".tmp-ecs-mcp-"));
  fs.mkdirSync(path.join(root, ".git"));
  execFileSync(process.execPath, [binary, "init", "--agents", "none"], {
    cwd: root,
  });
  stderr = "";
});
afterEach(async () => {
  await client?.close();
  client = undefined;
  fs.rmSync(root, { recursive: true, force: true });
});
async function connect(write = false) {
  client = new Client({ name: "ecs-integration-test", version: "1.0.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [binary, "--cwd", root, "mcp", ...(write ? ["--write"] : [])],
    cwd: root,
    stderr: "pipe",
  });
  transport.stderr?.on("data", (data) => {
    stderr += String(data);
  });
  await client.connect(transport);
  return client;
}

describe("real stdio MCP integration", () => {
  it("negotiates, discovers read-only tools, and cannot write by default", async () => {
    const connection = await connect();
    const listing = await connection.listTools();
    expect(listing.tools.map((tool) => tool.name).sort()).toEqual([
      "ecs_get",
      "ecs_recall",
      "ecs_status",
    ]);
    expect(listing.tools.every((tool) => tool.annotations?.readOnlyHint)).toBe(
      true,
    );
    const status = decode(
      await connection.callTool({ name: "ecs_status", arguments: {} }),
    );
    expect(status.root).toBe(root);
    expect(status.ok).toBe(true);
    expect(
      decode(
        await connection.callTool({
          name: "ecs_recall",
          arguments: { query: "authentication" },
        }),
      ).records,
    ).toEqual([]);
    await expect(
      connection.callTool({
        name: "ecs_remember",
        arguments: { choice: "Forbidden", because: "Read-only mode" },
      }),
    ).rejects.toThrow();
    expect(
      decode(await connection.callTool({ name: "ecs_status", arguments: {} }))
        .counts,
    ).toEqual({});
    expect(stderr).toBe("");
  }, 20000);

  it("previews, saves, retrieves, cites, and supersedes through agent tools", async () => {
    const connection = await connect(true);
    const listing = await connection.listTools();
    expect(
      listing.tools.find((tool) => tool.name === "ecs_remember")?.annotations
        ?.readOnlyHint,
    ).toBe(false);
    const args = {
      choice: "Use SQLite",
      because: "Works offline",
      files: ["src/storage.ts"],
      problem: "Network is unreliable",
    };
    const preview = decode(
      await connection.callTool({
        name: "ecs_remember",
        arguments: { ...args, dryRun: true },
      }),
    );
    expect(
      decode(await connection.callTool({ name: "ecs_status", arguments: {} }))
        .counts,
    ).toEqual({});
    const saved = decode(
      await connection.callTool({ name: "ecs_remember", arguments: args }),
    );
    expect(saved.id).toBe(preview.id);
    const retrieved = decode(
      await connection.callTool({
        name: "ecs_recall",
        arguments: { query: "offline", files: ["src/storage.ts"] },
      }),
    );
    expect(retrieved.records[0].id).toBe(saved.id);
    expect(retrieved.records[0].rationale).toBe("Works offline");
    const source = decode(
      await connection.callTool({
        name: "ecs_get",
        arguments: { id: saved.id.slice(0, 8) },
      }),
    );
    expect(source.record.content.chosen).toBe("Use SQLite");
    const replacement = decode(
      await connection.callTool({
        name: "ecs_remember",
        arguments: {
          choice: "Use Postgres",
          because: "Now sharing storage between workers",
          supersedes: saved.id,
        },
      }),
    );
    const recent = decode(
      await connection.callTool({ name: "ecs_recall", arguments: {} }),
    );
    expect(
      recent.records.some((record: { id: string }) => record.id === saved.id),
    ).toBe(false);
    expect(
      recent.records.some(
        (record: { id: string }) => record.id === replacement.id,
      ),
    ).toBe(true);
    const bad = await connection.callTool({
      name: "ecs_remember",
      arguments: { choice: "Nope", because: "Reason", files: ["../outside"] },
    });
    expect(bad.isError).toBe(true);
    expect(stderr).toBe("");
  }, 20000);
});
