import { createFileRoute, Link } from "@tanstack/react-router";
import { PlayerLayout } from "@/components/layout/PlayerLayout";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { CalendarDays, Clock, MapPin, Check, X, Circle, Upload, Trophy, TrendingUp, Zap, ArrowUpRight } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import type { AttendanceStatus } from "@/types/app";

export const Route = createFileRoute("/player/dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard | YM" }, { name: "robots", content: "noindex" }] }),
  component: PlayerDashboard,
});

function PlayerDashboard() {
  const { data, submitAttendance, submitWorkoutTask } = useAppData();
  const { currentUser } = useAuth();
  const player = data.players.find((item) => item.id === currentUser?.playerId) ?? data.players[0];
  const next = data.trainingSessions.find((training) => training.status === "Upcoming") ?? data.trainingSessions[0];
  const assignment = data.workoutAssignments.find((item) => item.playerId === player?.id);
  const plan = data.workoutPlans.find((item) => item.id === assignment?.planId);
  const tasks = data.workoutTasks.filter((task) => task.planId === plan?.id);
  const today = tasks[0];
  const doneCount = data.workoutSubmissions.filter((submission) => submission.playerId === player?.id && submission.planId === plan?.id && submission.status === "done").length;
  const pct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
  const nextTournamentRow = data.tournamentPlayers.find((row) => row.playerId === player?.id);
  const nextTournament = data.tournaments.find((item) => item.id === nextTournamentRow?.tournamentId) ?? data.tournaments.find((item) => item.status === "Upcoming");
  const notifications = data.notifications.filter((note) => note.targetRole === "all" || note.targetRole === "player");

  if (!player) return <PlayerLayout title="Home"><div className="panel p-5 text-silver-muted">No player profile found.</div></PlayerLayout>;

  return (
    <PlayerLayout title="Home">
      <section className="panel-shell motion-rise">
        <div className="panel-core relative overflow-hidden p-5">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan/10 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <PlayerAvatar name={player.name} hue={player.avatarHue} size={62} />
            <div className="min-w-0 flex-1">
              <div className="machine-section-label">#{player.jersey} | {player.position}</div>
              <div className="truncate text-2xl font-black">Ready, {player.name}</div>
              <div className="mt-1 text-xs text-silver-muted">Personal machine interface</div>
            </div>
          </div>
          <div className="relative mt-5 grid grid-cols-3 gap-2">
            <HeroStat label="Week" value={`${pct}%`} />
            <HeroStat label="Score" value={String(player.score)} />
            <HeroStat label="Attend" value={`${player.attendance}%`} />
          </div>
        </div>
      </section>

      {next && (
        <>
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
              <AttendBtn tone="green" icon={Check} label="Going" onClick={() => submitAttendance(next.id, player.id, "Going")} />
              <AttendBtn tone="amber" icon={Circle} label="Maybe" onClick={() => submitAttendance(next.id, player.id, "Maybe")} />
              <AttendBtn tone="red" icon={X} label="Out" onClick={() => submitAttendance(next.id, player.id, "Out")} />
            </div>
          </section>
        </>
      )}

      {plan && today && (
        <>
          <SectionTitle right={<span className="metric-nums font-black text-cyan">{pct}%</span>}>Today's workout</SectionTitle>
          <section className="panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold text-cyan">{today.day} | {today.type}</div>
                <div className="mt-1 text-xl font-black">{today.title}</div>
                <p className="mt-2 text-sm leading-6 text-silver-muted">{today.description}</p>
              </div>
              <StatusBadge tone="silver">{plan.status}</StatusBadge>
            </div>
            <div className="mt-5 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan shadow-[0_0_18px_var(--cyan)]" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 text-xs text-silver-muted">Week progress | {doneCount} of {tasks.length}</div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => submitWorkoutTask({ taskId: today.id, planId: plan.id, playerId: player.id, status: "done", note: "Completed from player dashboard." })} className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 py-3 text-sm font-black text-cyan glow-cyan">
                <Check className="h-4 w-4" />
                Mark done
              </button>
              <label className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.045] py-3 text-sm font-bold">
                <Upload className="h-4 w-4" />
                Upload proof
                <input className="hidden" type="file" onChange={(event) => submitWorkoutTask({ taskId: today.id, planId: plan.id, playerId: player.id, status: "done", proofName: event.target.files?.[0]?.name, note: "Proof uploaded from dashboard." })} />
              </label>
            </div>
          </section>
        </>
      )}

      <SectionTitle>Personal stats</SectionTitle>
      <section className="grid grid-cols-2 gap-3">
        <MiniStat label="Score" value={String(player.score)} tone="cyan" icon={Zap} />
        <MiniStat label="Assists" value={String(player.assist)} tone="silver" icon={TrendingUp} />
        <MiniStat label="Blocks" value={String(player.blocks)} tone="silver" icon={Trophy} />
        <MiniStat label="Attendance" value={`${player.attendance}%`} tone="cyan" icon={Check} />
      </section>

      {nextTournament && (
        <>
          <SectionTitle>Upcoming tournament</SectionTitle>
          <section className="panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-black">{nextTournament.name}</div>
                <div className="mt-1 text-xs text-silver-muted">{nextTournament.location} | {nextTournament.start}</div>
              </div>
              <StatusBadge tone="cyan">Selected</StatusBadge>
            </div>
          </section>
        </>
      )}

      <SectionTitle right={<Link to="/player/notifications" className="inline-flex items-center gap-1 text-xs font-bold text-cyan">See all <ArrowUpRight className="h-3.5 w-3.5" /></Link>}>Notifications</SectionTitle>
      <section className="space-y-2">
        {notifications.slice(0, 3).map((note) => (
          <article key={note.id} className="panel p-3">
            <div className="flex gap-3">
              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan shadow-[0_0_12px_var(--cyan)]" />
              <div>
                <div className="text-sm font-bold">{note.title}</div>
                <div className="mt-1 text-xs leading-5 text-silver-muted">{note.body} | {note.time}</div>
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
      <h2 className="machine-section-label">{children}</h2>
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

function AttendBtn({ tone, icon: Icon, label, onClick }: { tone: "green" | "amber" | "red"; icon: typeof Check; label: AttendanceStatus; onClick: () => void }) {
  const toneClass = {
    green: "border-success/30 bg-success/10 text-success",
    amber: "border-warning/30 bg-warning/10 text-warning",
    red: "border-destructive/30 bg-destructive/10 text-destructive",
  }[tone];

  return (
    <button onClick={onClick} className={`inline-flex items-center justify-center gap-1.5 rounded-xl border py-3 text-sm font-bold ${toneClass}`}>
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function MiniStat({ label, value, tone, icon: Icon }: { label: string; value: string; tone: "cyan" | "silver"; icon: typeof Zap }) {
  return (
    <article className="panel panel-hover p-4">
      <div className="flex items-center justify-between gap-3">
      <div className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-silver-muted">{label}</div>
        <Icon className={`h-4 w-4 ${tone === "cyan" ? "text-cyan" : "text-silver-muted"}`} />
      </div>
      <div className="metric-nums mt-2 text-3xl font-black">{value}</div>
    </article>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="machine-card p-3 text-center">
      <div className="metric-nums text-lg font-black">{value}</div>
      <div className="font-mono text-[10px] font-semibold text-silver-muted">{label}</div>
    </div>
  );
}
