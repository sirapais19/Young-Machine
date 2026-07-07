import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { TrainingDetailPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/training/$trainingId")({
  head: () => ({ meta: [{ title: "Training Detail | YM" }, { name: "robots", content: "noindex" }] }),
  component: TrainingDetailRouteShell,
});

function TrainingDetailRouteShell() {
  const { trainingId } = Route.useParams();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return pathname === `/dashboard/training/${trainingId}` ? <TrainingDetailPage trainingId={trainingId} /> : <Outlet />;
}
