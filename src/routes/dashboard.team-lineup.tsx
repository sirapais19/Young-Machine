import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { TeamLineupPage } from "@/components/tournaments/TournamentPages";

export const Route = createFileRoute("/dashboard/team-lineup")({
  head: () => ({ meta: [{ title: "Team Lineup | YM" }, { name: "robots", content: "noindex" }] }),
  component: TeamLineupRouteShell,
});

function TeamLineupRouteShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return pathname === "/dashboard/team-lineup" ? <TeamLineupPage /> : <Outlet />;
}
