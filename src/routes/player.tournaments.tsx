import { createFileRoute } from "@tanstack/react-router";
import { PlayerLayout } from "@/components/layout/PlayerLayout";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { MapPin, CalendarDays } from "lucide-react";
import { tournaments } from "@/data/mockData";

export const Route = createFileRoute("/player/tournaments")({
  head: () => ({ meta: [{ title: "My Tournaments · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (
    <PlayerLayout title="My Tournaments">
      <div className="space-y-3">
        {tournaments.map(t => (
          <div key={t.id} className="panel p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="mt-1 text-xs text-silver-muted flex gap-3">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{t.location}</span>
                  <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{t.start}</span>
                </div>
              </div>
              <StatusBadge tone={t.status === "Upcoming" ? "cyan" : "green"}>{t.status}</StatusBadge>
            </div>
            {t.result && <div className="mt-2 text-sm text-cyan font-medium">{t.result}</div>}
          </div>
        ))}
      </div>
    </PlayerLayout>
  ),
});
