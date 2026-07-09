import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { TacticalListPage } from "@/components/tactical/TacticalPages";

export const Route = createFileRoute("/dashboard/tactical")({
  head: () => ({ meta: [{ title: "Tactical Lab | YM" }, { name: "robots", content: "noindex" }] }),
  component: TacticalRouteShell,
});

function TacticalRouteShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return pathname === "/dashboard/tactical" ? <TacticalListPage /> : <Outlet />;
}
