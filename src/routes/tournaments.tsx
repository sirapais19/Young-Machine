import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { MapPin, CalendarDays } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";

export const Route = createFileRoute("/tournaments")({
  head: () => ({ meta: [{ title: "Tournaments | Young Machine" }, { name: "description", content: "Upcoming and past tournaments for Young Machine." }] }),
  component: TournamentsPage,
});

function TournamentsPage() {
  const { data } = useAppData();
  const visible = data.tournaments.filter((tournament) => tournament.status === "Upcoming" || tournament.status === "Completed");
  return (
    <PublicLayout>
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="text-xs font-semibold text-cyan">Season 2026</div>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">Tournaments</h1>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
        {visible.map((tournament) => (
          <div key={tournament.id} className="panel panel-hover p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-bold">{tournament.name}</div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-silver-muted">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{tournament.location}</span>
                  <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{tournament.start} to {tournament.end}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge tone={tournament.eventType === "Friendly" ? "silver" : "cyan"}>{tournament.eventType}</StatusBadge>
                <StatusBadge tone={tournament.status === "Upcoming" ? "cyan" : "green"}>{tournament.status}</StatusBadge>
              </div>
            </div>
            <p className="mt-4 text-sm text-silver-muted">{tournament.description}</p>
            <div className="mt-3 text-xs font-bold text-silver-muted">{tournament.totalGames} game{tournament.totalGames === 1 ? "" : "s"} scheduled</div>
            {tournament.result && <div className="mt-4 text-sm font-bold text-cyan">{tournament.result}</div>}
          </div>
        ))}
      </section>
    </PublicLayout>
  );
}
