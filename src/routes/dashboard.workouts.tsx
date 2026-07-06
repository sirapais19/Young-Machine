import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { Plus } from "lucide-react";
import { workoutPlan } from "@/data/mockData";

export const Route = createFileRoute("/dashboard/workouts")({
  head: () => ({ meta: [{ title: "Workouts · YM" }, { name: "robots", content: "noindex" }]}),
  component: WorkoutsPage,
});

function WorkoutsPage() {
  return (
    <DashboardLayout title="Workout Plans">
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-silver-muted">Active plans and assigned tasks.</p>
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground glow-cyan">
          <Plus className="h-4 w-4" /> New Plan
        </button>
      </div>
      <div className="panel p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-semibold">{workoutPlan.title}</div>
            <div className="text-xs text-silver-muted">{workoutPlan.start} → {workoutPlan.end}</div>
          </div>
          <StatusBadge tone="cyan">{workoutPlan.status}</StatusBadge>
        </div>
        <p className="mt-3 text-sm text-silver">{workoutPlan.description}</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {workoutPlan.tasks.map((t) => (
          <div key={t.id} className="panel panel-hover p-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-cyan">{t.day} · {t.date}</div>
                <div className="mt-1 text-lg font-semibold">{t.title}</div>
              </div>
              <StatusBadge tone="silver">{t.type}</StatusBadge>
            </div>
            <p className="mt-2 text-sm text-silver-muted">{t.description}</p>
            <div className="mt-4 flex justify-between text-xs">
              <span className="text-silver-muted">{t.done ? "Completed" : "Assigned"}</span>
              <span className="text-cyan font-semibold">{t.done ? "100%" : "35%"} submitted</span>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
