import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { WorkoutDetailPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/workouts/$workoutId")({
  head: () => ({ meta: [{ title: "Workout Detail | YM" }, { name: "robots", content: "noindex" }] }),
  component: WorkoutDetailRouteShell,
});

function WorkoutDetailRouteShell() {
  const { workoutId } = Route.useParams();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return pathname === `/dashboard/workouts/${workoutId}` ? <WorkoutDetailPage workoutId={workoutId} /> : <Outlet />;
}
