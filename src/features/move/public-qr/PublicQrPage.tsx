"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ApiError, publicApi, type PublicEntityPayload, type Scenario } from "@/lib/api";
import { ru } from "@/lib/i18n/ru";

type Props = { code: string };
const MAX_LEN = 500;

type SubmitStatus = "idle" | "submitting" | "success" | "rate_limited" | "error";
type PageStatus = "loading" | "ready" | "not_found" | "gone" | "error";

// ── Lead form ──────────────────────────────────────────────────
function LeadForm({ code }: { code: string }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await publicApi.submitLead(code, { name, contact, city: city || undefined });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="state state-success">
        Заявка принята! Мы свяжемся с вами.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="stack-md" aria-label="Заявка на стикер">
      <p style={{ color: "var(--text-2)", fontSize: "0.9rem" }}>
        Оставьте контакт, чтобы мы связались с вами по поводу birlinq Move.
      </p>
      <div className="field">
        <label className="label">Ваше имя</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Алексей"
          required
          maxLength={100}
          type="text"
        />
      </div>
      <div className="field">
        <label className="label">Телефон или e-mail</label>
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="+7 777 000 00 00"
          required
          maxLength={100}
          type="text"
        />
      </div>
      <div className="field">
        <label className="label">Город (опционально)</label>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Алматы"
          maxLength={100}
          type="text"
        />
      </div>
      {status === "error" && (
        <p className="state state-error" style={{ fontSize: "0.85rem" }}>
          Ошибка отправки. Попробуйте снова.
        </p>
      )}
      <button type="submit" className="btn btn-cta btn-full" disabled={status === "sending"}>
        {status === "sending" ? "Отправка…" : "Отправить заявку"}
      </button>
    </form>
  );
}

