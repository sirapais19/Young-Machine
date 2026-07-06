import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ym/StatCard";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { Users, CalendarDays, Percent, Trophy, HeartPulse, Dumbbell, Plus, ClipboardList } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, BarChart, Bar, YAxis } from "recharts";
import { attendanceTrend, players, trainings, notifications, workoutPlan } from "@/data/mockData";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard · YM Coach" }, { name: "robots", content: "noindex" }]}),
  component: CoachDashboard,
});

function CoachDashboard() {
  const topScorers = [...players].sort((a, b) => b.score - a.score).slice(0, 5);
  const upcoming = trainings.filter(t => t.status === "Upcoming");

  return (
    <DashboardLayout title="Overview">
      {/* Quick actions (mobile) */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 lg:hidden">
        {[
          { label: "Create Training", icon: CalendarDays },
          { label: "Assign Workout", icon: Dumbbell },
          { label: "Add Tournament", icon: Trophy },
          { label: "Add Stats", icon: ClipboardList },
        ].map((a) => (
          <button key={a.label} className="panel panel-hover p-3 text-left">
            <a.icon className="h-5 w-5 text-cyan" />
            <div className="mt-2 text-xs font-medium">{a.label}</div>
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Players" value={players.length} icon={Users} />
        <StatCard label="Upcoming Trainings" value={upcoming.length} icon={CalendarDays} />
        <StatCard label="Attendance" value="87%" hint="Last 30 days" icon={Percent} tone="green" />
        <StatCard label="Next Tournament" value="Aug 15" hint="KL Open 2026" icon={Trophy} />
        <StatCard label="Active Injuries" value={players.filter(p=>p.injury==="Active").length} icon={HeartPulse} tone="red" />
        <StatCard label="Workout Done" value="72%" hint="This week" icon={Dumbbell} tone="cyan" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-silver-muted">Team Attendance</div>
              <div className="text-lg font-semibold">Last 7 weeks</div>
            </div>
            <StatusBadge tone="green">+9% MoM</StatusBadge>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend}>
                <defs>
                  <linearGradient id="ac" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" stroke="var(--silver-muted)" tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="pct" stroke="var(--cyan)" strokeWidth={2} fill="url(#ac)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5">
          <div className="text-xs uppercase tracking-widest text-silver-muted">Top Scorers</div>
          <div className="text-lg font-semibold">Season 2026</div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topScorers.map(p => ({ name: p.name, score: p.score }))} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="var(--silver-muted)" tickLine={false} axisLine={false} fontSize={11} width={60} />
                <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="score" fill="var(--cyan)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Upcoming trainings + Activity */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-silver-muted">Upcoming</div>
              <div className="text-lg font-semibold">Training sessions</div>
            </div>
            <button className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
              <Plus className="h-3.5 w-3.5" /> New
            </button>
          </div>
          <div className="space-y-3">
            {upcoming.map((t) => (
              <div key={t.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-lg bg-cyan/10 border border-cyan/25 text-cyan shrink-0">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{t.title}</div>
                  <div className="text-xs text-silver-muted">{t.date} · {t.start}–{t.end} · {t.location}</div>
                </div>
                <div className="flex gap-2 text-[11px]">
                  <span className="rounded-md bg-success/10 text-success px-2 py-1 border border-success/25">{t.attendance?.going} in</span>
                  <span className="rounded-md bg-warning/10 text-warning px-2 py-1 border border-warning/25">{t.attendance?.maybe} maybe</span>
                  <span className="rounded-md bg-destructive/10 text-destructive px-2 py-1 border border-destructive/25">{t.attendance?.out} out</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <div className="text-xs uppercase tracking-widest text-silver-muted">Activity</div>
          <div className="text-lg font-semibold">Latest updates</div>
          <ul className="mt-4 space-y-3">
            {notifications.map((n) => (
              <li key={n.id} className="flex gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-cyan shrink-0" />
                <div>
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-xs text-silver-muted">{n.body} · {n.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Workout completion */}
      <div className="mt-6 panel p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-silver-muted">Workout plan</div>
            <div className="text-lg font-semibold">{workoutPlan.title}</div>
          </div>
          <StatusBadge tone="cyan">{workoutPlan.status}</StatusBadge>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {workoutPlan.tasks.map((t) => (
            <div key={t.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="text-[10px] uppercase tracking-widest text-cyan">{t.day} · {t.type}</div>
              <div className="mt-1 text-sm font-semibold truncate">{t.title}</div>
              <div className="mt-3 h-1.5 rounded-full bg-white/5">
                <div className="h-full rounded-full bg-cyan" style={{ width: t.done ? "100%" : "35%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Players preview */}
      <div className="mt-6 panel p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">Roster snapshot</div>
          <a href="/dashboard/players" className="text-xs text-cyan hover:underline">View all</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {players.slice(0, 6).map((p) => (
            <div key={p.id} className="rounded-lg border border-white/10 p-3 text-center">
              <PlayerAvatar name={p.name} hue={p.avatarHue} size={44} className="mx-auto" />
              <div className="mt-2 text-sm font-semibold truncate">{p.name}</div>
              <div className="text-[10px] uppercase text-silver-muted">#{p.jersey} · {p.position}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
