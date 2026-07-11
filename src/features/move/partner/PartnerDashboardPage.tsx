"use client";

import { ru } from "@/lib/i18n/ru";

/**
 * Partner cabinet — MVP minimum.
 * Full partner management is via Filament Partner at /partner/*.
 */
export function PartnerDashboardPage() {
  const partnerUrl =
    (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000")
      .replace("/api/v1", "")
      .replace(/\/$/, "") + "/partner";

  return (
    <main className="container stack-xl" style={{ paddingTop: "2rem" }}>
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>
          {ru.partner.title}
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>
          {ru.partner.subtitle}
        </p>
      </div>

      <div className="card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🤝</div>
        <h2 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Partner Portal</h2>
        <p style={{ color: "var(--text-2)", marginBottom: "1.5rem", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
          Просматривайте свои партии QR, статистику активаций и партнёрскую аналитику
          в Partner Portal (Filament).
        </p>
        <a
          href={partnerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-cta"
        >
          {ru.partner.filamentLink} ↗
        </a>
      </div>

      <div className="cards-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
        <div className="card">
          <p className="metric-label">{ru.partner.batches}</p>
          <p style={{ color: "var(--text-2)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
            Ваши партии QR-стикеров.
          </p>
          <a href={`${partnerUrl}/batches`} target="_blank" rel="noopener" className="btn btn-secondary" style={{ marginTop: "1rem", fontSize: "0.8rem" }}>
            Открыть →
          </a>
        </div>
        <div className="card">
          <p className="metric-label">Активации</p>
          <p style={{ color: "var(--text-2)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
            Активации по вашим партиям.
          </p>
          <a href={`${partnerUrl}/activations`} target="_blank" rel="noopener" className="btn btn-secondary" style={{ marginTop: "1rem", fontSize: "0.8rem" }}>
            Открыть →
          </a>
        </div>
      </div>
    </main>
  );
}

