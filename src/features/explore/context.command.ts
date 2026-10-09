import { getCliVersion } from "#/kernel/package-version.js";
import { boundedRecall, type RecallOptions } from "./recall.service.js";
import { positiveInteger } from "#/kernel/repository.js";

export type ContextOptions = RecallOptions & {
  json?: boolean;
  file?: string[];
};

export function contextCommand(
  queryOrOptions: string | ContextOptions = {},
  options: ContextOptions = {},
): void {
  const settings =
    typeof queryOrOptions === "string"
      ? { ...options, query: queryOrOptions }
      : queryOrOptions;
  const args = {
    ...settings,
    ...(settings.file ? { files: settings.file } : {}),
  };
  const budget = positiveInteger(settings.maxChars, 8000, 100000);
  const output = boundedRecall(
    args,
    settings.json ?? false,
    `CLI version: ${getCliVersion()}\n`,
  );
  process.stdout.write(output + (output.length < budget ? "\n" : ""));
}
