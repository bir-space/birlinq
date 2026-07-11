"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ApiError, api, type PublicQrProfile } from "@/lib/api";
import { MOVE_SCENARIOS, type MoveScenario } from "@/lib/move-scenarios";

type Props = { code: string };

export function PublicQrPage({ code }: Props) {
  const [profile, setProfile] = useState<PublicQrProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scenario, setScenario] = useState<MoveScenario>("car_blocking");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "rate_limit" | "error">("idle");

  useEffect(() => {
    let active = true;

    api
      .getPublicQr(code)
      .then((data) => {
        if (active) {
          setProfile(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!active) {
          return;
        }
        if (err instanceof ApiError && err.status === 404) {
          setError("QR не найден");
          return;
        }
        if (err instanceof ApiError && err.status === 423) {
          setError("QR заблокирован администратором");
          return;
        }
        setError("Не удалось загрузить страницу QR");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [code]);

  const messageLeft = useMemo(() => 500 - message.length, [message.length]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitState("idle");

    try {
      await api.sendPublicInteraction(code, {
        scenario,
        message: message.trim().slice(0, 500),
      });
      setSubmitState("success");
      setMessage("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setSubmitState("rate_limit");
      } else {
        setSubmitState("error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="state state-loading">Загрузка страницы QR…</p>;
  }

  if (error || !profile) {
    return <p className="state state-error">{error ?? "Страница недоступна"}</p>;
  }

  return (
    <section className="container mobile-first">
      <h1>Связаться с владельцем авто</h1>
      <p className="muted">Контакты владельца скрыты. Отправьте безопасное сообщение без регистрации.</p>
      <dl className="meta-list" aria-label="Информация об авто">
        <div>
          <dt>Автомобиль</dt>
          <dd>{profile.vehicleLabel ?? "Скрыто"}</dd>
        </div>
        <div>
          <dt>Номер</dt>
          <dd>{profile.maskedPlate ?? "Скрыто"}</dd>
        </div>
      </dl>

      <form onSubmit={handleSubmit} className="stack-lg" aria-label="Форма сообщения владельцу">
        <fieldset>
          <legend>Сценарий</legend>
          <div className="stack-sm">
            {MOVE_SCENARIOS.map((item) => (
              <label key={item.value} className="choice">
                <input
                  type="radio"
                  name="scenario"
                  value={item.value}
                  checked={scenario === item.value}
                  onChange={() => setScenario(item.value)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="stack-xs">
          <span>Сообщение (до 500 символов)</span>
          <textarea
            value={message}
            maxLength={500}
            required={scenario !== "want_same_sticker"}
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
            placeholder="Опишите ситуацию"
          />
          <small className="muted">Осталось символов: {messageLeft}</small>
        </label>

        <button type="submit" disabled={submitting || (scenario !== "want_same_sticker" && !message.trim())}>
          {submitting ? "Отправка…" : "Отправить"}
        </button>

        {submitState === "success" ? <p className="state state-success">Сообщение отправлено владельцу.</p> : null}
        {submitState === "rate_limit" ? (
          <p className="state state-warning">Слишком много попыток. Попробуйте снова через минуту.</p>
        ) : null}
        {submitState === "error" ? (
          <p className="state state-error">Ошибка отправки. Проверьте соединение и попробуйте снова.</p>
        ) : null}
      </form>
    </section>
  );
}
