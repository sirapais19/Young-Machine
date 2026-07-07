import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { WorkoutsListPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/workouts")({
  head: () => ({ meta: [{ title: "Workout Plans | YM" }, { name: "robots", content: "noindex" }] }),
  component: WorkoutsRouteShell,
});

function WorkoutsRouteShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return pathname === "/dashboard/workouts" ? <WorkoutsListPage /> : <Outlet />;
}
