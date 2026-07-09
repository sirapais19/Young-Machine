import { createFileRoute } from "@tanstack/react-router";
import { PlayerTacticalDetailPage } from "@/components/tactical/TacticalPages";

export const Route = createFileRoute("/player/tactics/$tacticalId")({
  head: () => ({ meta: [{ title: "Tactic | YM" }, { name: "robots", content: "noindex" }] }),
  component: PlayerTacticalDetailRoute,
});

function PlayerTacticalDetailRoute() {
  const { tacticalId } = Route.useParams();
  return <PlayerTacticalDetailPage tacticalId={tacticalId} />;
}
