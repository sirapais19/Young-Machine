import { createFileRoute } from "@tanstack/react-router";
import { PlayerStatsPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/player/stats")({
  head: () => ({ meta: [{ title: "My Stats | YM" }, { name: "robots", content: "noindex" }] }),
  component: PlayerStatsPage,
});
