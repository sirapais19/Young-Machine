import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, CalendarDays, Dumbbell, BarChart3, User, Bell } from "lucide-react";
import { YMLogo } from "@/components/ym/Logo";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { currentUser } from "@/data/mockData";
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 h-16 flex items-center justify-between">
          <Link to="/player/dashboard" className="flex items-center gap-2">
            <YMLogo size={32} />
            <div className="leading-none">
              <div className="text-[10px] uppercase tracking-[0.25em] text-silver-muted">YM</div>
              <div className="text-sm font-semibold">{title ?? "Player"}</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/player/notifications" className="grid h-10 w-10 place-items-center rounded-md border border-white/10 relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-cyan" />
            </Link>
            <Link to="/player/profile">
              <PlayerAvatar name={currentUser.name} hue={205} size={36} />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5 pb-28">{children}</main>

      {/* Bottom nav — mobile & desktop (keeps sports app feel) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-background/95 backdrop-blur-xl pb-safe">
        <div className="mx-auto max-w-3xl grid grid-cols-5">
          {tabs.map((t) => {
            const active = path === t.to || path.startsWith(t.to + "/");
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium",
                  active ? "text-cyan" : "text-silver-muted"
                )}
              >
                <div className={cn("relative grid h-9 w-12 place-items-center rounded-full transition-colors",
                  active && "bg-cyan/10")}>
                  <Icon className="h-5 w-5" />
                  {active && <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-cyan" />}
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
