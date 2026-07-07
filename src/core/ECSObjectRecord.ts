export type ECSObjectMetadata = {
  createdAt: string;
  author?: string;
  version: number;
};

export interface ECSObjectRecord<T = unknown> {
  header: { type: string; schemaVersion: number };
  content: T;
  metadata: ECSObjectMetadata;
}
