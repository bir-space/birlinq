"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/use-auth";
import { Logo } from "@/components/ui/Logo";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { PageSpinner } from "@/components/ui/Spinner";
import { IconLogout } from "./bits";

const TABS = [
  { href: "/dashboard", key: "overview", exact: true },
  { href: "/dashboard/interactions", key: "interactions", exact: false },
  { href: "/dashboard/qr", key: "qr", exact: false },
] as const;

/**
 * Shared shell for all /dashboard pages: auth guard, top bar with logo,
 * nav tabs, user name + logout and language switcher. Content is centered
 * at max-w-3xl (sidebar-less top-nav layout on desktop).
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <PageSpinner />
      </div>
    );
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      router.replace("/login");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-line/60 bg-ink/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-4 pt-3 pb-2 lg:py-3">
          <Logo href="/dashboard" />

          <div className="ml-auto flex items-center gap-2 lg:order-last lg:ml-0">
            <span
              className="hidden max-w-36 truncate text-[13px] font-medium text-muted sm:block"
              title={user?.name}
            >
              {user?.name}
            </span>
            <LangSwitcher />
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex h-[34px] cursor-pointer items-center gap-1.5 rounded-full border border-line px-3 text-[12px] font-semibold text-muted transition-colors hover:border-card-border hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconLogout className="size-4" />
              <span className="hidden sm:inline">{tc("logout")}</span>
            </button>
          </div>

          <nav
            aria-label={tc("dashboard")}
            className="-mx-4 order-last flex w-[calc(100%+2rem)] gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:order-none lg:ml-6 lg:w-auto lg:flex-1 lg:pb-0"
          >
            {TABS.map((tab) => {
              const active = tab.exact
                ? pathname === tab.href
                : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
                    active
                      ? "bg-white text-ink-900"
                      : "text-muted hover:bg-card hover:text-white"
                  }`}
                >
                  {t(`nav.${tab.key}`)}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
