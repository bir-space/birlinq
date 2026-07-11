"use client";

import { useEffect, useState } from "react";
import { api, type OwnerDashboard } from "@/lib/api";

export function OwnerDashboardPage() {
  const [data, setData] = useState<OwnerDashboard | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">("loading");

  useEffect(() => {
    api
      .getOwnerDashboard()
      .then((result) => {
        setData(result);
        setStatus(result.vehicles.length === 0 ? "empty" : "ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  if (status === "loading") return <p className="state state-loading">Загрузка кабинета…</p>;
  if (status === "error") return <p className="state state-error">Не удалось загрузить кабинет владельца.</p>;
  if (status === "empty") return <p className="state state-empty">Добавьте первое авто через активацию QR.</p>;

  return (
    <section className="container stack-lg">
      <h1>Кабинет владельца</h1>
      <div className="cards-grid">
        <article className="card">
          <h2>Всего взаимодействий</h2>
          <p className="metric">{data?.analytics.totalInteractions ?? 0}</p>
        </article>
        <article className="card">
          <h2>Уникальных сканеров</h2>
          <p className="metric">{data?.analytics.uniqueScanners ?? 0}</p>
        </article>
      </div>

      <h2>Мои автомобили</h2>
      <ul className="stack-sm">
        {data?.vehicles.map((vehicle) => (
          <li key={vehicle.id} className="card">
            <h3>{vehicle.label}</h3>
            <p>QR: {vehicle.qrCode}</p>
            <p>Статус QR: {vehicle.qrStatus}</p>
            <p>Сообщений: {vehicle.interactions}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
