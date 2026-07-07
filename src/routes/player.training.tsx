import { createFileRoute } from "@tanstack/react-router";
import { PlayerTrainingPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/player/training")({
  head: () => ({ meta: [{ title: "Training | YM" }, { name: "robots", content: "noindex" }] }),
  component: PlayerTrainingPage,
});
