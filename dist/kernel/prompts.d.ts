export declare function ensure<T>(value: T | symbol): T;
export declare function requiredText(message: string, placeholder?: string): Promise<string>;
export declare function optionalText(message: string, placeholder?: string): Promise<string | undefined>;
export declare function selectWithCustom(options: {
    message: string;
    choices: readonly string[];
    customLabel?: string;
}): Promise<string>;
//# sourceMappingURL=prompts.d.ts.map