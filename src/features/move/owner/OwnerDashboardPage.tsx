"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApiError,
  entitiesApi,
  ownerApi,
  qrApi,
  type Entity,
  type Interaction,
  type OwnerDashboardData,
  type PrivacySettings,
  type QrCode,
  type CursorPage,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ru } from "@/lib/i18n/ru";

// ── Stat card ─────────────────────────────────────────────────
function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <article
      className="card"
      style={
        highlight
          ? { borderColor: "rgba(124,58,237,0.35)", background: "rgba(124,58,237,0.08)" }
          : {}
      }
    >
      <div className="metric-label">{label}</div>
      <div className="metric">{value}</div>
    </article>
  );
}

// ── QR status badge ───────────────────────────────────────────
function QrStatusBadge({ status }: { status: QrCode["status"] }) {
  const map: Record<QrCode["status"], string> = {
    activated: "badge-activated",
    paused: "badge-paused",
    blocked: "badge-blocked",
    created: "badge-created",
    printed: "badge-created",
    available: "badge-created",
    lost: "badge-blocked",
    deleted: "badge-blocked",
  };
  const labels: Record<QrCode["status"], string> = {
    activated: "Активен",
    paused: "Пауза",
    blocked: "Заблокирован",
    created: "Новый",
    printed: "Напечатан",
    available: "Доступен",
    lost: "Утерян",
    deleted: "Удалён",
  };
  return <span className={`badge ${map[status] ?? "badge-created"}`}>{labels[status]}</span>;
}

// ── Interaction status badge ──────────────────────────────────
function InteractionBadge({ status }: { status: Interaction["status"] }) {
  const map = { new: "badge-new", resolved: "badge-resolved", spam: "badge-blocked" };
  const labels = { new: "Новое", resolved: "Решено", spam: "Спам" };
  return <span className={`badge ${map[status]}`}>{labels[status]}</span>;
}

// ── Privacy settings panel ────────────────────────────────────
function PrivacyPanel({
  entityId,
  onClose,
}: {
  entityId: string;
  onClose: () => void;
}) {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    entitiesApi.getPrivacy(entityId).then(setSettings).catch(() => setError("Ошибка загрузки"));
  }, [entityId]);

  const toggle = <K extends keyof PrivacySettings>(key: K) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: !settings[key] });
    setSaved(false);
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    try {
      await entitiesApi.updatePrivacy(entityId, settings);
      setSaved(true);
    } catch {
      setError("Ошибка сохранения. Попробуйте снова.");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="card">
        {error ? (
          <p className="state state-error" style={{ fontSize: "0.85rem" }}>{error}</p>
        ) : (
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Загрузка…</p>
        )}
      </div>
    );
  }

  type ToggleKey = keyof Pick<
    PrivacySettings,
    "show_owner_name" | "show_phone" | "show_whatsapp" | "show_telegram" | "show_plate_number" | "show_vehicle_details"
  >;

  const rows: Array<{ key: ToggleKey; label: string }> = [
    { key: "show_vehicle_details", label: ru.activation.privacy.showVehicleDetails },
    { key: "show_plate_number", label: ru.activation.privacy.showPlate },
    { key: "show_owner_name", label: ru.activation.privacy.showOwnerName },
    { key: "show_phone", label: ru.activation.privacy.showPhone },
    { key: "show_whatsapp", label: ru.activation.privacy.showWhatsapp },
    { key: "show_telegram", label: ru.activation.privacy.showTelegram },
  ];

  return (
    <div className="card stack-md">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontWeight: 700, fontSize: "0.95rem" }}>{ru.dashboard.privacySettings}</h3>
        <button type="button" className="btn-ghost" onClick={onClose} style={{ padding: "0.2rem 0.5rem" }}>
          ✕
        </button>
      </div>
      {rows.map(({ key, label }) => (
        <div className="toggle-row" key={key}>
          <span className="toggle-label">{label}</span>
          <input
            type="checkbox"
            className="toggle"
            checked={settings[key] as boolean}
            onChange={() => toggle(key)}
            aria-label={label}
          />
        </div>
      ))}
      {error && <p className="state state-error" style={{ fontSize: "0.85rem" }}>{error}</p>}
      {saved && <p className="state state-success" style={{ fontSize: "0.85rem" }}>Настройки сохранены</p>}
      <button type="button" className="btn btn-cta" onClick={save} disabled={saving}>
        {saving ? "Сохранение…" : "Сохранить"}
      </button>
    </div>
  );
}

