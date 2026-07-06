import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { Search, Plus, Eye, Edit } from "lucide-react";
import { players } from "@/data/mockData";

export const Route = createFileRoute("/dashboard/players")({
  head: () => ({ meta: [{ title: "Players · YM" }, { name: "robots", content: "noindex" }]}),
  component: PlayersMgmt,
});

function PlayersMgmt() {
  const [q, setQ] = useState("");
  const filtered = players.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <DashboardLayout title="Players">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-5">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 w-full sm:max-w-sm">
          <Search className="h-4 w-4 text-silver-muted" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search players…" className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-silver-muted" />
        </div>
        <button className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground glow-cyan">
          <Plus className="h-4 w-4" /> Add Player
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block panel overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-[11px] uppercase tracking-widest text-silver-muted">
              <th className="p-4 text-left">Player</th>
              <th className="p-4 text-left">Jersey</th>
              <th className="p-4 text-left">Position</th>
              <th className="p-4 text-left">Attendance</th>
              <th className="p-4 text-left">Score</th>
              <th className="p-4 text-left">Assist</th>
              <th className="p-4 text-left">Injury</th>
              <th className="p-4 text-left">Public</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar name={p.name} hue={p.avatarHue} size={36} />
                    <div><div className="font-semibold">{p.name}</div><div className="text-xs text-silver-muted">{p.email}</div></div>
                  </div>
                </td>
                <td className="p-4">#{p.jersey}</td>
                <td className="p-4">{p.position}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 rounded-full bg-white/5"><div className="h-full rounded-full bg-cyan" style={{ width: `${p.attendance}%` }} /></div>
                    <span className="text-xs">{p.attendance}%</span>
                  </div>
                </td>
                <td className="p-4 font-semibold">{p.score}</td>
                <td className="p-4">{p.assist}</td>
                <td className="p-4">{p.injury ? <StatusBadge tone={p.injury === "Active" ? "red" : "amber"}>{p.injury}</StatusBadge> : <span className="text-xs text-silver-muted">—</span>}</td>
                <td className="p-4">{p.isPublic ? <StatusBadge tone="green">Yes</StatusBadge> : <StatusBadge tone="silver">No</StatusBadge>}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-1">
                    <button className="grid h-8 w-8 place-items-center rounded-md border border-white/10 hover:border-cyan/40"><Eye className="h-4 w-4" /></button>
                    <button className="grid h-8 w-8 place-items-center rounded-md border border-white/10 hover:border-cyan/40"><Edit className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden grid gap-3">
        {filtered.map((p) => (
          <div key={p.id} className="panel p-4">
            <div className="flex items-center gap-3">
              <PlayerAvatar name={p.name} hue={p.avatarHue} size={48} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold truncate">{p.name}</div>
                  <div className="text-cyan font-bold">#{p.jersey}</div>
                </div>
                <div className="text-xs text-silver-muted">{p.position} · {p.email}</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center border-t border-white/5 pt-3">
              <div><div className="text-sm font-bold">{p.attendance}%</div><div className="text-[10px] text-silver-muted">ATT</div></div>
              <div><div className="text-sm font-bold">{p.score}</div><div className="text-[10px] text-silver-muted">SCR</div></div>
              <div><div className="text-sm font-bold">{p.assist}</div><div className="text-[10px] text-silver-muted">AST</div></div>
              <div><div className="text-sm font-bold">{p.blocks}</div><div className="text-[10px] text-silver-muted">BLK</div></div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              {p.injury ? <StatusBadge tone={p.injury === "Active" ? "red" : "amber"}>{p.injury}</StatusBadge> : <StatusBadge tone="green">Healthy</StatusBadge>}
              <button className="rounded-md border border-cyan/30 bg-cyan/10 text-cyan px-3 py-1.5 text-xs font-semibold">View</button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
