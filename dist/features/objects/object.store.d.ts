import type { ECSObjectRecord } from "../../kernel/ECSObjectRecord.js";
export declare function resolveObjectId(input: string): string;
export type SaveObjectResult = {
    id: string;
    created: boolean;
};
export declare function saveObject(record: ECSObjectRecord, id: string): SaveObjectResult;
export declare function loadObject(id: string): ECSObjectRecord;
export declare function objectExists(id: string): boolean;
export declare function listObjects(): string[];
//# sourceMappingURL=object.store.d.ts.map