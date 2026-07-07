export type Author = {
  name: string;
  mail?: string;
};

export type ECSObjectMetadata = {
  createdAt: string;
  author?: Author;
  version: number;
};

export interface ECSObjectRecord<T = unknown> {
  header: { type: string; schemaVersion: number };
  content: T;
  metadata: ECSObjectMetadata;
}
