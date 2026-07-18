import { createFileRoute } from "@tanstack/react-router";
import { TournamentCreatePage } from "@/components/tournaments/TournamentPages";

export const Route = createFileRoute("/dashboard/tournaments/create")({
  head: () => ({ meta: [{ title: "Create Tournament | YM" }, { name: "robots", content: "noindex" }] }),
  component: TournamentCreatePage,
});
