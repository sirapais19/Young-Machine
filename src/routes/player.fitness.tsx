import { createFileRoute } from "@tanstack/react-router";
import { PlayerFitnessPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/player/fitness")({
  head: () => ({ meta: [{ title: "Fitness | YM" }, { name: "robots", content: "noindex" }] }),
  component: PlayerFitnessPage,
});
