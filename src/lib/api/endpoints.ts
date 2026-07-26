import { apiFetch, newIdempotencyKey } from "./client";
import type {
  AbuseRequest,
  AuthTokenPair,
  CreateEntityRequest,
  CursorPaginated,
  Entity,
  Interaction,
  LeadRequest,
  LoginRequest,
  OwnerDashboard,
  PrivacySettings,
  PublicEntityPayload,
  QrActivateRequest,
  QrCode,
  QrLookupRequest,
  RegisterRequest,
  ScenarioSubmitRequest,
  SubmissionResult,
  UpdateEntityRequest,
  User,
} from "./types";
import { tokenStore } from "../auth/token-store";

// ---------- Auth ----------

export const authApi = {
  async register(body: RegisterRequest): Promise<AuthTokenPair> {
    const pair = await apiFetch<AuthTokenPair>("/auth/register", {
      method: "POST",
      body,
    });
    tokenStore.setPair(pair);
    return pair;
  },

  async login(body: LoginRequest): Promise<AuthTokenPair> {
    const pair = await apiFetch<AuthTokenPair>("/auth/login", {
      method: "POST",
      body,
    });
    tokenStore.setPair(pair);
    return pair;
  },

  async logout(): Promise<void> {
    const refresh_token = tokenStore.getRefreshToken();
    try {
      if (refresh_token) {
        await apiFetch<void>("/auth/logout", {
          method: "POST",
          body: { refresh_token },
          auth: true,
        });
      }
    } finally {
      tokenStore.clear();
    }
  },

  me(): Promise<{ user: User }> {
    return apiFetch<{ user: User }>("/auth/me", { auth: true });
  },

  verifyEmail(token: string): Promise<void> {
    return apiFetch<void>("/auth/verify-email", {
      method: "POST",
      body: { token },
    });
  },

  forgotPassword(email: string): Promise<void> {
    return apiFetch<void>("/auth/password/forgot", {
      method: "POST",
      body: { email },
    });
  },

  resetPassword(token: string, password: string): Promise<void> {
    return apiFetch<void>("/auth/password/reset", {
      method: "POST",
      body: { token, password },
    });
  },
};

// ---------- Entities ----------

export const entitiesApi = {
  list(): Promise<CursorPaginated<Entity>> {
    return apiFetch<CursorPaginated<Entity>>("/entities", { auth: true });
  },

  create(body: CreateEntityRequest): Promise<{ entity: Entity }> {
    return apiFetch<{ entity: Entity }>("/entities", {
      method: "POST",
      body,
      auth: true,
    });
  },

  get(id: string): Promise<{ entity: Entity }> {
    return apiFetch<{ entity: Entity }>(`/entities/${id}`, { auth: true });
  },

  update(id: string, body: UpdateEntityRequest): Promise<{ entity: Entity }> {
    return apiFetch<{ entity: Entity }>(`/entities/${id}`, {
      method: "PATCH",
      body,
      auth: true,
    });
  },

  remove(id: string): Promise<void> {
    return apiFetch<void>(`/entities/${id}`, { method: "DELETE", auth: true });
  },

  getPrivacy(id: string): Promise<{ privacy: PrivacySettings }> {
    return apiFetch<{ privacy: PrivacySettings }>(`/entities/${id}/privacy`, {
      auth: true,
    });
  },

  updatePrivacy(
    id: string,
    body: Partial<PrivacySettings>
  ): Promise<{ privacy: PrivacySettings }> {
    return apiFetch<{ privacy: PrivacySettings }>(`/entities/${id}/privacy`, {
      method: "PATCH",
      body,
      auth: true,
    });
  },
};

// ---------- QR ----------

export const qrApi = {
  lookup(body: QrLookupRequest): Promise<{ qr_code: QrCode }> {
    return apiFetch<{ qr_code: QrCode }>("/qr/lookup", {
      method: "POST",
      body,
    });
  },

  activate(body: QrActivateRequest): Promise<{ qr_code: QrCode }> {
    return apiFetch<{ qr_code: QrCode }>("/qr/activate", {
      method: "POST",
      body,
      auth: true,
      idempotencyKey: newIdempotencyKey(),
    });
  },

  list(params?: { cursor?: string; limit?: number }): Promise<
    CursorPaginated<QrCode>
  > {
    const q = new URLSearchParams();
    if (params?.cursor) q.set("cursor", params.cursor);
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return apiFetch<CursorPaginated<QrCode>>(`/qr${qs ? `?${qs}` : ""}`, {
      auth: true,
    });
  },

  get(id: string): Promise<{ qr_code: QrCode }> {
    return apiFetch<{ qr_code: QrCode }>(`/qr/${id}`, { auth: true });
  },

  pause(id: string): Promise<{ qr_code: QrCode }> {
    return apiFetch<{ qr_code: QrCode }>(`/qr/${id}/pause`, {
      method: "POST",
      auth: true,
      idempotencyKey: newIdempotencyKey(),
    });
  },

  resume(id: string): Promise<{ qr_code: QrCode }> {
    return apiFetch<{ qr_code: QrCode }>(`/qr/${id}/resume`, {
      method: "POST",
      auth: true,
      idempotencyKey: newIdempotencyKey(),
    });
  },
};

// ---------- Public ----------

export const publicApi = {
  scan(code: string): Promise<PublicEntityPayload> {
    return apiFetch<PublicEntityPayload>(
      `/public/q/${encodeURIComponent(code)}`
    );
  },

  submitScenario(
    code: string,
    scenarioId: string,
    body: ScenarioSubmitRequest
  ): Promise<SubmissionResult> {
    return apiFetch<SubmissionResult>(
      `/public/q/${encodeURIComponent(code)}/scenarios/${scenarioId}`,
      { method: "POST", body, idempotencyKey: newIdempotencyKey() }
    );
  },

  submitLead(code: string, body: LeadRequest): Promise<void> {
    return apiFetch<void>(`/public/q/${encodeURIComponent(code)}/lead`, {
      method: "POST",
      body,
    });
  },

  reportAbuse(code: string, body: AbuseRequest): Promise<void> {
    return apiFetch<void>(`/public/q/${encodeURIComponent(code)}/abuse`, {
      method: "POST",
      body,
    });
  },
};

// ---------- Owner ----------

export const ownerApi = {
  dashboard(): Promise<OwnerDashboard> {
    return apiFetch<OwnerDashboard>("/owner/dashboard", { auth: true });
  },

  interactions(params?: {
    cursor?: string;
    limit?: number;
    qr_code_id?: string;
    since?: string;
  }): Promise<CursorPaginated<Interaction>> {
    const q = new URLSearchParams();
    if (params?.cursor) q.set("cursor", params.cursor);
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.qr_code_id) q.set("qr_code_id", params.qr_code_id);
    if (params?.since) q.set("since", params.since);
    const qs = q.toString();
    return apiFetch<CursorPaginated<Interaction>>(
      `/owner/interactions${qs ? `?${qs}` : ""}`,
      { auth: true }
    );
  },

  resolveInteraction(id: string): Promise<{ interaction: Interaction }> {
    return apiFetch<{ interaction: Interaction }>(
      `/owner/interactions/${id}/resolve`,
      { method: "POST", auth: true, idempotencyKey: newIdempotencyKey() }
    );
  },
};

/** Map web locale (ISO "kk") to backend locale code ("kz"). */
export function toApiLocale(webLocale: string): "ru" | "kz" | "en" {
  if (webLocale === "kk") return "kz";
  if (webLocale === "en") return "en";
  return "ru";
}
