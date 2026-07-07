import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { Search, Plus, Eye, Edit, SlidersHorizontal, Users } from "lucide-react";
import { players } from "@/data/mockData";

export const Route = createFileRoute("/dashboard/players")({
  head: () => ({ meta: [{ title: "Players | YM" }, { name: "robots", content: "noindex" }] }),
  component: PlayersMgmt,
});

function PlayersMgmt() {
  const [q, setQ] = useState("");
  const filtered = players.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  const healthy = players.filter((p) => !p.injury).length;

  return (
    <DashboardLayout title="Players">
      <section className="motion-rise mb-5 grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="panel p-5 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-cyan/25 bg-cyan/10 px-3 py-1 text-[11px] font-semibold text-cyan">
                <Users className="h-3.5 w-3.5" />
                Squad management
              </div>
              <h2 className="text-3xl font-black sm:text-4xl">
                Roster, availability, and public profiles.
              </h2>
              <p className="mt-3 max-w-[62ch] text-sm leading-6 text-silver-muted">
                Search players, spot load risk, and move quickly from attendance into match
                selection.
              </p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground glow-cyan">
              <Plus className="h-4 w-4" />
              Add player
            </button>
          </div>
        </div>

        <div className="panel grid grid-cols-3 gap-3 p-4">
          <RosterStat label="Total" value={players.length} />
          <RosterStat label="Ready" value={healthy} />
          <RosterStat label="Flagged" value={players.length - healthy} />
        </div>
      </section>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-3 sm:max-w-md">
          <Search className="h-4 w-4 text-silver-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search players"
            className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-silver-muted"
          />
        </label>
        <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-bold text-silver">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="hidden overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.025] md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.035] text-[11px] font-semibold text-silver-muted">
              <th className="p-4 text-left">Player</th>
              <th className="p-4 text-left">Kit</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Attendance</th>
              <th className="p-4 text-left">Score</th>
              <th className="p-4 text-left">Assist</th>
              <th className="p-4 text-left">Injury</th>
              <th className="p-4 text-left">Public</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="border-b border-white/10 last:border-0 hover:bg-white/[0.035]"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar name={p.name} hue={p.avatarHue} size={38} />
                    <div>
                      <div className="font-bold">{p.name}</div>
                      <div className="text-xs text-silver-muted">{p.email}</div>
                    </div>
                  </div>
                </td>
                <td className="metric-nums p-4 font-bold text-cyan">#{p.jersey}</td>
                <td className="p-4">{p.position}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-cyan"
                        style={{ width: `${p.attendance}%` }}
                      />
                    </div>
                    <span className="metric-nums text-xs">{p.attendance}%</span>
                  </div>
                </td>
                <td className="metric-nums p-4 font-bold">{p.score}</td>
                <td className="metric-nums p-4">{p.assist}</td>
                <td className="p-4">
                  {p.injury ? (
                    <StatusBadge tone={p.injury === "Active" ? "red" : "amber"}>
                      {p.injury}
                    </StatusBadge>
                  ) : (
                    <StatusBadge tone="green">Healthy</StatusBadge>
                  )}
                </td>
                <td className="p-4">
                  {p.isPublic ? (
                    <StatusBadge tone="green">Yes</StatusBadge>
                  ) : (
                    <StatusBadge tone="silver">No</StatusBadge>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-1">
                    <button
                      className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.035] hover:border-cyan/40"
                      aria-label={`View ${p.name}`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.035] hover:border-cyan/40"
                      aria-label={`Edit ${p.name}`}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {filtered.map((p) => (
          <article key={p.id} className="panel p-4">
            <div className="flex items-center gap-3">
              <PlayerAvatar name={p.name} hue={p.avatarHue} size={50} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="truncate font-bold">{p.name}</div>
                  <div className="metric-nums font-black text-cyan">#{p.jersey}</div>
                </div>
                <div className="truncate text-xs text-silver-muted">
                  {p.position} | {p.email}
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              <MobileMetric label="ATT" value={`${p.attendance}%`} />
              <MobileMetric label="SCR" value={p.score} />
              <MobileMetric label="AST" value={p.assist} />
              <MobileMetric label="BLK" value={p.blocks} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              {p.injury ? (
                <StatusBadge tone={p.injury === "Active" ? "red" : "amber"}>{p.injury}</StatusBadge>
              ) : (
                <StatusBadge tone="green">Healthy</StatusBadge>
              )}
              <button className="rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-xs font-bold text-cyan">
                View
              </button>
            </div>
          </article>
        ))}
      </div>
    </DashboardLayout>
  );
}

function RosterStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-center">
      <div className="metric-nums text-2xl font-black text-foreground">{value}</div>
      <div className="text-[10px] font-semibold text-silver-muted">{label}</div>
    </div>
  );
}

function MobileMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] py-2">
      <div className="metric-nums text-sm font-black">{value}</div>
      <div className="text-[10px] text-silver-muted">{label}</div>
    </div>
  );
}
