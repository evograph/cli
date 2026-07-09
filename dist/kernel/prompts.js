import { cancel, isCancel, select, text } from "@clack/prompts";
const CUSTOM_VALUE = "__custom__";
// Unwrap a clack prompt result, exiting cleanly if the user cancelled (Ctrl+C).
export function ensure(value) {
    if (isCancel(value)) {
        cancel("Cancelled.");
        process.exit(0);
    }
    return value;
}
export async function requiredText(message, placeholder) {
    const value = ensure(await text({
        message,
        ...(placeholder !== undefined ? { placeholder } : {}),
        validate: (input) => input && input.trim().length > 0 ? undefined : "This field is required",
    }));
    return value.trim();
}
export async function optionalText(message, placeholder) {
    const value = ensure(await text({
        message,
        ...(placeholder !== undefined ? { placeholder } : {}),
    }));
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
// A select that always offers a "Custom…" option opening a free-text input.
export async function selectWithCustom(options) {
    const choice = ensure(await select({
        message: options.message,
        options: [
            ...options.choices.map((value) => ({ value, label: value })),
            { value: CUSTOM_VALUE, label: options.customLabel ?? "Custom…" },
        ],
    }));
    if (choice === CUSTOM_VALUE) {
        return requiredText("Enter a custom value");
    }
    return choice;
}
//# sourceMappingURL=prompts.js.map