import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { MapPin, CalendarDays } from "lucide-react";
import { tournaments } from "@/data/mockData";

export const Route = createFileRoute("/tournaments")({
  head: () => ({ meta: [{ title: "Tournaments · Young Machine" }, { name: "description", content: "Upcoming and past tournaments for Young Machine." }]}),
  component: TournamentsPage,
});

function TournamentsPage() {
  const upcoming = tournaments.filter(t => t.status === "Upcoming");
  const past     = tournaments.filter(t => t.status === "Completed");
  return (
    <PublicLayout>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-cyan">Season 2026</div>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold">Tournaments</h1>
      </section>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold mb-4">Upcoming</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {upcoming.map((t) => (
            <div key={t.id} className="panel panel-hover p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{t.name}</div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-silver-muted">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{t.location}</span>
                    <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{t.start} → {t.end}</span>
                  </div>
                </div>
                <StatusBadge tone="cyan">{t.status}</StatusBadge>
              </div>
              <p className="mt-4 text-sm text-silver-muted">{t.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-xl font-semibold mb-4">Past Results</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {past.map((t) => (
            <div key={t.id} className="panel p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold">{t.name}</div>
                  <div className="text-xs text-silver-muted">{t.location} · {t.start}</div>
                </div>
                <StatusBadge tone="green">{t.status}</StatusBadge>
              </div>
              <div className="mt-4 text-sm text-cyan font-medium">{t.result}</div>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
