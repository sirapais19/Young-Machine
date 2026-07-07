import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ym/StatCard";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { StatusBadge } from "@/components/ym/StatusBadge";
import {
  Users,
  CalendarDays,
  Percent,
  Trophy,
  HeartPulse,
  Dumbbell,
  Plus,
  ClipboardList,
  ArrowUpRight,
  Timer,
  Target,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
  YAxis,
} from "recharts";
import { useAppData } from "@/hooks/useAppData";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [{ title: "Dashboard | YM Coach" }, { name: "robots", content: "noindex" }],
  }),
  component: CoachDashboard,
});

function CoachDashboard() {
  const { data } = useAppData();
  const { players, notifications } = data;
  const workoutPlan = data.workoutPlans[0];
  const workoutTasks = data.workoutTasks.filter((task) => task.planId === workoutPlan?.id);
  const topScorers = [...players].sort((a, b) => b.score - a.score).slice(0, 5);
  const upcoming = data.trainingSessions.filter((t) => t.status === "Upcoming");
  const activeInjuries = players.filter((p) => p.injury === "Active").length;
  const attendanceTrend = data.trainingSessions.slice(0, 7).map((training, index) => {
    const records = data.attendanceRecords.filter((record) => record.trainingId === training.id);
    const going = records.filter((record) => record.response === "Going" || record.coachStatus === "Attended").length;
    return { week: `S${index + 1}`, pct: records.length ? Math.round((going / records.length) * 100) : 0 };
  });

  return (
    <DashboardLayout title="Overview">
      <section className="motion-rise grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="panel-shell">
          <div className="panel-core relative min-h-[21rem] overflow-hidden p-5 sm:p-7">
            <div className="absolute inset-0 scanlines opacity-40" />
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan/18 blur-3xl" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-8">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex rounded-lg border border-cyan/25 bg-cyan/10 px-3 py-1 text-[11px] font-semibold text-cyan">
                  Season control room
                </div>
                <h2 className="max-w-3xl text-4xl font-black leading-[1.02] text-foreground sm:text-5xl lg:text-6xl">
                  Keep the roster fit, selected, and match ready.
                </h2>
                <p className="mt-4 max-w-[58ch] text-sm leading-6 text-silver-muted sm:text-base">
                  Track training attendance, player load, injuries, tournaments, and weekly work
                  blocks from one focused command view.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <HeroMetric
                  label="Ready players"
                  value={`${players.length - activeInjuries}/${players.length}`}
                />
                <HeroMetric label="Next session" value={upcoming[0]?.date ?? "TBC"} />
                <HeroMetric label="Week load" value="72%" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {[
            { label: "Create Training", icon: CalendarDays, to: "/dashboard/training/create" },
            { label: "Assign Workout", icon: Dumbbell, to: "/dashboard/workouts/create" },
            { label: "Add Tournament", icon: Trophy, to: "/dashboard/tournaments/create" },
          ].map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="panel group flex min-h-24 items-center justify-between p-4 text-left"
            >
              <span>
                <a.icon className="h-5 w-5 text-cyan" />
                <span className="mt-3 block text-sm font-bold">{a.label}</span>
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.045] text-silver-muted group-hover:border-cyan/30 group-hover:text-cyan">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total players" value={players.length} icon={Users} />
        <StatCard label="Upcoming sessions" value={upcoming.length} icon={CalendarDays} />
        <StatCard label="Attendance" value="87%" hint="Last 30 days" icon={Percent} tone="green" />
        <StatCard label="Next tournament" value="Aug 15" hint="KL Open 2026" icon={Trophy} />
        <StatCard label="Active injuries" value={activeInjuries} icon={HeartPulse} tone="red" />
        <StatCard label="Workout done" value="72%" hint="This week" icon={Dumbbell} tone="cyan" />
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-xs font-semibold text-silver-muted">Team attendance</div>
              <div className="mt-1 text-xl font-black">Seven week trend</div>
            </div>
            <StatusBadge tone="green">+9% MoM</StatusBadge>
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend}>
                <defs>
                  <linearGradient id="attendanceCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.48} />
                    <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="week"
                  stroke="var(--silver-muted)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--foreground)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pct"
                  stroke="var(--cyan)"
                  strokeWidth={3}
                  fill="url(#attendanceCyan)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold text-silver-muted">Top scorers</div>
              <div className="mt-1 text-xl font-black">Season 2026</div>
            </div>
            <Target className="h-5 w-5 text-cyan" />
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topScorers.map((p) => ({ name: p.name, score: p.score }))}
                layout="vertical"
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="var(--silver-muted)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  width={64}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--foreground)",
                  }}
                />
                <Bar dataKey="score" fill="var(--cyan)" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold text-silver-muted">Upcoming</div>
              <div className="mt-1 text-xl font-black">Training sessions</div>
            </div>
            <Link
              to="/dashboard/training/create"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground glow-cyan"
            >
              <Plus className="h-4 w-4" />
              New session
            </Link>
          </div>

          <div className="space-y-3">
            {upcoming.map((t) => {
              const records = data.attendanceRecords.filter((record) => record.trainingId === t.id);
              return (
              <Link
                key={t.id}
                to="/dashboard/training/$trainingId"
                params={{ trainingId: t.id }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-cyan/25 bg-cyan/10 text-cyan">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold">{t.title}</div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-silver-muted">
                      <span>{t.date}</span>
                      <span>
                        {t.start} to {t.end}
                      </span>
                      <span>{t.location}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <MiniCount label="In" value={records.filter((record) => record.response === "Going").length} tone="text-success" />
                    <MiniCount label="Maybe" value={records.filter((record) => record.response === "Maybe").length} tone="text-warning" />
                    <MiniCount label="Out" value={records.filter((record) => record.response === "Out").length} tone="text-destructive" />
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        </div>

        <div className="panel p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold text-silver-muted">Activity</div>
              <div className="mt-1 text-xl font-black">Latest updates</div>
            </div>
            <Timer className="h-5 w-5 text-cyan" />
          </div>
          <ul className="mt-5 space-y-3">
            {notifications.map((n) => (
              <li key={n.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex gap-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan shadow-[0_0_12px_var(--cyan)]" />
                  <div>
                    <div className="text-sm font-bold">{n.title}</div>
                    <div className="mt-1 text-xs leading-5 text-silver-muted">
                      {n.body} | {n.time}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="panel p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-silver-muted">Workout plan</div>
              <div className="mt-1 text-xl font-black">{workoutPlan?.title ?? "No active plan"}</div>
            </div>
            <StatusBadge tone="cyan">{workoutPlan?.status ?? "Draft"}</StatusBadge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {workoutTasks.map((t) => (
              <article
                key={t.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
              >
                <div className="text-[10px] font-semibold text-cyan">
                  {t.day} | {t.type}
                </div>
                <div className="mt-1 truncate text-sm font-bold">{t.title}</div>
                <div className="mt-3 h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-cyan"
                    style={{ width: data.workoutSubmissions.some((submission) => submission.taskId === t.id) ? "100%" : "35%" }}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-silver-muted">Roster snapshot</div>
              <div className="mt-1 text-xl font-black">Active squad</div>
            </div>
            <Link
              to="/dashboard/players"
              className="inline-flex items-center gap-1 rounded-full border border-cyan/25 px-3 py-2 text-xs font-bold text-cyan"
            >
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {players.slice(0, 6).map((p) => (
              <article
                key={p.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center"
              >
                <PlayerAvatar name={p.name} hue={p.avatarHue} size={46} className="mx-auto" />
                <div className="mt-2 truncate text-sm font-bold">{p.name}</div>
                <div className="metric-nums text-[11px] text-silver-muted">
                  #{p.jersey} | {p.position}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="text-[10px] font-semibold text-silver-muted">{label}</div>
      <div className="metric-nums mt-2 text-2xl font-black text-foreground">{value}</div>
    </div>
  );
}

function MiniCount({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="min-w-16 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
      <div className={`metric-nums text-base font-black ${tone}`}>{value}</div>
      <div className="text-[10px] text-silver-muted">{label}</div>
    </div>
  );
}