// ── QR Card ───────────────────────────────────────────────────
function QrCard({
  qr,
  entity,
  onRefresh,
}: {
  qr: QrCode;
  entity?: Entity;
  onRefresh: () => void;
}) {
  const [pausing, setPausing] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handlePause = async () => {
    setPausing(true);
    setActionError(null);
    try {
      await qrApi.pause(qr.id);
      onRefresh();
    } catch (err) {
      if (err instanceof ApiError) setActionError(err.message);
      else setActionError("Ошибка");
    } finally {
      setPausing(false);
    }
  };

  const handleResume = async () => {
    setPausing(true);
    setActionError(null);
    try {
      await qrApi.resume(qr.id);
      onRefresh();
    } catch (err) {
      if (err instanceof ApiError) setActionError(err.message);
      else setActionError("Ошибка");
    } finally {
      setPausing(false);
    }
  };

  return (
    <article className="card stack-sm">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
            {entity ? `${entity.vehicle?.make ?? ""} ${entity.vehicle?.model ?? ""}`.trim() || entity.title : "Неизвестно"}
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.2rem" }}>
            {qr.code}
          </div>
        </div>
        <QrStatusBadge status={qr.status} />
      </div>

      <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.78rem", color: "var(--text-2)" }}>
        <span>🔍 {ru.dashboard.scanCount(qr.scan_count)}</span>
        {qr.last_scan_at && (
          <span>Последнее: {new Date(qr.last_scan_at).toLocaleDateString("ru-RU")}</span>
        )}
      </div>

      <div className="actions">
        {qr.status === "activated" && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
            onClick={handlePause}
            disabled={pausing}
          >
            {pausing ? "…" : `⏸ ${ru.dashboard.pauseBtn}`}
          </button>
        )}
        {qr.status === "paused" && (
          <button
            type="button"
            className="btn"
            style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
            onClick={handleResume}
            disabled={pausing}
          >
            {pausing ? "…" : `▶ ${ru.dashboard.resumeBtn}`}
          </button>
        )}
        {qr.status === "activated" && (
          <Link
            href={`/qr/${qr.code}`}
            className="btn btn-secondary"
            style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
            target="_blank"
          >
            🔗 Открыть
          </Link>
        )}
        {qr.entity_id && (
          <button
            type="button"
            className="btn-ghost"
            style={{ fontSize: "0.8rem" }}
            onClick={() => setShowPrivacy((v) => !v)}
          >
            🔒 {ru.dashboard.privacySettings}
          </button>
        )}
      </div>

      {actionError && (
        <p className="state state-error" style={{ fontSize: "0.8rem" }}>{actionError}</p>
      )}

      {showPrivacy && qr.entity_id && (
        <PrivacyPanel entityId={qr.entity_id} onClose={() => setShowPrivacy(false)} />
      )}
    </article>
  );
}

