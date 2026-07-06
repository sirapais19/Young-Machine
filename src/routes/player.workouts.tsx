import { createFileRoute } from "@tanstack/react-router";
import { PlayerLayout } from "@/components/layout/PlayerLayout";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { Check, Upload } from "lucide-react";
import { workoutPlan } from "@/data/mockData";

export const Route = createFileRoute("/player/workouts")({
  head: () => ({ meta: [{ title: "Workouts · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (
    <PlayerLayout title="Workouts">
      <div className="panel p-4 mb-4">
        <div className="text-[10px] uppercase tracking-widest text-cyan">Active plan</div>
        <div className="text-lg font-semibold">{workoutPlan.title}</div>
        <div className="text-xs text-silver-muted">{workoutPlan.start} → {workoutPlan.end}</div>
      </div>
      <div className="space-y-3">
        {workoutPlan.tasks.map((t) => (
          <div key={t.id} className="panel panel-hover p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-cyan">{t.day} · {t.type}</div>
                <div className="mt-1 font-semibold">{t.title}</div>
                <p className="mt-1 text-sm text-silver-muted">{t.description}</p>
              </div>
              {t.done && <StatusBadge tone="green">Done</StatusBadge>}
            </div>
            {!t.done && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground"><Check className="h-4 w-4" /> Done</button>
                <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 py-2.5 text-sm font-semibold"><Upload className="h-4 w-4" /> Proof</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </PlayerLayout>
  ),
});
