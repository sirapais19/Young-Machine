import { createFileRoute } from "@tanstack/react-router";
import { PlayerTournamentsPage } from "@/components/tournaments/TournamentPages";

export const Route = createFileRoute("/player/tournaments")({
  head: () => ({ meta: [{ title: "My Tournaments | YM" }, { name: "robots", content: "noindex" }] }),
  component: PlayerTournamentsPage,
});
