"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../api/types";
import { authApi } from "../api/endpoints";
import { tokenStore } from "./token-store";

interface AuthContextValue {
  user: User | null;
  /** true while we're trying to restore a session on first mount */
  loading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!tokenStore.hasSession()) {
      setUser(null);
      return;
    }
    try {
      const { user } = await authApi.me();
      tokenStore.setUser(user);
      setUser(user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Instant hydration from the cached snapshot, then verify in background.
    const cached = tokenStore.getUser();
    if (cached && tokenStore.hasSession()) setUser(cached);

    let cancelled = false;
    (async () => {
      if (tokenStore.hasSession()) {
        try {
          const { user } = await authApi.me();
          if (!cancelled) {
            tokenStore.setUser(user);
            setUser(user);
          }
        } catch {
          if (!cancelled) setUser(null);
        }
      }
      if (!cancelled) setLoading(false);
    })();

    const unsubscribe = tokenStore.subscribe(() => {
      if (!tokenStore.hasSession()) setUser(null);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: user !== null,
      refresh,
      logout,
    }),
    [user, loading, refresh, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
