import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { CalendarDays, MapPin, Plus, Clock, Activity } from "lucide-react";
import { trainings } from "@/data/mockData";

export const Route = createFileRoute("/dashboard/training")({
  head: () => ({ meta: [{ title: "Training | YM" }, { name: "robots", content: "noindex" }] }),
  component: TrainingList,
});

function TrainingList() {
  return (
    <DashboardLayout title="Training">
      <section className="motion-rise mb-5 panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-cyan/25 bg-cyan/10 px-3 py-1 text-[11px] font-semibold text-cyan">
              <Activity className="h-3.5 w-3.5" />
              Field schedule
            </div>
            <h2 className="text-3xl font-black sm:text-4xl">
              Plan sessions around load, availability, and match prep.
            </h2>
            <p className="mt-3 max-w-[62ch] text-sm leading-6 text-silver-muted">
              All scheduled sessions and training history for the Young Machine squad.
            </p>
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground glow-cyan">
            <Plus className="h-4 w-4" />
            Create
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {trainings.map((t) => (
          <article key={t.id} className="panel panel-hover p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xl font-black">{t.title}</div>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-silver-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-cyan" />
                    {t.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-cyan" />
                    {t.start} to {t.end}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-cyan" />
                    {t.location}
                  </span>
                </div>
              </div>
              <StatusBadge
                tone={t.status === "Upcoming" ? "cyan" : t.status === "Completed" ? "green" : "red"}
              >
                {t.status}
              </StatusBadge>
            </div>
            {t.note && <p className="mt-4 text-sm leading-6 text-silver">{t.note}</p>}
            {t.attendance && (
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <AttendanceBox label="Going" value={t.attendance.going} tone="text-success" />
                <AttendanceBox label="Maybe" value={t.attendance.maybe} tone="text-warning" />
                <AttendanceBox label="Out" value={t.attendance.out} tone="text-destructive" />
              </div>
            )}
          </article>
        ))}
      </section>
    </DashboardLayout>
  );
}

function AttendanceBox({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] py-3">
      <div className={`metric-nums text-2xl font-black ${tone}`}>{value}</div>
      <div className="text-[10px] font-semibold text-silver-muted">{label}</div>
    </div>
  );
}
