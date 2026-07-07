import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { TrainingListPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/training")({
  head: () => ({ meta: [{ title: "Training | YM" }, { name: "robots", content: "noindex" }] }),
  component: TrainingRouteShell,
});

function TrainingRouteShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return pathname === "/dashboard/training" ? <TrainingListPage /> : <Outlet />;
}
