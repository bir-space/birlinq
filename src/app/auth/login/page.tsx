"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ru } from "@/lib/i18n/ru";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/owner";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      router.push(redirect);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setError(ru.auth.errors.invalid);
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
            {ru.auth.loginTitle}
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>
            {ru.auth.noAccount}{" "}
            <Link
              href={`/auth/register${redirect !== "/owner" ? `?redirect=${redirect}` : ""}`}
              style={{ color: "var(--primary-light)", fontWeight: 600 }}
            >
              {ru.auth.registerLink}
            </Link>
          </p>
        </div>

        <form onSubmit={onSubmit} className="stack-md">
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
            <label className="label" htmlFor="password">{ru.auth.passwordLabel}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={8}
            />
          </div>

          {error && <p className="state state-error" style={{ fontSize: "0.85rem" }}>{error}</p>}

          <button type="submit" className="btn btn-cta btn-full" disabled={loading}>
            {loading ? "Вход…" : ru.auth.loginBtn}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container mobile-first" style={{ paddingTop: "3rem" }}><p className="muted">Загрузка…</p></div>}>
      <LoginForm />
    </Suspense>
  );
}

