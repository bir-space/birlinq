"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ru } from "@/lib/i18n/ru";

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/owner";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ name, email, password });
      router.push(redirect);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) setError(ru.auth.errors.conflict);
        else if (err.status === 422) setError("Проверьте правильность введённых данных.");
        else setError(ru.auth.errors.generic);
      } else {
        setError(ru.auth.errors.generic);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mobile-first" style={{ paddingTop: "3rem" }}>
      <div className="card stack-lg">
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.25rem" }}>
            {ru.auth.registerTitle}
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>
            {ru.auth.hasAccount}{" "}
            <Link
              href={`/auth/login${redirect !== "/owner" ? `?redirect=${redirect}` : ""}`}
              style={{ color: "var(--primary-light)", fontWeight: 600 }}
            >
              {ru.auth.loginLink}
            </Link>
          </p>
        </div>

        <form onSubmit={onSubmit} className="stack-md">
          <div className="field">
            <label className="label" htmlFor="name">{ru.auth.nameLabel}</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Алексей"
              minLength={1}
              maxLength={100}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="email">{ru.auth.emailLabel}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="password">
              {ru.auth.passwordLabel}
              <span style={{ color: "var(--muted)", fontWeight: 400 }}> (мин. 8 символов)</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
              maxLength={100}
            />
          </div>

          {error && <p className="state state-error" style={{ fontSize: "0.85rem" }}>{error}</p>}

          <button type="submit" className="btn btn-cta btn-full" disabled={loading}>
            {loading ? "Создание…" : ru.auth.registerBtn}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="container mobile-first" style={{ paddingTop: "3rem" }}><p className="muted">Загрузка…</p></div>}>
      <RegisterForm />
    </Suspense>
  );
}

