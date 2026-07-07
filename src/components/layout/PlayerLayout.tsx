import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, CalendarDays, Dumbbell, BarChart3, User, Bell } from "lucide-react";
import { YMLogo } from "@/components/ym/Logo";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/player/dashboard", label: "Home", icon: Home },
  { to: "/player/training", label: "Training", icon: CalendarDays },
  { to: "/player/workouts", label: "Workout", icon: Dumbbell },
  { to: "/player/stats", label: "Stats", icon: BarChart3 },
  { to: "/player/profile", label: "Profile", icon: User },
] as const;

export function PlayerLayout({ title, children }: { title?: string; children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { currentUser } = useAuth();
  const { data } = useAppData();
  const player = data.players.find((item) => item.id === currentUser?.playerId) ?? data.players[0];
  const unread = data.notifications.some((note) => !note.read && (note.targetRole === "all" || note.targetRole === "player"));

  return (
    <div className="grid-bg min-h-[100dvh] text-foreground">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-4xl items-center justify-between px-4 py-3">
          <Link to="/player/dashboard" className="flex min-w-0 items-center gap-3">
            <YMLogo size={36} />
            <div className="min-w-0 leading-tight">
              <div className="text-[10px] font-semibold text-cyan">Young Machine</div>
              <div className="truncate text-sm font-black">{title ?? "Player"}</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/player/notifications"
              className="relative grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.045]"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unread && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-cyan shadow-[0_0_14px_var(--cyan)]" />}
            </Link>
            <Link to="/player/profile">
              <PlayerAvatar name={player?.name ?? currentUser?.name ?? "Player"} hue={player?.avatarHue ?? 205} size={40} />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-5 pb-28">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-background/92 pb-safe backdrop-blur-xl">
        <div className="mx-auto grid max-w-4xl grid-cols-5 px-2">
          {tabs.map((t) => {
            const active = path === t.to || path.startsWith(t.to + "/");
            const Icon = t.icon;

            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold",
                  active ? "text-cyan" : "text-silver-muted",
                )}
              >
                <div
                  className={cn(
                    "relative grid h-10 w-12 place-items-center rounded-2xl border",
                    active ? "border-cyan/25 bg-cyan/10 shadow-inner" : "border-transparent",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