// ── Interactions list ─────────────────────────────────────────
function InteractionsList() {
  const [page, setPage] = useState<CursorPage<Interaction> | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [resolving, setResolving] = useState<string | null>(null);

  const load = useCallback(async (cursor?: string) => {
    setStatus("loading");
    try {
      const data = await ownerApi.interactions({ cursor, limit: 20 });
      setPage(data);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resolve = async (id: string) => {
    setResolving(id);
    try {
      await ownerApi.resolveInteraction(id);
      // Refresh
      load();
    } catch {
      // silent
    } finally {
      setResolving(null);
    }
  };

  const scenarioLabel = (code: string) => {
    const labels: Record<string, string> = {
      car_blocking: "🚧 Блокирует",
      window_open: "🪟 Окно",
      alarm_triggered: "🔔 Сигнал",
      accident_urgent: "🚨 ДТП",
      custom_message: "✉️ Сообщение",
      want_same_sticker: "⭐ Заявка",
    };
    return labels[code] ?? code;
  };

  if (status === "loading") {
    return <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Загрузка обращений…</p>;
  }

  if (status === "error") {
    return (
      <div className="state state-error">Не удалось загрузить обращения.</div>
    );
  }

  if (!page?.data.length) {
    return (
      <div className="state state-empty" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💬</div>
        {ru.dashboard.noInteractions}
      </div>
    );
  }

  return (
    <div className="stack-sm">
      {page.data.map((item) => (
        <div key={item.id} className={`interaction-item${item.status === "new" ? " new" : ""}`}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{scenarioLabel(item.scenario_code)}</span>
              <InteractionBadge status={item.status} />
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", flexShrink: 0 }}>
              {new Date(item.created_at).toLocaleDateString("ru-RU")}
            </span>
          </div>

          {item.message && (
            <p style={{ fontSize: "0.875rem", color: "var(--text-2)", marginBottom: "0.6rem" }}>
              {item.message}
            </p>
          )}

          {item.status === "new" && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: "0.78rem", padding: "0.3rem 0.65rem" }}
              onClick={() => resolve(item.id)}
              disabled={resolving === item.id}
            >
              {resolving === item.id ? "…" : `✓ ${ru.dashboard.resolveBtn}`}
            </button>
          )}
        </div>
      ))}

      {page.meta.has_more && (
        <button
          type="button"
          className="btn btn-secondary"
          style={{ width: "100%" }}
          onClick={() => page.meta.next_cursor ? load(page.meta.next_cursor) : undefined}
        >
          Загрузить ещё
        </button>
      )}
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────
export function OwnerDashboardPage() {
  const auth = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<OwnerDashboardData | null>(null);
  const [qrList, setQrList] = useState<QrCode[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"qrs" | "interactions">("qrs");

  useEffect(() => {
    if (auth.status === "unauthenticated") {
      router.push("/auth/login?redirect=/owner");
    }
  }, [auth.status, router]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashData, qrData, entData] = await Promise.all([
        ownerApi.dashboard(),
        qrApi.list({ limit: 50 }),
        entitiesApi.list({ limit: 50 }),
      ]);
      setStats(dashData);
      setQrList(qrData.data);
      setEntities(entData.data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/auth/login?redirect=/owner");
      } else {
        setError("Не удалось загрузить данные кабинета.");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (auth.status === "authenticated") loadData();
  }, [auth.status, loadData]);

  if (auth.status === "loading" || loading) {
    return (
      <main className="container" style={{ paddingTop: "2rem" }}>
        <div className="stack-md">
          <div className="skeleton" style={{ height: "2rem", width: "40%" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: "5rem" }} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container" style={{ paddingTop: "2rem" }}>
        <div className="state state-error">{error}</div>
        <button type="button" className="btn btn-secondary" onClick={loadData} style={{ marginTop: "1rem" }}>
          {ru.states.retry}
        </button>
      </main>
    );
  }

  const entityMap = Object.fromEntries(entities.map((e) => [e.id, e]));

  return (
    <main className="container stack-xl" style={{ paddingTop: "2rem" }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{ru.dashboard.title}</h1>
          {auth.status === "authenticated" && (
            <p style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>
              {auth.user.name}
            </p>
          )}
        </div>
        <Link href="/activate/enter" className="btn btn-cta" style={{ fontSize: "0.875rem" }}>
          + Активировать QR
        </Link>
      </div>

      {/* ── Stats ── */}
      {stats && (
        <section aria-label="Статистика">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "0.75rem",
            }}
          >
            <StatCard label={ru.dashboard.activeQrs} value={stats.active_qrs} highlight />
            <StatCard label={ru.dashboard.scans7d} value={stats.scans_7d} />
            <StatCard label={ru.dashboard.scans30d} value={stats.scans_30d} />
            <StatCard label={ru.dashboard.submissions7d} value={stats.submissions_7d} />
            <StatCard
              label={ru.dashboard.unresolved}
              value={stats.unresolved_interactions}
              highlight={stats.unresolved_interactions > 0}
            />
          </div>
        </section>
      )}

      {/* ── Tabs ── */}
      <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: "0" }}>
        <div style={{ display: "flex", gap: "0" }}>
          {(["qrs", "interactions"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className="btn-ghost"
              style={{
                borderRadius: 0,
                padding: "0.6rem 1rem",
                borderBottom: activeTab === tab ? "2px solid var(--primary)" : "2px solid transparent",
                color: activeTab === tab ? "var(--text)" : "var(--text-2)",
                fontWeight: activeTab === tab ? 600 : 400,
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "qrs" ? `🚗 ${ru.dashboard.myCars}` : `💬 ${ru.dashboard.interactions}`}
            </button>
          ))}
        </div>
      </div>

      {/* ── QRs tab ── */}
      {activeTab === "qrs" && (
        <section aria-label="Мои QR">
          {qrList.length === 0 ? (
            <div className="state state-empty" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🚗</div>
              <p>{ru.dashboard.noQrs}</p>
              <Link href="/activate/enter" className="btn btn-cta" style={{ marginTop: "1rem", display: "inline-flex" }}>
                Активировать первый QR
              </Link>
            </div>
          ) : (
            <div className="cards-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
              {qrList.map((qr) => (
                <QrCard
                  key={qr.id}
                  qr={qr}
                  entity={qr.entity_id ? entityMap[qr.entity_id] : undefined}
                  onRefresh={loadData}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Interactions tab ── */}
      {activeTab === "interactions" && (
        <section aria-label="Обращения">
          <InteractionsList />
        </section>
      )}
    </main>
  );
}

