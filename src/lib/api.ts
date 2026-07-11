/**
 * birlinq API client
 * Source of truth: openapi.yaml  (api.birlinq.com/api/v1)
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

// ── Idempotency key (UUID v4) ─────────────────────────────────
export function newIdempotencyKey(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ── Error ─────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Token store (access in memory, refresh in localStorage) ───
let _accessToken: string | null = null;

export const tokenStore = {
  getAccess: () => _accessToken,
  setAccess: (t: string | null) => { _accessToken = t; },
  getRefresh: (): string | null => {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem("bq_refresh");
  },
  setRefresh: (t: string | null) => {
    if (typeof localStorage === "undefined") return;
    if (t) localStorage.setItem("bq_refresh", t);
    else localStorage.removeItem("bq_refresh");
  },
  clear: () => {
    _accessToken = null;
    if (typeof localStorage !== "undefined")
      localStorage.removeItem("bq_refresh");
  },
};

// ── Core fetch ────────────────────────────────────────────────
type RequestOptions = RequestInit & {
  skipAuth?: boolean;
  idempotencyKey?: string;
};

let _onUnauthenticated: (() => void) | null = null;
export function setUnauthenticatedHandler(fn: () => void) {
  _onUnauthenticated = fn;
}

async function request<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { skipAuth, idempotencyKey, ...init } = opts;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined ?? {}),
  };

  if (!skipAuth && _accessToken) {
    headers["Authorization"] = `Bearer ${_accessToken}`;
  }

  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (res.status === 401 && !skipAuth) {
    // Try silent refresh
    const refreshed = await silentRefresh();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${_accessToken}`;
      const retry = await fetch(`${API_BASE_URL.replace(/\/$/, "")}${path}`, {
        ...init,
        headers,
        cache: "no-store",
      });
      if (retry.ok) {
        if (retry.status === 204) return {} as T;
        return retry.json() as Promise<T>;
      }
    }
    _onUnauthenticated?.();
    throw new ApiError("Необходима авторизация", 401, "UNAUTHORIZED");
  }

  if (!res.ok) {
    let code: string | undefined;
    let requestId: string | undefined;
    let message = "Ошибка запроса";
    try {
      const data = await res.json() as { code?: string; message?: string; request_id?: string };
      code = data.code;
      requestId = data.request_id;
      message = data.message ?? message;
    } catch { /* ignore */ }
    throw new ApiError(message, res.status, code, requestId);
  }

  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

async function silentRefresh(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;
  try {
    const data = await request<AuthTokenPair>("/auth/refresh", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    tokenStore.setAccess(data.access_token);
    tokenStore.setRefresh(data.refresh_token);
    return true;
  } catch {
    tokenStore.clear();
    return false;
  }
}

// ── Types from OpenAPI ────────────────────────────────────────

export type AuthTokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user?: User;
};

export type User = {
  id: string;
  email?: string;
  name: string;
  locale?: string;
  email_verified_at: string | null;
  created_at: string;
};

export type VehicleProfile = {
  make: string;
  model: string;
  color: string;
  plate_number?: string | null;
  photo_url?: string | null;
};

export type Entity = {
  id: string;
  type: "vehicle";
  title: string;
  status: "active" | "paused" | "deleted";
  vehicle?: VehicleProfile;
  created_at: string;
  updated_at: string;
};

export type PrivacySettings = {
  show_owner_name: boolean;
  show_phone: boolean;
  show_whatsapp: boolean;
  show_telegram: boolean;
  show_plate_number: boolean;
  show_vehicle_details: boolean;
  channel_preferences?: {
    primary: "email" | "whatsapp" | "telegram";
    fallback: Array<"email" | "whatsapp" | "telegram">;
  };
};

export type QrCode = {
  id: string;
  code: string;
  status: "created" | "printed" | "available" | "activated" | "paused" | "blocked" | "lost" | "deleted";
  entity_id: string | null;
  activated_at: string | null;
  last_scan_at: string | null;
  scan_count: number;
};

export type Scenario = {
  id: string;
  code: string;
  title: string;
  description?: string;
  icon?: string;
  prefilled_message?: string;
};

export type PublicEntityPayload = {
  entity: {
    type: string;
    title?: string;
    vehicle?: Partial<VehicleProfile>;
  };
  scenarios: Scenario[];
  meta: {
    locale: string;
    privacy_badge: boolean;
  };
};

export type SubmissionResult = {
  status: "accepted";
  interaction_id: string;
  actions: Array<{ type: string; payload: Record<string, unknown> }>;
};

export type Interaction = {
  id: string;
  qr_code_id: string;
  scenario_code: string;
  message: string;
  status: "new" | "resolved" | "spam";
  created_at: string;
};

export type OwnerDashboardData = {
  total_qrs: number;
  active_qrs: number;
  scans_7d: number;
  scans_30d: number;
  submissions_7d: number;
  unresolved_interactions: number;
};

export type CursorPage<T> = {
  data: T[];
  meta: { next_cursor: string | null; has_more: boolean };
};

// ── Auth API ─────────────────────────────────────────────────

