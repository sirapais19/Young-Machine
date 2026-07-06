import { createFileRoute, Link } from "@tanstack/react-router";
import { PlayerLayout } from "@/components/layout/PlayerLayout";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { CalendarDays, Clock, MapPin, Check, X, Circle, Upload, Trophy, TrendingUp, Zap } from "lucide-react";
import { currentUser, trainings, workoutPlan, tournaments, notifications } from "@/data/mockData";

export const Route = createFileRoute("/player/dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard · YM" }, { name: "robots", content: "noindex" }]}),
  component: PlayerDashboard,
});

function PlayerDashboard() {
  const next = trainings.find(t => t.status === "Upcoming")!;
  const today = workoutPlan.tasks[1]; // pretend today
  const nextTournament = tournaments.find(t => t.status === "Upcoming")!;
  const doneCount = workoutPlan.tasks.filter(t => t.done).length;
  const pct = Math.round((doneCount / workoutPlan.tasks.length) * 100);

  return (
    <PlayerLayout title="Home">
      {/* Welcome */}
      <div className="panel p-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-cyan/20 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <PlayerAvatar name={currentUser.name} hue={205} size={56} />
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-widest text-cyan">#{currentUser.jersey} · {currentUser.position}</div>
            <div className="text-xl font-bold truncate">Hey, {currentUser.name}</div>
            <div className="text-xs text-silver-muted">Season 2026 · Ready to move.</div>
          </div>
        </div>
      </div>

      {/* Next training */}
      <SectionTitle>Next Training</SectionTitle>
      <div className="panel p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">{next.title}</div>
            <div className="mt-2 space-y-1 text-sm text-silver-muted">
              <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-cyan" />{next.date}</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-cyan" />{next.start} – {next.end}</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan" />{next.location}</div>
            </div>
          </div>
          <StatusBadge tone="cyan">{next.status}</StatusBadge>
        </div>
        {next.note && <p className="mt-3 text-sm text-silver">{next.note}</p>}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <AttendBtn tone="green" icon={Check} label="Attend" />
          <AttendBtn tone="amber" icon={Circle} label="Maybe" />
          <AttendBtn tone="red" icon={X} label="Skip" />
        </div>
      </div>

      {/* Today's workout */}
      <SectionTitle right={<span className="text-cyan font-semibold">{pct}%</span>}>Today's Workout</SectionTitle>
      <div className="panel p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-cyan">{today.day} · {today.type}</div>
            <div className="mt-1 text-lg font-semibold">{today.title}</div>
            <p className="mt-2 text-sm text-silver-muted">{today.description}</p>
          </div>
          {today.done && <StatusBadge tone="green">Done</StatusBadge>}
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-white/5">
          <div className="h-full rounded-full bg-cyan" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 text-xs text-silver-muted">Week progress · {doneCount} of {workoutPlan.tasks.length}</div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground glow-cyan">
            <Check className="h-4 w-4" /> Mark done
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 py-3 text-sm font-semibold">
            <Upload className="h-4 w-4" /> Upload proof
          </button>
        </div>
      </div>

      {/* Personal stats */}
      <SectionTitle>Personal Stats</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <MiniStat label="Score" value="48" tone="cyan" icon={Zap} />
        <MiniStat label="Assists" value="22" tone="silver" icon={TrendingUp} />
        <MiniStat label="Blocks" value="9" tone="silver" icon={Trophy} />
        <MiniStat label="Attendance" value="92%" tone="cyan" icon={Check} />
      </div>

      {/* Upcoming tournament */}
      <SectionTitle>Upcoming Tournament</SectionTitle>
      <div className="panel p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-semibold">{nextTournament.name}</div>
            <div className="text-xs text-silver-muted">{nextTournament.location} · {nextTournament.start}</div>
          </div>
          <StatusBadge tone="cyan">Selected</StatusBadge>
        </div>
      </div>

      {/* Notifications */}
      <SectionTitle right={<Link to="/player/notifications" className="text-xs text-cyan">See all</Link>}>Notifications</SectionTitle>
      <div className="space-y-2">
        {notifications.slice(0, 3).map((n) => (
          <div key={n.id} className="panel p-3 flex gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-cyan shrink-0" />
            <div>
              <div className="text-sm font-medium">{n.title}</div>
              <div className="text-xs text-silver-muted">{n.body} · {n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </PlayerLayout>
  );
}

function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mt-6 mb-2 flex items-center justify-between">
      <h2 className="text-[11px] uppercase tracking-[0.2em] text-silver-muted">{children}</h2>
      {right}
    </div>
  );
}

function AttendBtn({ tone, icon: Icon, label }: { tone: "green" | "amber" | "red"; icon: any; label: string }) {
  const toneClass = {
    green: "border-success/30 bg-success/10 text-success",
    amber: "border-warning/30 bg-warning/10 text-warning",
    red:   "border-destructive/30 bg-destructive/10 text-destructive",
  }[tone];
  return (
    <button className={`inline-flex items-center justify-center gap-1.5 rounded-lg border py-3 text-sm font-semibold ${toneClass}`}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function MiniStat({ label, value, tone, icon: Icon }: { label: string; value: string; tone: "cyan" | "silver"; icon: any }) {
  return (
    <div className="panel panel-hover p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-widest text-silver-muted">{label}</div>
        <Icon className={`h-4 w-4 ${tone === "cyan" ? "text-cyan" : "text-silver-muted"}`} />
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
