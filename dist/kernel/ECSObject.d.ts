import type { ECSObjectMetadata, ECSObjectRecord } from "./ECSObjectRecord.js";
export declare abstract class ECSObject<T> {
    abstract readonly type: string;
    readonly schemaVersion = 1;
    readonly content: T;
    readonly metadata: ECSObjectMetadata;
    constructor(content: T, metadata?: Partial<ECSObjectMetadata>);
    abstract validate(): void;
    canonicalize(): string;
    toJSON(): ECSObjectRecord<T>;
}
//# sourceMappingURL=ECSObject.d.ts.map