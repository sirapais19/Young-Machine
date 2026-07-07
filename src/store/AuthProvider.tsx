import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthUser, Role } from "@/types/app";

const STORAGE_KEY = "ym-auth-user-v1";

const users: Record<string, AuthUser & { password: string }> = {
  "capang@gmail.com": { id: "coach-capang", name: "Capang", email: "capang@gmail.com", role: "coach", password: "capang1234" },
  "aina@gmail.com": { id: "manager-aina", name: "Aina", email: "aina@gmail.com", role: "manager", password: "aina1234" },
  "aidit@gmail.com": { id: "player-aidit", name: "Aidit", email: "aidit@gmail.com", role: "player", playerId: "p1", password: "Player1234" },
  "abu@gmail.com": { id: "player-abu", name: "Abu", email: "abu@gmail.com", role: "player", playerId: "p2", password: "Player1234" },
  "ali@gmail.com": { id: "player-ali", name: "Ali", email: "ali@gmail.com", role: "player", playerId: "p3", password: "Player1234" },
};

export interface AuthContextValue {
  currentUser: AuthUser | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { ok: true; user: AuthUser } | { ok: false; error: string };
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function loadUser() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(loadUser);

  useEffect(() => {
    if (currentUser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentUser]);

  const login = useCallback((email: string, password: string) => {
    const user = users[email.trim().toLowerCase()];
    if (!user || user.password !== password) {
      return { ok: false as const, error: "Email or password is incorrect." };
    }
    const { password: _password, ...authUser } = user;
    setCurrentUser(authUser);
    return { ok: true as const, user: authUser };
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      role: currentUser?.role ?? null,
      isAuthenticated: Boolean(currentUser),
      login,
      logout,
    }),
    [currentUser, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
