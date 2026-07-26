import type { ApiError, AuthTokenPair } from "./types";
import { tokenStore } from "../auth/token-store";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;
  readonly details?: Record<string, unknown>;

  constructor(status: number, body: Partial<ApiError> | null) {
    super(body?.message ?? `Request failed with status ${status}`);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = body?.code ?? "UNKNOWN";
    this.requestId = body?.request_id;
    this.details = body?.details;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Attach Authorization: Bearer header (default true for non-public paths) */
  auth?: boolean;
  /** Send an Idempotency-Key header (UUID v4 is accepted by backend as UUID). */
  idempotencyKey?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export function newIdempotencyKey(): string {
  // Browser + Node 19+; fine for our supported targets.
  return crypto.randomUUID();
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

let refreshPromise: Promise<boolean> | null = null;

/** Try to refresh the token pair once; concurrent callers share the promise. */
async function refreshTokens(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = tokenStore.getRefreshToken();
      if (!refreshToken) return false;
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!res.ok) {
          tokenStore.clear();
          return false;
        }
        const pair = (await parseBody(res)) as AuthTokenPair;
        tokenStore.setPair(pair);
        return true;
      } catch {
        return false;
      } finally {
        // allow next refresh cycle
        setTimeout(() => {
          refreshPromise = null;
        }, 0);
      }
    })();
  }
  return refreshPromise;
}

/**
 * Core request helper. Automatically:
 *  - prefixes API_URL
 *  - serialises JSON
 *  - attaches Bearer token when `auth` is true
 *  - on 401 with auth — refreshes once and retries
 *  - throws ApiRequestError on non-2xx
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, auth = false, idempotencyKey, signal } = options;

  const doFetch = async (): Promise<Response> => {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...options.headers,
    };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
    if (auth) {
      const token = tokenStore.getAccessToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  };

  let res = await doFetch();

  if (res.status === 401 && auth) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      res = await doFetch();
    }
  }

  if (!res.ok) {
    const errBody = (await parseBody(res)) as Partial<ApiError> | null;
    throw new ApiRequestError(res.status, errBody);
  }

  return (await parseBody(res)) as T;
}
