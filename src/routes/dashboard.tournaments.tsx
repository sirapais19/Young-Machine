import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { MapPin, CalendarDays, Plus } from "lucide-react";
import { tournaments } from "@/data/mockData";

export const Route = createFileRoute("/dashboard/tournaments")({
  head: () => ({ meta: [{ title: "Tournaments · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (
    <DashboardLayout title="Tournaments">
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-silver-muted">Manage all tournament events.</p>
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground glow-cyan">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tournaments.map((t) => (
          <div key={t.id} className="panel panel-hover p-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-lg font-semibold">{t.name}</div>
                <div className="mt-1 text-xs text-silver-muted flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{t.location}</span>
                  <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{t.start}</span>
                </div>
              </div>
              <StatusBadge tone={t.status === "Upcoming" ? "cyan" : t.status === "Completed" ? "green" : "silver"}>{t.status}</StatusBadge>
            </div>
            <p className="mt-3 text-sm text-silver">{t.description}</p>
            {t.result && <div className="mt-3 text-sm font-semibold text-cyan">{t.result}</div>}
          </div>
        ))}
      </div>
    </DashboardLayout>
  ),
});
