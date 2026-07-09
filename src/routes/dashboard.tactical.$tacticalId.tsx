import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { TacticalDetailPage } from "@/components/tactical/TacticalPages";

export const Route = createFileRoute("/dashboard/tactical/$tacticalId")({
  head: () => ({ meta: [{ title: "Tactical Board | YM" }, { name: "robots", content: "noindex" }] }),
  component: TacticalDetailRouteShell,
});

function TacticalDetailRouteShell() {
  const { tacticalId } = Route.useParams();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return pathname === `/dashboard/tactical/${tacticalId}` ? <TacticalDetailPage tacticalId={tacticalId} /> : <Outlet />;
}
