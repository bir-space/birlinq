"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  authApi,
  setUnauthenticatedHandler,
  tokenStore,
  type User,
} from "@/lib/api";

// ── Types ────────────────────────────────────────────────────
type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: User }
  | { status: "unauthenticated" };

type AuthContextValue = AuthState & {
  login: (params: {
    email?: string;
    phone?: string;
    password: string;
  }) => Promise<void>;
  register: (params: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

// ── Context ───────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

// ── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  // Try silent restore on mount
  useEffect(() => {
    const refresh = tokenStore.getRefresh();
    if (!refresh) {
      setState({ status: "unauthenticated" });
      return;
    }

    authApi
      .refresh(refresh)
      .then((pair) => {
        tokenStore.setAccess(pair.access_token);
        tokenStore.setRefresh(pair.refresh_token);
        if (pair.user) {
          setState({ status: "authenticated", user: pair.user });
        } else {
          return authApi.me().then((u) =>
            setState({ status: "authenticated", user: u }),
          );
        }
      })
      .catch(() => {
        tokenStore.clear();
        setState({ status: "unauthenticated" });
      });
  }, []);

  // Handle 401 from any request
  useEffect(() => {
    setUnauthenticatedHandler(() => {
      tokenStore.clear();
      setState({ status: "unauthenticated" });
    });
  }, []);

  const login = useCallback(
    async (params: { email?: string; phone?: string; password: string }) => {
      const pair = await authApi.login(params);
      tokenStore.setAccess(pair.access_token);
      tokenStore.setRefresh(pair.refresh_token);
      const user = pair.user ?? (await authApi.me());
      setState({ status: "authenticated", user });
    },
    [],
  );

  const register = useCallback(
    async (params: {
      name: string;
      email?: string;
      phone?: string;
      password: string;
    }) => {
      const pair = await authApi.register({ ...params, locale: "ru" });
      tokenStore.setAccess(pair.access_token);
      tokenStore.setRefresh(pair.refresh_token);
      const user = pair.user ?? (await authApi.me());
      setState({ status: "authenticated", user });
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      tokenStore.clear();
      setState({ status: "unauthenticated" });
    }
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
