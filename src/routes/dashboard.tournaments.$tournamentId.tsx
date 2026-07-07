import { createFileRoute } from "@tanstack/react-router";
import { TournamentDetailPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/tournaments/$tournamentId")({
  head: () => ({ meta: [{ title: "Tournament Detail | YM" }, { name: "robots", content: "noindex" }] }),
  component: () => {
    const { tournamentId } = Route.useParams();
    return <TournamentDetailPage tournamentId={tournamentId} />;
  },
});
