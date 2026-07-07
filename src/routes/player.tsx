import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import type { AuthUser } from "@/types/app";

export const Route = createFileRoute("/player")({
  beforeLoad: () => {
    const user = readAuthUser();
    if (!user) throw redirect({ to: "/login" });
    if (user.role === "coach" || user.role === "manager") throw redirect({ to: "/dashboard" });
  },
  component: () => <Outlet />,
});

function readAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("ym-auth-user-v1");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}
