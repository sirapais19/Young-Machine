import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, CalendarDays, ClipboardCheck, Dumbbell, ClipboardList,
  Trophy, Users2, BarChart3, Activity, HeartPulse, Bell, Globe, Image as ImageIcon,
  Award, Settings, Menu, X, Search, Plus,
} from "lucide-react";
import { YMLogo } from "@/components/ym/Logo";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Team",
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

  const SidebarBody = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5 border-b border-white/5">
        <Link to="/dashboard" onClick={() => setOpen(false)}>
          <YMLogo showWordmark />
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-silver-muted/70">
              {g.label}
            </div>
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active = item.exact ? path === item.to : path.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        active
                          ? "bg-cyan/10 text-cyan border border-cyan/25"
                          : "text-silver hover:bg-white/5 hover:text-foreground border border-transparent"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-cyan" : "text-silver-muted group-hover:text-foreground")} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/5 p-4">
        <div className="flex items-center gap-3">
          <PlayerAvatar name="Capang" hue={200} size={36} />
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">Capang</div>
            <div className="text-[11px] text-silver-muted">Head Coach</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 border-r border-white/5 bg-sidebar z-30">
        {SidebarBody}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-sidebar border-r border-white/10">
            {SidebarBody}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 border-b border-white/5 bg-background/80 backdrop-blur-xl">
          <div className="flex h-full items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <button
                className="lg:hidden grid h-10 w-10 place-items-center rounded-md border border-white/10"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.2em] text-silver-muted">Young Machine</div>
                <h1 className="truncate text-lg font-bold sm:text-xl">{title ?? "Dashboard"}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 w-64">
                <Search className="h-4 w-4 text-silver-muted" />
                <input className="bg-transparent text-sm outline-none placeholder:text-silver-muted flex-1" placeholder="Search…" />
              </div>
              <button className="grid h-10 w-10 place-items-center rounded-md border border-white/10 relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-cyan" />
              </button>
              <div className="hidden sm:block">
                <PlayerAvatar name="Capang" hue={200} size={36} />
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">{children}</main>

        {/* Mobile floating quick action */}
        <button className="lg:hidden fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground glow-cyan">
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