export const authApi = {
  register: (body: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
    locale?: string;
  }) =>
    request<AuthTokenPair>("/auth/register", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify(body),
    }),

  login: (body: {
    email?: string;
    phone?: string;
    password: string;
    device_name?: string;
  }) =>
    request<AuthTokenPair>("/auth/login", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify(body),
    }),

  refresh: (refreshToken: string) =>
    request<AuthTokenPair>("/auth/refresh", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  logout: () =>
    request<void>("/auth/logout", { method: "POST" }),

  logoutAll: () =>
    request<void>("/auth/logout-all", { method: "POST" }),

  me: () => request<User>("/auth/me"),

  verifyEmail: (token: string) =>
    request<void>("/auth/verify-email", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ token }),
    }),

  forgotPassword: (email: string) =>
    request<void>("/auth/password/forgot", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    request<void>("/auth/password/reset", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ token, password }),
    }),
};

// ── Entities API ─────────────────────────────────────────────

export const entitiesApi = {
  list: (params?: { cursor?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.cursor) q.set("cursor", params.cursor);
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString() ? `?${q}` : "";
    return request<CursorPage<Entity>>(`/entities${qs}`);
  },

  create: (body: {
    type: "vehicle";
    title?: string;
    vehicle: { make: string; model: string; color: string; plate_number?: string };
  }) =>
    request<Entity>("/entities", {
      method: "POST",
      idempotencyKey: newIdempotencyKey(),
      body: JSON.stringify(body),
    }),

  get: (id: string) => request<Entity>(`/entities/${id}`),

  update: (id: string, body: { title?: string; vehicle?: Partial<VehicleProfile> }) =>
    request<Entity>(`/entities/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (id: string) => request<void>(`/entities/${id}`, { method: "DELETE" }),

  getPrivacy: (id: string) => request<PrivacySettings>(`/entities/${id}/privacy`),

  updatePrivacy: (id: string, settings: Partial<PrivacySettings>) =>
    request<PrivacySettings>(`/entities/${id}/privacy`, {
      method: "PUT",
      body: JSON.stringify(settings),
    }),
};

// ── QR API ───────────────────────────────────────────────────

export const qrApi = {
  lookup: (code: string, activationToken: string) =>
    request<{ qr_code: QrCode }>("/qr/lookup", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ code, activation_token: activationToken }),
    }),

  activate: (body: {
    code: string;
    activation_token: string;
    entity_id: string;
  }) =>
    request<{ qr_code: QrCode }>("/qr/activate", {
      method: "POST",
      idempotencyKey: newIdempotencyKey(),
      body: JSON.stringify(body),
    }),

  list: (params?: { cursor?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.cursor) q.set("cursor", params.cursor);
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString() ? `?${q}` : "";
    return request<CursorPage<QrCode>>(`/qr${qs}`);
  },

  get: (id: string) => request<{ qr_code: QrCode }>(`/qr/${id}`),

  pause: (id: string) =>
    request<{ qr_code: QrCode }>(`/qr/${id}/pause`, {
      method: "POST",
      idempotencyKey: newIdempotencyKey(),
    }),

  resume: (id: string) =>
    request<{ qr_code: QrCode }>(`/qr/${id}/resume`, {
      method: "POST",
      idempotencyKey: newIdempotencyKey(),
    }),
};

// ── Public API (no auth) ─────────────────────────────────────

export const publicApi = {
  getQr: (code: string) =>
    request<PublicEntityPayload>(`/public/q/${code}`, { skipAuth: true }),

  submitScenario: (
    code: string,
    scenarioId: string,
    body: { message: string; visitor_locale?: string },
  ) =>
    request<SubmissionResult>(`/public/q/${code}/scenarios/${scenarioId}`, {
      method: "POST",
      skipAuth: true,
      idempotencyKey: newIdempotencyKey(),
      body: JSON.stringify(body),
    }),

  submitLead: (
    code: string,
    body: { name: string; contact: string; city?: string },
  ) =>
    request<void>(`/public/q/${code}/lead`, {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify(body),
    }),

  reportAbuse: (
    code: string,
    body: { reason?: "spam" | "harassment" | "impersonation" | "other"; note?: string },
  ) =>
    request<void>(`/public/q/${code}/abuse`, {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify(body),
    }),
};

// ── Owner API ────────────────────────────────────────────────

export const ownerApi = {
  dashboard: () => request<OwnerDashboardData>("/owner/dashboard"),

  interactions: (params?: {
    cursor?: string;
    limit?: number;
    qr_code_id?: string;
    since?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.cursor) q.set("cursor", params.cursor);
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.qr_code_id) q.set("qr_code_id", params.qr_code_id);
    if (params?.since) q.set("since", params.since);
    const qs = q.toString() ? `?${q}` : "";
    return request<CursorPage<Interaction>>(`/owner/interactions${qs}`);
  },

  resolveInteraction: (id: string) =>
    request<void>(`/owner/interactions/${id}/resolve`, { method: "POST" }),
};

// Legacy alias kept for gradual migration
export const api = {
  getPublicQr: (code: string) => publicApi.getQr(code),
  sendPublicInteraction: (
    code: string,
    scenarioId: string,
    body: { message: string },
  ) => publicApi.submitScenario(code, scenarioId, body),
  getOwnerDashboard: () => ownerApi.dashboard(),
};

