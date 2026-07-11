"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type AdminOverview } from "@/lib/api";

export function AdminDashboardPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedQrCodeByBatch, setSelectedQrCodeByBatch] = useState<Record<string, string>>({});

  const applyOverview = (result: AdminOverview) => {
    setData(result);
    setStatus(result.qrBatches.length === 0 ? "empty" : "ready");
  };

  const fetchOverview = useCallback(
    () =>
      api
        .getAdminOverview()
        .then((result) => applyOverview(result))
        .catch(() => setStatus("error")),
    [],
  );

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const getQrCode = (batchId: string, fallbackCode?: string) =>
    selectedQrCodeByBatch[batchId] ?? fallbackCode ?? "";

  const toggleBlock = async (code: string, block: boolean) => {
    setActionError(null);
    if (!code.trim()) {
      setActionError("Укажите QR-код для блокировки или разблокировки.");
      return;
    }
    try {
      if (block) {
        await api.blockQr(code);
      } else {
        await api.unblockQr(code);
      }
      fetchOverview();
    } catch {
      setActionError("Не удалось изменить статус QR. Повторите попытку.");
    }
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
      {actionError ? <p className="state state-error">{actionError}</p> : null}
      <ul className="stack-sm">
        {data?.qrBatches.map((batch) => (
          (() => {
            const qrCode = getQrCode(batch.id, batch.qrCodes?.[0]);
            const isActionDisabled = !qrCode.trim();
            return (
              <li key={batch.id} className="card stack-sm">
                <strong>{batch.title}</strong>
                <span>Всего: {batch.total}</span>
                <span>Активно: {batch.active}</span>
                <span>Заблокировано: {batch.blocked}</span>
                <label className="stack-xs">
                  <span>QR-код для действия</span>
                  <input
                    value={qrCode}
                    onChange={(event) =>
                      setSelectedQrCodeByBatch((prev) => ({
                        ...prev,
                        [batch.id]: event.target.value,
                      }))
                    }
                    placeholder="Введите код QR"
                  />
                </label>
                <div className="actions">
                  <button type="button" disabled={isActionDisabled} onClick={() => toggleBlock(qrCode, true)}>
                    Блокировать QR
                  </button>
                  <button type="button" disabled={isActionDisabled} onClick={() => toggleBlock(qrCode, false)}>
                    Разблокировать QR
                  </button>
                </div>
              </li>
            );
          })()
        ))}
      </ul>
    </section>
  );
}
