import type { Author } from "../kernel/ECSObjectRecord.js";
export type AuthorOverrides = {
    name?: string;
    mail?: string;
};
export declare function resolveAuthor(overrides?: AuthorOverrides): Author | undefined;
//# sourceMappingURL=author.d.ts.map