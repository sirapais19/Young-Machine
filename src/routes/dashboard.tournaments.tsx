import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { TournamentsListPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/tournaments")({
  head: () => ({ meta: [{ title: "Tournaments | YM" }, { name: "robots", content: "noindex" }] }),
  component: TournamentsRouteShell,
});

function TournamentsRouteShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return pathname === "/dashboard/tournaments" ? <TournamentsListPage /> : <Outlet />;
}
