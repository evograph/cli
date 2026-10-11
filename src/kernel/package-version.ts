import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

let cachedVersion: string | undefined;
declare const __ECS_BUNDLED_VERSION__: string | undefined;

export function getCliVersion(): string {
  if (typeof __ECS_BUNDLED_VERSION__ !== "undefined")
    return __ECS_BUNDLED_VERSION__;
  if (cachedVersion !== undefined) {
    return cachedVersion;
  }

  const here = dirname(fileURLToPath(import.meta.url));
  const pkgPath = join(here, "..", "..", "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string };
  cachedVersion = pkg.version;
  return cachedVersion;
}