// ── Scenario card ──────────────────────────────────────────────
function ScenarioCard({
  scenario,
  selected,
  onSelect,
}: {
  scenario: Scenario;
  selected: boolean;
  onSelect: () => void;
}) {
  const code = scenario.code as keyof typeof ru.scenarios;
  const local = ru.scenarios[code];

  return (
    <button
      type="button"
      className={`scenario-card${selected ? " selected" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="scenario-icon" aria-hidden="true">
        {local?.icon ?? scenario.icon ?? "📩"}
      </span>
      <div>
        <div className="scenario-title">{local?.title ?? scenario.title}</div>
        {(local?.desc ?? scenario.description) ? (
          <div className="scenario-desc">{local?.desc ?? scenario.description}</div>
        ) : null}
      </div>
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────
export function PublicQrPage({ code }: Props) {
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
  const [payload, setPayload] = useState<PublicEntityPayload | null>(null);

  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [message, setMessage] = useState("");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");

  useEffect(() => {
    let active = true;
    publicApi
      .getQr(code)
      .then((data) => {
        if (!active) return;
        setPayload(data);
        if (data.scenarios.length > 0) {
          setSelectedScenario(data.scenarios[0]);
        }
        setPageStatus("ready");
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof ApiError) {
          if (err.status === 404) setPageStatus("not_found");
          else if (err.status === 410) setPageStatus("gone");
          else setPageStatus("error");
        } else {
          setPageStatus("error");
        }
      });
    return () => { active = false; };
  }, [code]);

  const isLeadScenario = selectedScenario?.code === "want_same_sticker";
  const canSubmit =
    submitStatus !== "submitting" &&
    !!selectedScenario &&
    (isLeadScenario || message.trim().length > 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedScenario) return;
    setSubmitStatus("submitting");
    try {
      await publicApi.submitScenario(code, selectedScenario.id, {
        message: message.trim().slice(0, MAX_LEN),
        visitor_locale: "ru",
      });
      setSubmitStatus("success");
      setMessage("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setSubmitStatus("rate_limited");
      } else {
        setSubmitStatus("error");
      }
    }
  };

  // ── Error states ───────────────────────────────────────────
  if (pageStatus === "loading") {
    return (
      <main className="container mobile-first" style={{ paddingTop: "3rem" }}>
        <div
          className="skeleton"
          style={{ height: "2rem", width: "60%", marginBottom: "1rem" }}
        />
        <div className="skeleton" style={{ height: "1rem", width: "80%", marginBottom: "0.5rem" }} />
        <div className="skeleton" style={{ height: "1rem", width: "50%" }} />
      </main>
    );
  }

  if (pageStatus === "not_found") {
    return (
      <main className="container mobile-first" style={{ paddingTop: "3rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
        <h1 style={{ marginBottom: "0.5rem" }}>QR не найден</h1>
        <p className="muted" style={{ marginBottom: "1.5rem" }}>
          Этот QR-стикер не существует или был удалён.
        </p>
        <Link href="/" className="btn btn-secondary">На главную</Link>
      </main>
    );
  }

  if (pageStatus === "gone") {
    return (
      <main className="container mobile-first" style={{ paddingTop: "3rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏸</div>
        <h1 style={{ marginBottom: "0.5rem" }}>{ru.qr.blockedTitle}</h1>
        <p className="muted" style={{ marginBottom: "1.5rem" }}>{ru.qr.blockedMsg}</p>
        <Link href="/" className="btn btn-secondary">На главную</Link>
      </main>
    );
  }

  if (pageStatus === "error" || !payload) {
    return (
      <main className="container mobile-first" style={{ paddingTop: "3rem" }}>
        <div className="state state-error">Не удалось загрузить страницу. Попробуйте снова.</div>
      </main>
    );
  }

  const vehicle = payload.entity.vehicle;
  const showVehicle = !!(vehicle?.make || vehicle?.model || vehicle?.color);

  // ── Success after submission ──────────────────────────────
  if (submitStatus === "success" && !isLeadScenario) {
    return (
      <main className="container mobile-first stack-lg" style={{ paddingTop: "2rem" }}>
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
          <h1 style={{ marginBottom: "0.5rem" }}>Сообщение отправлено</h1>
          <p style={{ color: "var(--text-2)", marginBottom: "1.5rem" }}>
            {ru.qr.success}
          </p>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => setSubmitStatus("idle")}
          >
            Отправить ещё
          </button>
        </div>

        {/* Want same sticker CTA */}
        <div
          className="card"
          style={{
            textAlign: "center",
            background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(34,211,238,0.06) 100%)",
            borderColor: "rgba(124,58,237,0.25)",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: "0.75rem" }}>
            {ru.qr.wantStickerTitle}
          </p>
          <Link href="/#buy" className="btn btn-cta">
            {ru.qr.wantStickerCta}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mobile-first stack-lg" style={{ paddingTop: "2rem" }}>
      {/* ── Header ── */}
      <header className="stack-sm">
        <div className="actions" style={{ justifyContent: "space-between" }}>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 800 }}>{ru.qr.title}</h1>
          {payload.meta.privacy_badge && (
            <span className="privacy-badge" aria-label="Данные защищены">
              🔒 {ru.qr.privacyBadge}
            </span>
          )}
        </div>
        <p style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>
          Сообщения доходят до владельца без раскрытия его контактов.
          Регистрация не нужна.
        </p>
      </header>

      {/* ── Vehicle info ── */}
      {showVehicle && (
        <dl className="meta-list" aria-label="Информация об автомобиле">
          {(vehicle?.make || vehicle?.model) && (
            <div>
              <dt>{ru.qr.vehicleSection}</dt>
              <dd>
                {[vehicle?.make, vehicle?.model, vehicle?.color]
                  .filter(Boolean)
                  .join(" ") || "Скрыто"}
              </dd>
            </div>
          )}
          <div>
            <dt>Госномер</dt>
            <dd>{vehicle?.plate_number ?? ru.qr.plateHidden}</dd>
          </div>
        </dl>
      )}

      {/* ── Scenario: lead form ── */}
      {isLeadScenario ? (
        <section className="card stack-md" aria-label="Заявка на стикер">
          <div style={{ fontSize: "1.5rem" }}>⭐</div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
            {ru.qr.wantStickerTitle}
          </h2>
          <LeadForm code={code} />
          <button
            type="button"
            className="btn-ghost"
            style={{ alignSelf: "flex-start" }}
            onClick={() => setSelectedScenario(
              payload.scenarios.find((s) => s.code !== "want_same_sticker") ?? null
            )}
          >
            ← Назад
          </button>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="stack-lg" aria-label="Форма сообщения владельцу">
          {/* Scenario selection */}
          <section aria-label={ru.qr.scenarioTitle}>
            <p style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.75rem" }}>
              {ru.qr.scenarioTitle}
            </p>
            <div className="stack-sm">
              {payload.scenarios.map((s) => (
                <ScenarioCard
                  key={s.id}
                  scenario={s}
                  selected={selectedScenario?.id === s.id}
                  onSelect={() => {
                    setSelectedScenario(s);
                    if (s.prefilled_message) setMessage(s.prefilled_message);
                    else if (selectedScenario?.id !== s.id) setMessage("");
                  }}
                />
              ))}
            </div>
          </section>

          {/* Message textarea */}
          {selectedScenario && (
            <div className="field">
              <label className="label" htmlFor="qr-message">
                {ru.qr.messageLabel}
              </label>
              <textarea
                id="qr-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={MAX_LEN}
                placeholder={ru.qr.messagePlaceholder}
                rows={4}
              />
              <small className="muted text-xs">
                {ru.qr.charsLeft(MAX_LEN - message.length)}
              </small>
            </div>
          )}

          {/* Status messages */}
          {submitStatus === "rate_limited" && (
            <p className="state state-warning">{ru.qr.rateLimited}</p>
          )}
          {submitStatus === "error" && (
            <p className="state state-error">{ru.qr.error}</p>
          )}

          <button
            type="submit"
            className="btn btn-cta btn-full"
            disabled={!canSubmit}
          >
            {submitStatus === "submitting" ? ru.qr.submitting : ru.qr.submitBtn}
          </button>
        </form>
      )}

      {/* ── Footer ── */}
      <footer style={{ paddingTop: "1rem", borderTop: "1px solid var(--line)" }}>
        <div className="actions" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{ fontSize: "0.8rem", color: "var(--muted)" }}
          >
            Платформа birlinq
          </Link>
          <button
            type="button"
            className="btn-ghost"
            style={{ fontSize: "0.78rem", color: "var(--muted)", padding: "0.2rem 0.5rem" }}
            onClick={() => {
              const reason = prompt("Причина жалобы (spam / harassment / other):");
              if (reason) {
                publicApi.reportAbuse(code, {
                  reason: reason as "spam" | "harassment" | "other",
                });
              }
            }}
          >
            {ru.qr.reportAbuse}
          </button>
        </div>
      </footer>
    </main>
  );
}

