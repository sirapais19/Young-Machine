import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Award,
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Crosshair,
  Dumbbell,
  Globe,
  HeartPulse,
  Image as ImageIcon,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings,
  Trophy,
  Users,
  Users2,
  X,
} from "lucide-react";
import { YMLogo } from "@/components/ym/Logo";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const groups = [
  {
    label: "Command",
    items: [{ to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Roster",
    items: [
      { to: "/dashboard/players", label: "Players", icon: Users },
      { to: "/dashboard/training", label: "Training", icon: CalendarDays },
      { to: "/dashboard/attendance", label: "Attendance", icon: ClipboardCheck },
    ],
  },
  {
    label: "Performance",
    items: [
      { to: "/dashboard/workouts", label: "Workout Plans", icon: Dumbbell },
      { to: "/dashboard/submissions", label: "Submissions", icon: ClipboardList },
      { to: "/dashboard/stats", label: "Player Stats", icon: BarChart3 },
      { to: "/dashboard/fitness", label: "Fitness", icon: Activity },
      { to: "/dashboard/injuries", label: "Injuries", icon: HeartPulse },
    ],
  },
  {
    label: "Compete",
    items: [
      { to: "/dashboard/tournaments", label: "Tournaments", icon: Trophy },
      { to: "/dashboard/team-lineup", label: "Team Lineup", icon: Users2 },
      { to: "/dashboard/tactical", label: "Tactical Lab", icon: Crosshair },
    ],
  },
  {
    label: "Club",
    items: [
      { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
      { to: "/dashboard/content", label: "Website", icon: Globe },
      { to: "/dashboard/gallery", label: "Gallery", icon: ImageIcon },
      { to: "/dashboard/achievements", label: "Achievements", icon: Award },
      { to: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
] as const;

export function DashboardLayout({ title, children }: { title?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const SidebarBody = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-4">
        <Link
          to="/dashboard"
          onClick={() => setOpen(false)}
          className="flex items-center justify-between gap-3"
        >
          <YMLogo showWordmark />
          <span className="machine-badge">
            COMMAND
          </span>
        </Link>
        <div className="machine-card mt-4 p-3">
          <div className="machine-section-label">Readiness</div>
          <div className="mt-2 flex items-end justify-between">
            <span className="metric-nums text-2xl font-black text-silver">87%</span>
            <span className="text-[11px] text-silver-muted">KL Open block</span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-white/10">
            <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-silver-muted via-silver to-cyan" />
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="px-3 pb-2 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-silver-muted/80">
              {g.label}
            </div>
            <ul className="space-y-1">
              {g.items.map((item) => {
                const exact = "exact" in item && item.exact;
                const active = exact
                  ? path === item.to
                  : path === item.to || path.startsWith(item.to + "/");
                const Icon = item.icon;

                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-bold",
                        active
                          ? "border-white/15 bg-white/[0.065] text-foreground shadow-inner"
                          : "border-transparent text-silver-muted hover:border-white/10 hover:bg-white/[0.045] hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
                          active ? "border-cyan/30 bg-cyan/10 text-cyan" : "border-white/10 bg-white/[0.03]",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            active ? "text-cyan" : "text-silver-muted group-hover:text-foreground",
                          )}
                        />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="machine-card p-3">
          <div className="flex items-center gap-3">
            <PlayerAvatar name={currentUser?.name ?? "Capang"} hue={200} size={38} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{currentUser?.name ?? "Capang"}</div>
              <div className="text-[11px] text-silver-muted">{currentUser?.role === "manager" ? "Team Manager" : "Head Coach"}</div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.035] py-2 text-xs font-bold text-silver hover:border-destructive/40 hover:text-destructive"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="machine-grid-bg min-h-[100dvh] text-foreground">
      <aside className="fixed inset-y-4 left-4 z-30 hidden w-[17.5rem] overflow-hidden rounded-[1.25rem] border border-white/10 bg-sidebar/95 shadow-[0_24px_90px_-62px_black] lg:flex">
        {SidebarBody}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/72 backdrop-blur-md"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute inset-y-3 left-3 w-[min(21rem,calc(100vw-1.5rem))] overflow-hidden rounded-[1.25rem] border border-white/10 bg-sidebar shadow-2xl">
            <button
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-silver"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
            {SidebarBody}
          </aside>
        </div>
      )}

      <div className="lg:pl-[19.5rem]">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#030303]/82 backdrop-blur-xl">
          <div className="ym-container flex min-h-20 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.045] lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <div className="machine-section-label">Machine command center</div>
                <h1 className="truncate text-xl font-black sm:text-2xl">{title ?? "Dashboard"}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <label className="machine-input hidden w-72 items-center gap-2 px-3 py-2.5 md:flex">
                <Search className="h-4 w-4 text-silver-muted" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-silver-muted"
                  placeholder="Search roster, drills, matches"
                />
              </label>
              <Link
                to="/dashboard/training/create"
                className="hidden items-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-2.5 text-sm font-black text-cyan sm:inline-flex"
              >
                <Plus className="h-4 w-4" />
                <span>New session</span>
              </Link>
              <button
                className="relative grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.045]"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-cyan shadow-[0_0_14px_var(--cyan)]" />
              </button>
              <div className="hidden sm:block">
                <PlayerAvatar name={currentUser?.name ?? "Capang"} hue={200} size={40} />
              </div>
            </div>
          </div>
        </header>

        <main className="ym-container px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:py-8">{children}</main>

        <Link
          to="/dashboard/training/create"
          className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-xl border border-cyan/30 bg-cyan/15 text-cyan glow-cyan lg:hidden"
          aria-label="Create new item"
        >
          <Plus className="h-6 w-6" />
        </Link>
      </div>
    </div>
  );
}
