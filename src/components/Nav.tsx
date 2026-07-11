"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ru } from "@/lib/i18n/ru";

export function Nav() {
  const pathname = usePathname();
  const auth = useAuth();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="nav" aria-label="Основная навигация">
      <div className="nav-inner">
        <Link href="/" className="nav-logo" aria-label="birlinq — на главную">
          bq
        </Link>

        <div className="nav-links">
          {auth.status === "authenticated" ? (
            <>
              <Link
                href="/owner"
                className={`nav-link${isActive("/owner") ? " nav-link-active" : ""}`}
              >
                {ru.nav.dashboard}
              </Link>
              <button
                className="btn-ghost"
                onClick={() => auth.logout()}
                type="button"
              >
                {ru.nav.logout}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="nav-link">
                {ru.nav.login}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
