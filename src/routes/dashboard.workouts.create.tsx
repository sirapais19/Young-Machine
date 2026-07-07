import { createFileRoute } from "@tanstack/react-router";
import { WorkoutCreatePage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/workouts/create")({
  head: () => ({ meta: [{ title: "Create Workout | YM" }, { name: "robots", content: "noindex" }] }),
  component: WorkoutCreatePage,
});
