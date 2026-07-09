export class ECSObject {
    schemaVersion = 1;
    content;
    metadata;
    constructor(content, metadata = {}) {
        this.content = content;
        this.metadata = {
            createdAt: metadata.createdAt ?? new Date().toISOString(),
            version: metadata.version ?? 1,
            ...(metadata.author !== undefined ? { author: metadata.author } : {}),
        };
    }
    canonicalize() {
        return JSON.stringify({
            header: { type: this.type, schemaVersion: this.schemaVersion },
            content: this.content,
        });
    }
    toJSON() {
        return {
            header: { type: this.type, schemaVersion: this.schemaVersion },
            content: this.content,
            metadata: this.metadata,
        };
    }
}
//# sourceMappingURL=ECSObject.js.map