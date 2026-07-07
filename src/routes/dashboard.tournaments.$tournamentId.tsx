import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { TournamentDetailPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/tournaments/$tournamentId")({
  head: () => ({ meta: [{ title: "Tournament Detail | YM" }, { name: "robots", content: "noindex" }] }),
  component: TournamentDetailRouteShell,
});

function TournamentDetailRouteShell() {
  const { tournamentId } = Route.useParams();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return pathname === `/dashboard/tournaments/${tournamentId}` ? <TournamentDetailPage tournamentId={tournamentId} /> : <Outlet />;
}
