import { createFileRoute, Link } from "@tanstack/react-router";
import { PlayerLayout } from "@/components/layout/PlayerLayout";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { LogOut, Settings, Bell, Activity, HeartPulse, Trophy, ClipboardCheck } from "lucide-react";
import { players, currentUser } from "@/data/mockData";

export const Route = createFileRoute("/player/profile")({
  head: () => ({ meta: [{ title: "Profile · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => {
    const p = players[0];
    return (
      <PlayerLayout title="Profile">
        <div className="panel p-5 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-cyan/20 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <PlayerAvatar name={p.name} hue={p.avatarHue} size={72} />
            <div className="min-w-0">
              <div className="text-xl font-bold">{p.name}</div>
              <div className="text-xs text-silver-muted">{currentUser.email}</div>
              <div className="mt-2 flex gap-2">
                <StatusBadge tone="cyan">#{p.jersey}</StatusBadge>
                <StatusBadge tone="silver">{p.position}</StatusBadge>
              </div>
            </div>
          </div>
          <div className="relative mt-5 grid grid-cols-3 gap-3 text-center">
            <div><div className="text-xs text-silver-muted">Height</div><div className="font-semibold">{p.height}</div></div>
            <div><div className="text-xs text-silver-muted">Weight</div><div className="font-semibold">{p.weight}</div></div>
            <div><div className="text-xs text-silver-muted">Hand</div><div className="font-semibold">{p.hand}</div></div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <MenuItem to="/player/attendance" icon={ClipboardCheck} label="My Attendance" />
          <MenuItem to="/player/submissions" icon={Activity}     label="My Submissions" />
          <MenuItem to="/player/tournaments" icon={Trophy}        label="My Tournaments" />
          <MenuItem to="/player/fitness"     icon={Activity}      label="Fitness Record" />
          <MenuItem to="/player/injury"      icon={HeartPulse}    label="Injury Status" />
          <MenuItem to="/player/notifications" icon={Bell}         label="Notifications" />
          <MenuItem to="/player/settings"    icon={Settings}      label="Settings" />
        </div>

        <Link to="/login" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive py-3 text-sm font-semibold">
          <LogOut className="h-4 w-4" /> Sign out
        </Link>
      </PlayerLayout>
    );
  },
});

function MenuItem({ to, icon: Icon, label }: { to: any; icon: any; label: string }) {
  return (
    <Link to={to} className="panel p-3.5 flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-cyan/10 text-cyan border border-cyan/25"><Icon className="h-4 w-4" /></div>
      <span className="text-sm font-medium flex-1">{label}</span>
      <span className="text-silver-muted">›</span>
    </Link>
  );
}
