import { createFileRoute } from "@tanstack/react-router";
import { PlayerWorkoutsPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/player/workouts")({
  head: () => ({ meta: [{ title: "Workouts | YM" }, { name: "robots", content: "noindex" }] }),
  component: PlayerWorkoutsPage,
});
