"use client";

import { ru } from "@/lib/i18n/ru";

/**
 * Admin panel — Note: Full administration (QR batches, statuses, interactions,
 * leads, block/unblock) is handled by Filament Admin at /admin/*.
 * This page provides a summary and direct link to Filament.
 */
export function AdminDashboardPage() {
  const filamentUrl =
    (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000")
      .replace("/api/v1", "")
      .replace(/\/$/, "") + "/admin";

  return (
    <main className="container stack-xl" style={{ paddingTop: "2rem" }}>
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>
          {ru.admin.title}
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>
          {ru.admin.subtitle}
        </p>
      </div>

      <div className="card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛠</div>
        <h2 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Filament Admin Panel</h2>
        <p style={{ color: "var(--text-2)", marginBottom: "1.5rem", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
          Управление QR-партиями, статусами, блокировкой, обращениями и лидами доступно
          в Filament Admin (Laravel backend).
        </p>
        <a
          href={filamentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-cta"
        >
          {ru.admin.filamentLink} ↗
        </a>
      </div>

      <div className="cards-grid">
        <div className="card">
          <p className="metric-label">QR-партии</p>
          <p style={{ color: "var(--text-2)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
            Создание, печать, управление партиями QR-кодов.
          </p>
          <a href={`${filamentUrl}/qr-batches`} target="_blank" rel="noopener" className="btn btn-secondary" style={{ marginTop: "1rem", fontSize: "0.8rem" }}>
            Открыть →
          </a>
        </div>
        <div className="card">
          <p className="metric-label">Обращения</p>
          <p style={{ color: "var(--text-2)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
            Все сообщения от сканирующих, спам, модерация.
          </p>
          <a href={`${filamentUrl}/interactions`} target="_blank" rel="noopener" className="btn btn-secondary" style={{ marginTop: "1rem", fontSize: "0.8rem" }}>
            Открыть →
          </a>
        </div>
        <div className="card">
          <p className="metric-label">Лиды</p>
          <p style={{ color: "var(--text-2)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
            Заявки «Хочу такую же наклейку» от сканирующих.
          </p>
          <a href={`${filamentUrl}/leads`} target="_blank" rel="noopener" className="btn btn-secondary" style={{ marginTop: "1rem", fontSize: "0.8rem" }}>
            Открыть →
          </a>
        </div>
      </div>
    </main>
  );
}

