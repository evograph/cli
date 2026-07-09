import type { ECSObject } from "../../kernel/ECSObject.js";
import type { SaveObjectResult } from "../../features/objects/object.store.js";
export interface IObjectRepository {
    save(object: ECSObject<unknown>): SaveObjectResult;
    load(id: string): ECSObject<unknown>;
    exists(id: string): boolean;
    list(): string[];
    listByType(type: string): {
        id: string;
        object: ECSObject<unknown>;
    }[];
}
export declare class ObjectRepository implements IObjectRepository {
    save(object: ECSObject<unknown>): SaveObjectResult;
    load(id: string): ECSObject<unknown>;
    exists(id: string): boolean;
    list(): string[];
    listByType(type: string): {
        id: string;
        object: ECSObject<unknown>;
    }[];
}
//# sourceMappingURL=object.repository.d.ts.map