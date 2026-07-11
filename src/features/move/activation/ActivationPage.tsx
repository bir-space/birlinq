"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApiError,
  entitiesApi,
  qrApi,
  type Entity,
  type PrivacySettings,
  type QrCode,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ru } from "@/lib/i18n/ru";

type Props = { code: string; token?: string };

type Step = "lookup" | "auth" | "vehicle" | "privacy" | "done";

// ── Steps indicator ────────────────────────────────────────────
const STEP_LIST: Step[] = ["lookup", "auth", "vehicle", "privacy", "done"];
const STEP_LABELS: Record<Step, string> = {
  lookup: ru.activation.steps.lookup,
  auth: ru.activation.steps.auth,
  vehicle: ru.activation.steps.vehicle,
  privacy: ru.activation.steps.privacy,
  done: ru.activation.steps.done,
};

function StepsIndicator({ current }: { current: Step }) {
  const currentIdx = STEP_LIST.indexOf(current);
  return (
    <div className="steps" aria-label="Прогресс активации" role="list">
      {STEP_LIST.map((step, i) => {
        const isDone = i < currentIdx;
        const isActive = i === currentIdx;
        return (
          <div key={step} className="step-item" role="listitem">
            <div
              className={`step-circle${isDone ? " done" : isActive ? " active" : ""}`}
              aria-current={isActive ? "step" : undefined}
              aria-label={STEP_LABELS[step]}
            >
              {isDone ? "✓" : i + 1}
            </div>
            {i < STEP_LIST.length - 1 && (
              <div className={`step-connector${isDone ? " done" : ""}`} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step: Lookup ───────────────────────────────────────────────
function StepLookup({
  initialCode,
  initialToken,
  onSuccess,
}: {
  initialCode: string;
  initialToken: string;
  onSuccess: (code: string, token: string, qr: QrCode) => void;
}) {
  const [code, setCode] = useState(initialCode);
  const [token, setToken] = useState(initialToken);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { qr_code } = await qrApi.lookup(code.trim().toUpperCase(), token.trim());
      onSuccess(code.trim().toUpperCase(), token.trim(), qr_code);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404 || err.code === "QR_NOT_FOUND")
          setError(ru.activation.lookup.errors.notFound);
        else if (err.status === 409 || err.code === "QR_ALREADY_ACTIVATED")
          setError(ru.activation.lookup.errors.alreadyActivated);
        else if (err.status === 429)
          setError(ru.activation.lookup.errors.rateLimited);
        else setError(ru.activation.lookup.errors.generic);
      } else {
        setError(ru.activation.lookup.errors.generic);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="stack-md">
      <div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.25rem" }}>
          {ru.activation.lookup.title}
        </h2>
        <p style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>
          Код и токен напечатаны на обратной стороне упаковки.
        </p>
      </div>

      <div className="field">
        <label className="label" htmlFor="qr-code">{ru.activation.lookup.codeLabel}</label>
        <input
          id="qr-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={ru.activation.lookup.codePlaceholder}
          required
          minLength={6}
          maxLength={24}
          autoComplete="off"
          style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="qr-token">{ru.activation.lookup.tokenLabel}</label>
        <input
          id="qr-token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={ru.activation.lookup.tokenPlaceholder}
          required
          maxLength={128}
          autoComplete="off"
        />
      </div>

      {error && <p className="state state-error" style={{ fontSize: "0.85rem" }}>{error}</p>}

      <button type="submit" className="btn btn-cta btn-full" disabled={loading}>
        {loading ? "Проверка…" : ru.activation.lookup.submitBtn}
      </button>
    </form>
  );
}

// ── Step: Auth (login or register) ─────────────────────────────
function StepAuth({ onContinue }: { onContinue: () => void }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "register") {
        await register({ name, email, password });
      } else {
        await login({ email, password });
      }
      onContinue();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setError(ru.auth.errors.invalid);
        else if (err.status === 409) setError(ru.auth.errors.conflict);
        else setError(ru.auth.errors.generic);
      } else {
        setError(ru.auth.errors.generic);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack-md">
      <div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          {mode === "register" ? ru.auth.registerTitle : ru.auth.loginTitle}
        </h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            className={mode === "register" ? "btn" : "btn btn-secondary"}
            style={{ padding: "0.4rem 0.85rem", fontSize: "0.82rem" }}
            onClick={() => setMode("register")}
          >
            Новый аккаунт
          </button>
          <button
            type="button"
            className={mode === "login" ? "btn" : "btn btn-secondary"}
            style={{ padding: "0.4rem 0.85rem", fontSize: "0.82rem" }}
            onClick={() => setMode("login")}
          >
            Уже есть аккаунт
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="stack-md">
        {mode === "register" && (
          <div className="field">
            <label className="label" htmlFor="a-name">{ru.auth.nameLabel}</label>
            <input
              id="a-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={1}
              maxLength={100}
              placeholder="Ваше имя"
            />
          </div>
        )}
        <div className="field">
          <label className="label" htmlFor="a-email">{ru.auth.emailLabel}</label>
          <input
            id="a-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="a-password">{ru.auth.passwordLabel}</label>
          <input
            id="a-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
          />
        </div>

        {error && <p className="state state-error" style={{ fontSize: "0.85rem" }}>{error}</p>}

        <button type="submit" className="btn btn-cta btn-full" disabled={loading}>
          {loading
            ? mode === "register" ? "Создание…" : "Вход…"
            : mode === "register" ? ru.auth.registerBtn : ru.auth.loginBtn}
        </button>
      </form>
    </div>
  );
}

// ── Step: Vehicle ──────────────────────────────────────────────
function StepVehicle({
  onSuccess,
}: {
  onSuccess: (entity: Entity) => void;
}) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [plate, setPlate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const entity = await entitiesApi.create({
        type: "vehicle",
        title: `${make} ${model}`.trim(),
        vehicle: {
          make,
          model,
          color,
          plate_number: plate || undefined,
        },
      });
      onSuccess(entity);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422)
        setError("Проверьте правильность введённых данных.");
      else setError("Не удалось создать профиль авто. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="stack-md">
      <div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.25rem" }}>
          {ru.activation.vehicle.title}
        </h2>
        <p style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>
          Эти данные могут отображаться сканирующему по вашим настройкам приватности.
        </p>
      </div>

      <div className="field">
        <label className="label" htmlFor="v-make">{ru.activation.vehicle.makeLabel}</label>
        <input
          id="v-make"
          value={make}
          onChange={(e) => setMake(e.target.value)}
          placeholder="Toyota"
          required
          maxLength={100}
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="v-model">{ru.activation.vehicle.modelLabel}</label>
        <input
          id="v-model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Camry"
          required
          maxLength={100}
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="v-color">{ru.activation.vehicle.colorLabel}</label>
        <input
          id="v-color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          placeholder="Белый"
          required
          maxLength={50}
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="v-plate">
          {ru.activation.vehicle.plateLabel}
        </label>
        <input
          id="v-plate"
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          placeholder="777 ABC 01"
          maxLength={20}
          style={{ textTransform: "uppercase" }}
        />
        <small className="muted text-xs">Скрыт по умолчанию — настроите на следующем шаге</small>
      </div>

      {error && <p className="state state-error" style={{ fontSize: "0.85rem" }}>{error}</p>}

      <button type="submit" className="btn btn-cta btn-full" disabled={loading}>
        {loading ? "Сохранение…" : ru.activation.vehicle.submitBtn}
      </button>
    </form>
  );
}

// ── Step: Privacy ──────────────────────────────────────────────
const PRIVACY_DEFAULTS: PrivacySettings = {
  show_owner_name: false,
  show_phone: false,
  show_whatsapp: false,
  show_telegram: false,
  show_plate_number: false,
  show_vehicle_details: true,
};

function PrivacyToggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="toggle-row">
      <div>
        <div className="toggle-label">{label}</div>
        {hint && <div className="toggle-hint">{hint}</div>}
      </div>
      <input
        type="checkbox"
        className="toggle"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
      />
    </div>
  );
}

function StepPrivacy({
  entity,
  qrCode,
  activationToken,
  onSuccess,
}: {
  entity: Entity;
  qrCode: string;
  activationToken: string;
  onSuccess: () => void;
}) {
  const [settings, setSettings] = useState<PrivacySettings>(PRIVACY_DEFAULTS);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof PrivacySettings>(key: K, val: PrivacySettings[K]) =>
    setSettings((s) => ({ ...s, [key]: val }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // 1. Activate QR
      await qrApi.activate({
        code: qrCode,
        activation_token: activationToken,
        entity_id: entity.id,
      });
      // 2. Save privacy settings
      await entitiesApi.updatePrivacy(entity.id, settings);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "QR_ALREADY_ACTIVATED" || err.code === "ENTITY_ALREADY_HAS_QR") {
          // Idempotent — treat as success
          onSuccess();
          return;
        }
        setError(err.message ?? "Ошибка активации.");
      } else {
        setError("Ошибка активации. Попробуйте снова.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="stack-md">
      <div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.25rem" }}>
          {ru.activation.privacy.title}
        </h2>
        <p style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>
          {ru.activation.privacy.subtitle}
        </p>
      </div>

      <div className="card">
        <PrivacyToggle
          label={ru.activation.privacy.showVehicleDetails}
          hint="Марка, модель и цвет авто"
          checked={settings.show_vehicle_details}
          onChange={(v) => set("show_vehicle_details", v)}
        />
        <PrivacyToggle
          label={ru.activation.privacy.showPlate}
          hint="Госномер виден сканирующему"
          checked={settings.show_plate_number}
          onChange={(v) => set("show_plate_number", v)}
        />
        <PrivacyToggle
          label={ru.activation.privacy.showOwnerName}
          checked={settings.show_owner_name}
          onChange={(v) => set("show_owner_name", v)}
        />
        <PrivacyToggle
          label={ru.activation.privacy.showPhone}
          checked={settings.show_phone}
          onChange={(v) => set("show_phone", v)}
        />
        <PrivacyToggle
          label={ru.activation.privacy.showWhatsapp}
          checked={settings.show_whatsapp}
          onChange={(v) => set("show_whatsapp", v)}
        />
        <PrivacyToggle
          label={ru.activation.privacy.showTelegram}
          checked={settings.show_telegram}
          onChange={(v) => set("show_telegram", v)}
        />
      </div>

      {error && <p className="state state-error" style={{ fontSize: "0.85rem" }}>{error}</p>}

      <button type="submit" className="btn btn-cta btn-full" disabled={loading}>
        {loading ? "Активация…" : ru.activation.privacy.submitBtn}
      </button>
    </form>
  );
}

// ── Step: Done ─────────────────────────────────────────────────
function StepDone({ qrCode }: { qrCode: string }) {
  return (
    <div className="stack-lg" style={{ textAlign: "center", padding: "1rem 0" }}>
      <div style={{ fontSize: "3.5rem" }}>🎉</div>
      <div className="stack-sm">
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800 }}>{ru.activation.success.title}</h2>
        <p style={{ color: "var(--text-2)" }}>{ru.activation.success.subtitle}</p>
      </div>
      <div className="actions" style={{ justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/owner" className="btn btn-cta">
          {ru.activation.success.dashboardBtn}
        </Link>
        <Link href={`/qr/${qrCode}`} className="btn btn-secondary">
          {ru.activation.success.qrPageBtn}
        </Link>
      </div>
    </div>
  );
}

// ── Main Activation Page ───────────────────────────────────────
export function ActivationPage({ code, token = "" }: Props) {
  const auth = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("lookup");
  const [qrCode, setQrCode] = useState(code);
  const [activationToken, setActivationToken] = useState(token);
  const [entity, setEntity] = useState<Entity | null>(null);

  // Skip auth step if already authenticated
  useEffect(() => {
    if (step === "auth" && auth.status === "authenticated") {
      setStep("vehicle");
    }
  }, [step, auth.status]);

  return (
    <main className="container mobile-first" style={{ paddingTop: "2.5rem" }}>
      <div className="stack-xl">
        <StepsIndicator current={step} />

        <div className="card-glass">
          {step === "lookup" && (
            <StepLookup
              initialCode={qrCode}
              initialToken={activationToken}
              onSuccess={(c, t) => {
                setQrCode(c);
                setActivationToken(t);
                if (auth.status === "authenticated") setStep("vehicle");
                else setStep("auth");
              }}
            />
          )}

          {step === "auth" && (
            <StepAuth
              onContinue={() => {
                if (auth.status === "authenticated") {
                  setStep("vehicle");
                } else {
                  // Force redirect to login with proper redirect
                  router.push(
                    `/auth/login?redirect=/activate/${encodeURIComponent(qrCode)}?token=${encodeURIComponent(activationToken)}`,
                  );
                }
              }}
            />
          )}

          {step === "vehicle" && (
            <StepVehicle
              onSuccess={(e) => {
                setEntity(e);
                setStep("privacy");
              }}
            />
          )}

          {step === "privacy" && entity && (
            <StepPrivacy
              entity={entity}
              qrCode={qrCode}
              activationToken={activationToken}
              onSuccess={() => setStep("done")}
            />
          )}

          {step === "done" && <StepDone qrCode={qrCode} />}
        </div>
      </div>
    </main>
  );
}

