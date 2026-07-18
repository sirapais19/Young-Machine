import { createFileRoute } from "@tanstack/react-router";
import { TournamentEditPage } from "@/components/tournaments/TournamentPages";

export const Route = createFileRoute("/dashboard/tournaments/$tournamentId/edit")({
  head: () => ({ meta: [{ title: "Edit Tournament | YM" }, { name: "robots", content: "noindex" }] }),
  component: () => {
    const { tournamentId } = Route.useParams();
    return <TournamentEditPage tournamentId={tournamentId} />;
  },
});
