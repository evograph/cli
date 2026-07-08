import { cancel, isCancel, select, text } from "@clack/prompts";

const CUSTOM_VALUE = "__custom__";

// Unwrap a clack prompt result, exiting cleanly if the user cancelled (Ctrl+C).
export function ensure<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel("Cancelled.");
    process.exit(0);
  }

  return value as T;
}

export async function requiredText(
  message: string,
  placeholder?: string
): Promise<string> {
  const value = ensure(
    await text({
      message,
      ...(placeholder !== undefined ? { placeholder } : {}),
      validate: (input) =>
        input && input.trim().length > 0 ? undefined : "This field is required",
    })
  );

  return value.trim();
}

export async function optionalText(
  message: string,
  placeholder?: string
): Promise<string | undefined> {
  const value = ensure(
    await text({
      message,
      ...(placeholder !== undefined ? { placeholder } : {}),
    })
  );

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

// A select that always offers a "Custom…" option opening a free-text input.
export async function selectWithCustom(options: {
  message: string;
  choices: readonly string[];
  customLabel?: string;
}): Promise<string> {
  const choice = ensure(
    await select({
      message: options.message,
      options: [
        ...options.choices.map((value) => ({ value, label: value })),
        { value: CUSTOM_VALUE, label: options.customLabel ?? "Custom…" },
      ],
    })
  );

  if (choice === CUSTOM_VALUE) {
    return requiredText("Enter a custom value");
  }

  return choice as string;
}
