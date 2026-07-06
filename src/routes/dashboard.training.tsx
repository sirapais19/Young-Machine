import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { CalendarDays, MapPin, Plus, Clock } from "lucide-react";
import { trainings } from "@/data/mockData";

export const Route = createFileRoute("/dashboard/training")({
  head: () => ({ meta: [{ title: "Training · YM" }, { name: "robots", content: "noindex" }]}),
  component: TrainingList,
});

function TrainingList() {
  return (
    <DashboardLayout title="Training">
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-silver-muted">All scheduled sessions and history.</p>
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground glow-cyan">
          <Plus className="h-4 w-4" /> Create
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {trainings.map((t) => (
          <div key={t.id} className="panel panel-hover p-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-lg font-semibold">{t.title}</div>
                <div className="mt-1 text-xs text-silver-muted flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{t.date}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{t.start}–{t.end}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{t.location}</span>
                </div>
              </div>
              <StatusBadge tone={t.status === "Upcoming" ? "cyan" : t.status === "Completed" ? "green" : "red"}>{t.status}</StatusBadge>
            </div>
            {t.note && <p className="mt-3 text-sm text-silver">{t.note}</p>}
            {t.attendance && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-success/10 border border-success/25 py-2"><div className="text-lg font-bold text-success">{t.attendance.going}</div><div className="text-[10px] text-silver-muted">Going</div></div>
                <div className="rounded-md bg-warning/10 border border-warning/25 py-2"><div className="text-lg font-bold text-warning">{t.attendance.maybe}</div><div className="text-[10px] text-silver-muted">Maybe</div></div>
                <div className="rounded-md bg-destructive/10 border border-destructive/25 py-2"><div className="text-lg font-bold text-destructive">{t.attendance.out}</div><div className="text-[10px] text-silver-muted">Out</div></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
