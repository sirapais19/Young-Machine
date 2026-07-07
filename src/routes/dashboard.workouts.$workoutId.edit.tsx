import { createFileRoute } from "@tanstack/react-router";
import { WorkoutEditPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/workouts/$workoutId/edit")({
  head: () => ({ meta: [{ title: "Edit Workout | YM" }, { name: "robots", content: "noindex" }] }),
  component: () => {
    const { workoutId } = Route.useParams();
    return <WorkoutEditPage workoutId={workoutId} />;
  },
});
