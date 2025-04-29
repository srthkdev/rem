declare module 'pg' {
  export interface PoolConfig {
    user?: string;
    password?: string;
    host?: string;
    port?: number;
    database?: string;
    connectionString?: string;
    ssl?: boolean | { rejectUnauthorized: boolean };
    max?: number;
    min?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    connect(): Promise<PoolClient>;
    end(): Promise<void>;
    query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>>;
  }

  export interface QueryResult<T> {
    rows: T[];
    rowCount: number;
    command: string;
    oid: number;
    fields: FieldInfo[];
  }

  export interface FieldInfo {
    name: string;
    tableID: number;
    columnID: number;
    dataTypeID: number;
    dataTypeSize: number;
    dataTypeModifier: number;
    format: string;
  }

  export interface PoolClient {
    query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>>;
    release(err?: Error): void;
  }
} 