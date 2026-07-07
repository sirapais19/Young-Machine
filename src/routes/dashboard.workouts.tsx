import { createFileRoute } from "@tanstack/react-router";
import { WorkoutsListPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/workouts")({
  head: () => ({ meta: [{ title: "Workout Plans | YM" }, { name: "robots", content: "noindex" }] }),
  component: WorkoutsListPage,
});
