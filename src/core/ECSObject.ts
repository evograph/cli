export interface ECSObject<T = unknown> {
    header: {
      type: string;
      schemaVersion: number;
    };
  
    content: T;
  
    metadata: {
      createdAt: string;
      author?: string;
      version: number;
    };
  }