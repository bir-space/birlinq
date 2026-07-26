import type { AuthTokenPair, User } from "../api/types";

/**
 * Token storage strategy (web):
 *  - access token: memory only (short-lived, 15 min)
 *  - refresh token: localStorage (pragmatic MVP choice; the backend rotates
 *    refresh tokens on every use and cascade-revokes on theft detection).
 *  - user snapshot: localStorage for instant hydration.
 *
 * The backend docs suggest httpOnly cookies via a BFF; that can be layered in
 * later by swapping this module without touching call sites.
 */

const REFRESH_KEY = "birlinq.refresh_token";
const USER_KEY = "birlinq.user";

let accessToken: string | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export const tokenStore = {
  getAccessToken(): string | null {
    return accessToken;
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },

  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  setPair(pair: AuthTokenPair) {
    accessToken = pair.access_token;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(REFRESH_KEY, pair.refresh_token);
      if (pair.user) {
        window.localStorage.setItem(USER_KEY, JSON.stringify(pair.user));
      }
    }
    emit();
  },

  setUser(user: User) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    emit();
  },

  clear() {
    accessToken = null;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(REFRESH_KEY);
      window.localStorage.removeItem(USER_KEY);
    }
    emit();
  },

  /** True when we have at least a refresh token to try. */
  hasSession(): boolean {
    return Boolean(accessToken || this.getRefreshToken());
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
