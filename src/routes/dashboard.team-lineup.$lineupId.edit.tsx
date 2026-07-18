import { createFileRoute } from "@tanstack/react-router";
import { TeamLineupEditPage } from "@/components/tournaments/TournamentPages";

export const Route = createFileRoute("/dashboard/team-lineup/$lineupId/edit")({
  head: () => ({ meta: [{ title: "Edit Team Lineup | YM" }, { name: "robots", content: "noindex" }] }),
  component: () => {
    const { lineupId } = Route.useParams();
    return <TeamLineupEditPage lineupId={lineupId} />;
  },
});
