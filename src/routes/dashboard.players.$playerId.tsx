import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { PlayerDetailPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/players/$playerId")({
  head: () => ({ meta: [{ title: "Player Detail | YM" }, { name: "robots", content: "noindex" }] }),
  component: PlayerRouteShell,
});

function PlayerRouteShell() {
  const { playerId } = Route.useParams();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return pathname === `/dashboard/players/${playerId}` ? <PlayerDetailPage playerId={playerId} /> : <Outlet />;
}
