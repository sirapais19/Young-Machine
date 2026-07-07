import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { CoachPlayersPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/players")({
  head: () => ({ meta: [{ title: "Players | YM" }, { name: "robots", content: "noindex" }] }),
  component: PlayersRouteShell,
});

function PlayersRouteShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return pathname === "/dashboard/players" ? <CoachPlayersPage /> : <Outlet />;
}
