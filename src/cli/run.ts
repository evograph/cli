import fs from "node:fs";
import path from "node:path";

// Resolve cwd before importing storage modules, which bind paths on startup.
try {
  const args = process.argv.slice(2);
  if (
    args[0] === "--cwd" ||
    args[0] === "-C" ||
    args[0]?.startsWith("--cwd=")
  ) {
    const inline = args[0].startsWith("--cwd=");
    const directory = inline ? args[0].slice(6) : args[1];
    if (!directory || !fs.statSync(path.resolve(directory)).isDirectory()) {
      throw new Error("--cwd needs an existing project directory.");
    }
    process.chdir(directory);
    process.argv.splice(2, inline ? 1 : 2);
  }
  import("./index.js").catch((error: unknown) => {
    console.error(
      `ECS: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exitCode = 1;
  });
} catch (error) {
  console.error(
    `ECS: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
}
