import { createFileRoute } from "@tanstack/react-router";
import { PlayerEditPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/players/$playerId/edit")({
  head: () => ({ meta: [{ title: "Edit Player | YM" }, { name: "robots", content: "noindex" }] }),
  component: () => {
    const { playerId } = Route.useParams();
    return <PlayerEditPage playerId={playerId} />;
  },
});
