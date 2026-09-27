export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** JSON-serialisable request payload. */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface RequestOptions {
  method?: HttpMethod;
  body?: JsonValue;
  headers?: Record<string, string>;
  /** Caller-provided abort signal, combined with the client timeout. */
  signal?: AbortSignal;
}
