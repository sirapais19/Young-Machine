import { createFileRoute } from "@tanstack/react-router";
import { TeamLineupPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/team-lineup")({
  head: () => ({ meta: [{ title: "Team Lineup | YM" }, { name: "robots", content: "noindex" }] }),
  component: TeamLineupPage,
});
