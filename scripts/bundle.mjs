import { build } from "esbuild";
import { readFileSync } from "node:fs";

const { version } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
await build({
  entryPoints: ["dist/cli/run.js"],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: "build/ecs.cjs",
  banner: {
    js: 'var __ecsImportMetaUrl = require("node:url").pathToFileURL(__filename).href;',
  },
  define: {
    "import.meta.url": "__ecsImportMetaUrl",
    __ECS_BUNDLED_VERSION__: JSON.stringify(version),
  },
});
