import { createFileRoute } from "@tanstack/react-router";
import { WorkoutDetailPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/workouts/$workoutId")({
  head: () => ({ meta: [{ title: "Workout Detail | YM" }, { name: "robots", content: "noindex" }] }),
  component: () => {
    const { workoutId } = Route.useParams();
    return <WorkoutDetailPage workoutId={workoutId} />;
  },
});
