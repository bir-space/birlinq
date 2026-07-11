"use client";

import { useEffect, useState } from "react";
import { api, type AdminOverview } from "@/lib/api";

export function AdminDashboardPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">("loading");

  const load = (showLoading = true) => {
    if (showLoading) {
      setStatus("loading");
    }
    api
      .getAdminOverview()
      .then((result) => {
        setData(result);
        setStatus(result.qrBatches.length === 0 ? "empty" : "ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(() => {
    api
      .getAdminOverview()
      .then((result) => {
        setData(result);
        setStatus(result.qrBatches.length === 0 ? "empty" : "ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  const toggleBlock = async (code: string, block: boolean) => {
    if (block) {
      await api.blockQr(code);
    } else {
      await api.unblockQr(code);
    }
    load();
  };

  if (status === "loading") return <p className="state state-loading">Загрузка админ-панели…</p>;
  if (status === "error") return <p className="state state-error">Ошибка загрузки админ-панели.</p>;
  if (status === "empty") return <p className="state state-empty">Пока нет партий QR.</p>;

  return (
    <section className="container stack-lg">
      <h1>Админ-панель birlinq Move</h1>
      <div className="cards-grid">
        <article className="card">
          <h2>Взаимодействий сегодня</h2>
          <p className="metric">{data?.interactionsToday ?? 0}</p>
        </article>
        <article className="card">
          <h2>Лиды сегодня</h2>
          <p className="metric">{data?.leadsToday ?? 0}</p>
        </article>
      </div>

      <h2>Партии QR</h2>
      <ul className="stack-sm">
        {data?.qrBatches.map((batch) => (
          <li key={batch.id} className="card stack-sm">
            <strong>{batch.title}</strong>
            <span>Всего: {batch.total}</span>
            <span>Активно: {batch.active}</span>
            <span>Заблокировано: {batch.blocked}</span>
            <div className="actions">
              <button type="button" onClick={() => toggleBlock(batch.id, true)}>
                Блокировать QR
              </button>
              <button type="button" onClick={() => toggleBlock(batch.id, false)}>
                Разблокировать QR
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
