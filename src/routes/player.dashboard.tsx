import { createFileRoute, Link } from "@tanstack/react-router";
import { PlayerLayout } from "@/components/layout/PlayerLayout";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { StatusBadge } from "@/components/ym/StatusBadge";
import {
  CalendarDays,
  Clock,
  MapPin,
  Check,
  X,
  Circle,
  Upload,
  Trophy,
  TrendingUp,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { currentUser, trainings, workoutPlan, tournaments, notifications } from "@/data/mockData";

export const Route = createFileRoute("/player/dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard | YM" }, { name: "robots", content: "noindex" }] }),
  component: PlayerDashboard,
});

function PlayerDashboard() {
  const next = trainings.find((t) => t.status === "Upcoming")!;
  const today = workoutPlan.tasks[1];
  const nextTournament = tournaments.find((t) => t.status === "Upcoming")!;
  const doneCount = workoutPlan.tasks.filter((t) => t.done).length;
  const pct = Math.round((doneCount / workoutPlan.tasks.length) * 100);

  return (
    <PlayerLayout title="Home">
      <section className="panel-shell motion-rise">
        <div className="panel-core relative overflow-hidden p-5">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan/20 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <PlayerAvatar name={currentUser.name} hue={205} size={62} />
            <div className="min-w-0 flex-1">
              <div className="metric-nums text-[11px] font-semibold text-cyan">
                #{currentUser.jersey} | {currentUser.position}
              </div>
              <div className="truncate text-2xl font-black">Ready, {currentUser.name}</div>
              <div className="mt-1 text-xs text-silver-muted">
                Season 2026 | Training block week 3
              </div>
            </div>
          </div>

          <div className="relative mt-5 grid grid-cols-3 gap-2">
            <HeroStat label="Week" value={`${pct}%`} />
            <HeroStat label="Score" value="48" />
            <HeroStat label="Attend" value="92%" />
          </div>
        </div>
      </section>

      <SectionTitle>Next training</SectionTitle>
      <section className="panel p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xl font-black">{next.title}</div>
            <div className="mt-3 space-y-2 text-sm text-silver-muted">
              <InfoLine icon={CalendarDays} text={next.date} />
              <InfoLine icon={Clock} text={`${next.start} to ${next.end}`} />
              <InfoLine icon={MapPin} text={next.location} />
            </div>
          </div>
          <StatusBadge tone="cyan">{next.status}</StatusBadge>
        </div>
        {next.note && <p className="mt-4 text-sm leading-6 text-silver">{next.note}</p>}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <AttendBtn tone="green" icon={Check} label="Attend" />
          <AttendBtn tone="amber" icon={Circle} label="Maybe" />
          <AttendBtn tone="red" icon={X} label="Skip" />
        </div>
      </section>

      <SectionTitle right={<span className="metric-nums font-black text-cyan">{pct}%</span>}>
        Today's workout
      </SectionTitle>
      <section className="panel p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold text-cyan">
              {today.day} | {today.type}
            </div>
            <div className="mt-1 text-xl font-black">{today.title}</div>
            <p className="mt-2 text-sm leading-6 text-silver-muted">{today.description}</p>
          </div>
          {today.done && <StatusBadge tone="green">Done</StatusBadge>}
        </div>
        <div className="mt-5 h-2 rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-cyan shadow-[0_0_18px_var(--cyan)]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-silver-muted">
          Week progress | {doneCount} of {workoutPlan.tasks.length}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground glow-cyan">
            <Check className="h-4 w-4" />
            Mark done
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.045] py-3 text-sm font-bold">
            <Upload className="h-4 w-4" />
            Upload proof
          </button>
        </div>
      </section>

      <SectionTitle>Personal stats</SectionTitle>
      <section className="grid grid-cols-2 gap-3">
        <MiniStat label="Score" value="48" tone="cyan" icon={Zap} />
        <MiniStat label="Assists" value="22" tone="silver" icon={TrendingUp} />
        <MiniStat label="Blocks" value="9" tone="silver" icon={Trophy} />
        <MiniStat label="Attendance" value="92%" tone="cyan" icon={Check} />
      </section>

      <SectionTitle>Upcoming tournament</SectionTitle>
      <section className="panel p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xl font-black">{nextTournament.name}</div>
            <div className="mt-1 text-xs text-silver-muted">
              {nextTournament.location} | {nextTournament.start}
            </div>
          </div>
          <StatusBadge tone="cyan">Selected</StatusBadge>
        </div>
      </section>

      <SectionTitle
        right={
          <Link
            to="/player/notifications"
            className="inline-flex items-center gap-1 text-xs font-bold text-cyan"
          >
            See all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        Notifications
      </SectionTitle>
      <section className="space-y-2">
        {notifications.slice(0, 3).map((n) => (
          <article key={n.id} className="panel p-3">
            <div className="flex gap-3">
              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan shadow-[0_0_12px_var(--cyan)]" />
              <div>
                <div className="text-sm font-bold">{n.title}</div>
                <div className="mt-1 text-xs leading-5 text-silver-muted">
                  {n.body} | {n.time}
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </PlayerLayout>
  );
}

function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-3 mt-7 flex items-center justify-between">
      <h2 className="text-sm font-black text-foreground">{children}</h2>
      {right}
    </div>
  );
}

function InfoLine({ icon: Icon, text }: { icon: typeof CalendarDays; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-cyan" />
      {text}
    </div>
  );
}

function AttendBtn({
  tone,
  icon: Icon,
  label,
}: {
  tone: "green" | "amber" | "red";
  icon: typeof Check;
  label: string;
}) {
  const toneClass = {
    green: "border-success/30 bg-success/10 text-success",
    amber: "border-warning/30 bg-warning/10 text-warning",
    red: "border-destructive/30 bg-destructive/10 text-destructive",
  }[tone];

  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-2xl border py-3 text-sm font-bold ${toneClass}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function MiniStat({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone: "cyan" | "silver";
  icon: typeof Zap;
}) {
  return (
    <article className="panel panel-hover p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-semibold text-silver-muted">{label}</div>
        <Icon className={`h-4 w-4 ${tone === "cyan" ? "text-cyan" : "text-silver-muted"}`} />
      </div>
      <div className="metric-nums mt-2 text-3xl font-black">{value}</div>
    </article>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/24 p-3 text-center">
      <div className="metric-nums text-lg font-black">{value}</div>
      <div className="text-[10px] font-semibold text-silver-muted">{label}</div>
    </div>
  );
}
