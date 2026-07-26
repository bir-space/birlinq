/**
 * API types — hand-written from docs/api/openapi.yaml of birlinq-backend.
 * Keep in sync with the backend contract.
 */

// ---------- Shared ----------

export interface ApiError {
  code: string;
  message: string;
  request_id: string;
  details?: Record<string, unknown>;
}

export interface CursorMeta {
  next_cursor: string | null;
  has_more: boolean;
}

export interface CursorPaginated<T> {
  data: T[];
  meta: CursorMeta;
}

/** Backend locale codes. NB: backend uses "kz", web routing uses ISO "kk". */
export type ApiLocale = "ru" | "kz" | "en";

// ---------- Auth ----------

export interface User {
  id: string;
  email: string | null;
  phone?: string | null;
  name: string;
  locale: string;
  email_verified_at: string | null;
  created_at: string;
}

export interface AuthTokenPair {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  user?: User;
}

export interface RegisterRequest {
  name: string;
  email?: string;
  phone?: string; // ^77\d{9}$
  password: string;
  locale?: ApiLocale;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
  device_name?: string;
}

// ---------- Entities ----------

export type EntityType = "vehicle";
export type EntityStatus = "active" | "paused" | "deleted";

export interface VehicleProfile {
  make: string;
  model: string;
  color: string;
  plate_number: string | null;
  photo_url?: string | null;
}

export interface Entity {
  id: string;
  type: EntityType;
  title: string;
  status: EntityStatus;
  vehicle: VehicleProfile;
  created_at: string;
  updated_at: string;
}

export interface CreateEntityRequest {
  type: EntityType;
  title?: string;
  vehicle: {
    make: string;
    model: string;
    color: string;
    plate_number?: string;
  };
}

export interface UpdateEntityRequest {
  title?: string;
  vehicle?: Partial<CreateEntityRequest["vehicle"]>;
}

export type NotificationChannel = "email" | "whatsapp" | "telegram";

export interface PrivacySettings {
  show_owner_name: boolean;
  show_phone: boolean;
  show_whatsapp: boolean;
  show_telegram: boolean;
  show_plate_number: boolean;
  show_vehicle_details: boolean;
  channel_preferences?: {
    primary: NotificationChannel;
    fallback: NotificationChannel[];
  };
}

// ---------- QR ----------

export type QrStatus =
  | "created"
  | "printed"
  | "available"
  | "activated"
  | "paused"
  | "blocked"
  | "lost"
  | "deleted";

export interface QrCode {
  id: string;
  code: string;
  status: QrStatus;
  entity_id: string | null;
  activated_at: string | null;
  last_scan_at: string | null;
  scan_count: number;
}

export interface QrLookupRequest {
  code: string;
  activation_token: string;
}

export interface QrActivateRequest extends QrLookupRequest {
  entity_id: string;
}

// ---------- Public scan ----------

export interface PublicScenario {
  id: string;
  code: string; // e.g. "car_blocking"
  title: string;
  description?: string;
  icon?: string;
  prefilled_message?: string;
}

export interface PublicEntityPayload {
  entity: {
    type: string;
    title?: string;
    vehicle?: Partial<VehicleProfile>;
  };
  scenarios: PublicScenario[];
  meta: {
    locale?: string;
    privacy_badge?: boolean;
  };
}

export interface ScenarioSubmitRequest {
  message: string;
  visitor_locale?: string;
}

export interface SubmissionAction {
  type: string; // e.g. "show_message"
  payload: Record<string, unknown>;
}

export interface SubmissionResult {
  status: "accepted";
  interaction_id: string;
  actions: SubmissionAction[];
}

export interface LeadRequest {
  name: string;
  contact: string;
  city?: string;
}

export type AbuseReason = "spam" | "harassment" | "impersonation" | "other";

export interface AbuseRequest {
  reason?: AbuseReason;
  note?: string;
}

// ---------- Owner ----------

export interface OwnerDashboard {
  total_qrs: number;
  active_qrs: number;
  scans_7d: number;
  scans_30d: number;
  submissions_7d: number;
  unresolved_interactions: number;
}

export type InteractionStatus = "new" | "resolved" | "spam";

export interface Interaction {
  id: string;
  qr_code_id: string;
  scenario_code: string;
  message: string;
  status: InteractionStatus;
  created_at: string;
}
