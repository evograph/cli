import { deserialize } from "../../features/objects/registry.js";
import { hash } from "../../kernel/hash.js";
import { saveObject, loadObject, objectExists, listObjects, } from "../../features/objects/object.store.js";
export class ObjectRepository {
    save(object) {
        object.validate();
        const id = hash(object.canonicalize());
        return saveObject(object.toJSON(), id);
    }
    load(id) {
        const record = loadObject(id);
        return deserialize(record);
    }
    exists(id) {
        return objectExists(id);
    }
    list() {
        return listObjects();
    }
    listByType(type) {
        const result = [];
        for (const id of this.list()) {
            try {
                const object = this.load(id);
                if (object.type === type) {
                    result.push({ id, object });
                }
            }
            catch {
                // Skip objects that fail to deserialize
            }
        }
        return result;
    }
}
//# sourceMappingURL=object.repository.js.map