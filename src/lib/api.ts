import type { MoveScenario } from "@/lib/move-scenarios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function buildUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL environment variable is required but not set. Please add it to your .env file.",
    );
  }

  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = "Ошибка запроса";
    try {
      const data = (await response.json()) as { message?: string };
      detail = data.message ?? detail;
    } catch {
      // ignore non-json responses
    }
    throw new ApiError(detail, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export type PublicQrProfile = {
  qrCode: string;
  status: "active" | "blocked" | "inactive";
  vehicleLabel?: string;
  maskedPlate?: string;
};

export type InteractionPayload = {
  scenario: MoveScenario;
  message: string;
};

export type ActivationPayload = {
  ownerName: string;
  ownerContact: string;
  vehicleLabel: string;
  licensePlate?: string;
  exposeContact: boolean;
  exposePlate: boolean;
};

export type OwnerDashboard = {
  vehicles: Array<{
    id: string;
    label: string;
    qrCode: string;
    qrStatus: "active" | "blocked" | "inactive";
    interactions: number;
  }>;
  analytics: {
    totalInteractions: number;
    uniqueScanners: number;
  };
};

export type AdminOverview = {
  qrBatches: Array<{
    id: string;
    title: string;
    total: number;
    active: number;
    blocked: number;
    qrCodes?: string[];
  }>;
  interactionsToday: number;
  leadsToday: number;
};

export type PartnerOverview = {
  batches: Array<{ id: string; title: string; total: number; activated: number }>;
  activationsToday: number;
};

export const api = {
  getPublicQr: (code: string) => request<PublicQrProfile>(`/move/public/qr/${code}`),
  sendPublicInteraction: (code: string, payload: InteractionPayload) =>
    request<{ id: string; status: "accepted" }>(`/move/public/qr/${code}/interactions`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getActivationStatus: (code: string) =>
    request<{ code: string; status: "new" | "activated" | "blocked" }>(`/move/activation/${code}`),
  activateQr: (code: string, payload: ActivationPayload) =>
    request<{ vehicleId: string }>(`/move/activation/${code}`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getOwnerDashboard: () => request<OwnerDashboard>("/move/owner/dashboard"),
  getAdminOverview: () => request<AdminOverview>("/move/admin/overview"),
  getPartnerOverview: () => request<PartnerOverview>("/move/partner/overview"),
  blockQr: (code: string) => request<void>(`/move/admin/qr/${code}/block`, { method: "POST" }),
  unblockQr: (code: string) => request<void>(`/move/admin/qr/${code}/unblock`, { method: "POST" }),
};
