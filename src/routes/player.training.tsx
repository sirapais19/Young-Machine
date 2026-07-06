import { createFileRoute } from "@tanstack/react-router";
import { PlayerLayout } from "@/components/layout/PlayerLayout";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { trainings } from "@/data/mockData";

export const Route = createFileRoute("/player/training")({
  head: () => ({ meta: [{ title: "Training · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (
    <PlayerLayout title="Training">
      <div className="space-y-3">
        {trainings.map((t) => (
          <div key={t.id} className="panel panel-hover p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{t.title}</div>
                <div className="mt-2 space-y-1 text-xs text-silver-muted">
                  <div className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-cyan" />{t.date}</div>
                  <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-cyan" />{t.start} – {t.end}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-cyan" />{t.location}</div>
                </div>
              </div>
              <StatusBadge tone={t.status === "Upcoming" ? "cyan" : "green"}>{t.status}</StatusBadge>
            </div>
          </div>
        ))}
      </div>
    </PlayerLayout>
  ),
});
