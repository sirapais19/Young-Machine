import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PlayerLayout } from "@/components/layout/PlayerLayout";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { LogOut, Settings, Bell, Activity, HeartPulse, Trophy, ClipboardCheck } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/player/profile")({
  head: () => ({ meta: [{ title: "Profile | YM" }, { name: "robots", content: "noindex" }] }),
  component: PlayerProfilePage,
});

function PlayerProfilePage() {
  const { data } = useAppData();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const player = data.players.find((item) => item.id === currentUser?.playerId) ?? data.players[0];

  return (
    <PlayerLayout title="Profile">
      <div className="panel relative overflow-hidden p-5">
        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan/20 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <PlayerAvatar name={player.name} hue={player.avatarHue} size={72} />
          <div className="min-w-0">
            <div className="text-xl font-black">{player.name}</div>
            <div className="text-xs text-silver-muted">{player.email}</div>
            <div className="mt-2 flex gap-2">
              <StatusBadge tone="cyan">#{player.jersey}</StatusBadge>
              <StatusBadge tone="silver">{player.position}</StatusBadge>
            </div>
          </div>
        </div>
        <div className="relative mt-5 grid grid-cols-3 gap-3 text-center">
          <Metric label="Height" value={player.height ?? "-"} />
          <Metric label="Weight" value={player.weight ?? "-"} />
          <Metric label="Hand" value={player.hand ?? "-"} />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <MenuItem to="/player/attendance" icon={ClipboardCheck} label="My Attendance" />
        <MenuItem to="/player/submissions" icon={Activity} label="My Submissions" />
        <MenuItem to="/player/tournaments" icon={Trophy} label="My Tournaments" />
        <MenuItem to="/player/fitness" icon={Activity} label="Fitness Record" />
        <MenuItem to="/player/injury" icon={HeartPulse} label="Injury Status" />
        <MenuItem to="/player/notifications" icon={Bell} label="Notifications" />
        <MenuItem to="/player/settings" icon={Settings} label="Settings" />
      </div>

      <button
        onClick={() => {
          logout();
          navigate({ to: "/login" });
        }}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 py-3 text-sm font-bold text-destructive"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </PlayerLayout>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-silver-muted">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}

function MenuItem({ to, icon: Icon, label }: { to: string; icon: typeof Activity; label: string }) {
  return (
    <Link to={to} className="panel flex items-center gap-3 p-3.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl border border-cyan/25 bg-cyan/10 text-cyan">
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1 text-sm font-bold">{label}</span>
      <span className="text-silver-muted">›</span>
    </Link>
  );
}
