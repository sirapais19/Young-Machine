import { createFileRoute } from "@tanstack/react-router";
import { TacticalEditPage } from "@/components/tactical/TacticalPages";

export const Route = createFileRoute("/dashboard/tactical/$tacticalId/edit")({
  head: () => ({ meta: [{ title: "Edit Tactical Board | YM" }, { name: "robots", content: "noindex" }] }),
  component: TacticalEditRoute,
});

function TacticalEditRoute() {
  const { tacticalId } = Route.useParams();
  return <TacticalEditPage tacticalId={tacticalId} />;
}
