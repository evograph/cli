import type { ECSObjectMetadata, ECSObjectRecord } from "./ECSObjectRecord.js";

export abstract class ECSObject<T> {
  abstract readonly type: string;
  readonly schemaVersion = 1;
  readonly content: T;
  readonly metadata: ECSObjectMetadata;

  constructor(content: T, metadata: Partial<ECSObjectMetadata> = {}) {
    this.content = content;
    this.metadata = {
      createdAt: metadata.createdAt ?? new Date().toISOString(),
      version: metadata.version ?? 1,
      ...(metadata.author !== undefined ? { author: metadata.author } : {}),
    };
  }

  abstract validate(): void;

  canonicalize(): string {
    return JSON.stringify({
      header: { type: this.type, schemaVersion: this.schemaVersion },
      content: this.content,
    });
  }

  toJSON(): ECSObjectRecord<T> {
    return {
      header: { type: this.type, schemaVersion: this.schemaVersion },
      content: this.content,
      metadata: this.metadata,
    };
  }
}
