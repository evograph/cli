import path from "node:path";
import { fileURLToPath } from "node:url";

declare const __ECS_BUNDLED_VERSION__: string | undefined;

/** Use the installed binary directly; MCP setup must never download a CLI. */
export function cliInvocation(): { command: string; args: string[] } {
  if ((process as typeof process & { pkg?: unknown }).pkg)
    return { command: process.execPath, args: [] };
  if (typeof __ECS_BUNDLED_VERSION__ !== "undefined" && process.argv[1])
    return { command: process.execPath, args: [path.resolve(process.argv[1])] };
  return {
    command: process.execPath,
    args: [fileURLToPath(new URL("../../bin/ecs.js", import.meta.url))],
  };
}
