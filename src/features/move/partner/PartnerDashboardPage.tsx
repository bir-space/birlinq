"use client";

import { useEffect, useState } from "react";
import { api, type PartnerOverview } from "@/lib/api";

export function PartnerDashboardPage() {
  const [data, setData] = useState<PartnerOverview | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">("loading");

  useEffect(() => {
    api
      .getPartnerOverview()
      .then((result) => {
        setData(result);
        setStatus(result.batches.length === 0 ? "empty" : "ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  if (status === "loading") return <p className="state state-loading">Загрузка кабинета партнера…</p>;
  if (status === "error") return <p className="state state-error">Не удалось загрузить кабинет партнера.</p>;
  if (status === "empty") return <p className="state state-empty">У вас пока нет партий QR.</p>;

  return (
    <section className="container stack-lg">
      <h1>Партнерский кабинет</h1>
      <article className="card">
        <h2>Активаций сегодня</h2>
        <p className="metric">{data?.activationsToday ?? 0}</p>
      </article>

      <h2>Мои партии</h2>
      <ul className="stack-sm">
        {data?.batches.map((batch) => (
          <li key={batch.id} className="card">
            <h3>{batch.title}</h3>
            <p>Всего QR: {batch.total}</p>
            <p>Активировано: {batch.activated}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
