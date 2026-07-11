"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";

type Props = { code: string };

export function ActivationPage({ code }: Props) {
  const [status, setStatus] = useState<"loading" | "new" | "activated" | "blocked" | "error">("loading");
  const [ownerName, setOwnerName] = useState("");
  const [ownerContact, setOwnerContact] = useState("");
  const [vehicleLabel, setVehicleLabel] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [exposeContact, setExposeContact] = useState(false);
  const [exposePlate, setExposePlate] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .getActivationStatus(code)
      .then((result) => setStatus(result.status))
      .catch(() => setStatus("error"));
  }, [code]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitState("idle");

    try {
      await api.activateQr(code, {
        ownerName,
        ownerContact,
        vehicleLabel,
        licensePlate: licensePlate || undefined,
        exposeContact,
        exposePlate,
      });
      setSubmitState("success");
      setStatus("activated");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setStatus("activated");
        setSubmitState("success");
        return;
      }
      setSubmitState("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return <p className="state state-loading">Проверяем QR…</p>;
  }

  if (status === "blocked") {
    return <p className="state state-error">Этот QR заблокирован. Обратитесь в поддержку.</p>;
  }

  if (status === "activated") {
    return <p className="state state-success">QR уже активирован и привязан к владельцу.</p>;
  }

  if (status === "error") {
    return <p className="state state-error">Не удалось загрузить статус QR.</p>;
  }

  return (
    <section className="container mobile-first">
      <h1>Активация QR для авто</h1>
      <p className="muted">Контакты и номер авто по умолчанию скрыты для сканирующего.</p>
      <form onSubmit={onSubmit} className="stack-lg">
        <label className="stack-xs">
          <span>Имя владельца</span>
          <input value={ownerName} onChange={(event) => setOwnerName(event.target.value)} required />
        </label>
        <label className="stack-xs">
          <span>Контакт для уведомлений</span>
          <input value={ownerContact} onChange={(event) => setOwnerContact(event.target.value)} required />
        </label>
        <label className="stack-xs">
          <span>Автомобиль</span>
          <input value={vehicleLabel} onChange={(event) => setVehicleLabel(event.target.value)} required />
        </label>
        <label className="stack-xs">
          <span>Госномер (опционально)</span>
          <input value={licensePlate} onChange={(event) => setLicensePlate(event.target.value)} />
        </label>

        <label className="choice">
          <input type="checkbox" checked={exposeContact} onChange={(event) => setExposeContact(event.target.checked)} />
          <span>Показывать контакт сканирующему</span>
        </label>
        <label className="choice">
          <input type="checkbox" checked={exposePlate} onChange={(event) => setExposePlate(event.target.checked)} />
          <span>Показывать номер авто сканирующему</span>
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? "Активация…" : "Активировать"}
        </button>

        {submitState === "success" ? <p className="state state-success">QR успешно активирован.</p> : null}
        {submitState === "error" ? <p className="state state-error">Не удалось активировать QR.</p> : null}
      </form>
    </section>
  );
}
