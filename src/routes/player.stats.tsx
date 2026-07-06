import { createFileRoute } from "@tanstack/react-router";
import { PlayerLayout } from "@/components/layout/PlayerLayout";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from "recharts";
import { fitnessTrend } from "@/data/mockData";

export const Route = createFileRoute("/player/stats")({
  head: () => ({ meta: [{ title: "Stats · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (
    <PlayerLayout title="My Stats">
      <div className="grid grid-cols-2 gap-3">
        {[
          { l: "Score", v: 48 }, { l: "Assist", v: 22 }, { l: "Blocks", v: 9 }, { l: "Turnovers", v: 6 },
          { l: "Attendance", v: "92%" }, { l: "Games", v: 12 },
        ].map(s => (
          <div key={s.l} className="panel panel-hover p-4">
            <div className="text-[11px] uppercase tracking-widest text-silver-muted">{s.l}</div>
            <div className="mt-1 text-2xl font-bold text-cyan">{s.v}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 panel p-4">
        <div className="text-[11px] uppercase tracking-widest text-silver-muted">Fitness score</div>
        <div className="text-lg font-semibold">Last 6 months</div>
        <div className="mt-3 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fitnessTrend}>
              <XAxis dataKey="m" stroke="var(--silver-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke="var(--cyan)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--cyan)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PlayerLayout>
  ),
});
