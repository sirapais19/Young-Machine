import { createFileRoute } from "@tanstack/react-router";
import { PlayerTacticsPage } from "@/components/tactical/TacticalPages";

export const Route = createFileRoute("/player/tactics")({
  head: () => ({ meta: [{ title: "My Tactics | YM" }, { name: "robots", content: "noindex" }] }),
  component: PlayerTacticsPage,
});
