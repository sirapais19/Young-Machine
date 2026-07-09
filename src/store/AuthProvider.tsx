import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { hasSupabaseEnv, supabase } from "@/lib/supabase";
import type { AuthUser, Role } from "@/types/app";
import type { ProfileRow } from "@/types/supabase";

const STORAGE_KEY = "ym-auth-user-v1";

export interface AuthContextValue {
  currentUser: AuthUser | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (email: string, password: string) => Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function cacheUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function readCachedAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

async function buildAuthUser(userId: string, fallbackEmail?: string): Promise<AuthUser> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, status, avatar_url, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();

  if (profileError) throw profileError;
  if (!profile) throw new Error("No profile exists for this Supabase user.");

  let playerId: string | undefined;
  if (profile.role === "player") {
    const { data: player, error: playerError } = await supabase.from("players").select("id").eq("user_id", userId).maybeSingle<{ id: string }>();
    if (playerError) throw playerError;
    playerId = player?.id;
  }

  return {
    id: profile.id,
    name: profile.full_name ?? profile.email ?? "Young Machine user",
    email: profile.email ?? fallbackEmail ?? "",
    role: profile.role,
    playerId,
  };
}

export async function readAuthUserForGuard(): Promise<AuthUser | null> {
  if (!hasSupabaseEnv) return readCachedAuthUser();

  const { data } = await supabase.auth.getSession();
  const sessionUser = data.session?.user;
  if (!sessionUser) {
    cacheUser(null);
    return null;
  }

  try {
    const authUser = await buildAuthUser(sessionUser.id, sessionUser.email);
    cacheUser(authUser);
    return authUser;
  } catch (error) {
    console.error("Unable to resolve route guard auth user", error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(readCachedAuthUser);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      if (!hasSupabaseEnv) {
        setIsLoadingAuth(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;
      if (!sessionUser) {
        if (mounted) {
          setCurrentUser(null);
          cacheUser(null);
          setIsLoadingAuth(false);
        }
        return;
      }

      try {
        const authUser = await buildAuthUser(sessionUser.id, sessionUser.email);
        if (mounted) {
          setCurrentUser(authUser);
          cacheUser(authUser);
        }
      } catch (error) {
        console.error("Unable to load Supabase profile", error);
      } finally {
        if (mounted) setIsLoadingAuth(false);
      }
    }

    loadSession();

    if (!hasSupabaseEnv) return () => { mounted = false; };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setCurrentUser(null);
        cacheUser(null);
        return;
      }

      buildAuthUser(session.user.id, session.user.email)
        .then((authUser) => {
          setCurrentUser(authUser);
          cacheUser(authUser);
        })
        .catch((error) => console.error("Unable to sync auth state", error));
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!hasSupabaseEnv) {
      return { ok: false as const, error: "Supabase env is missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY." };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) {
      return { ok: false as const, error: error?.message ?? "Unable to sign in." };
    }

    try {
      const authUser = await buildAuthUser(data.user.id, data.user.email);
      setCurrentUser(authUser);
      cacheUser(authUser);
      return { ok: true as const, user: authUser };
    } catch (profileError) {
      await supabase.auth.signOut();
      return { ok: false as const, error: profileError instanceof Error ? profileError.message : "Unable to load user profile." };
    }
  }, []);

  const logout = useCallback(async () => {
    if (hasSupabaseEnv) await supabase.auth.signOut();
    setCurrentUser(null);
    cacheUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      role: currentUser?.role ?? null,
      isAuthenticated: Boolean(currentUser),
      isLoadingAuth,
      login,
      logout,
    }),
    [currentUser, isLoadingAuth, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
