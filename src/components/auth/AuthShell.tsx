import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { LangSwitcher } from "@/components/ui/LangSwitcher";

/**
 * Common page frame for standalone auth pages:
 * header with logo + language switcher, centered mobile-first column.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-md items-center justify-between px-5 py-4">
        <Logo />
        <LangSwitcher />
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-5 pb-12 pt-6">
        {children}
      </main>
    </div>
  );
}
