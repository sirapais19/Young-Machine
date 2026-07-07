import { createFileRoute } from "@tanstack/react-router";
import { TeamLineupCreatePage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/team-lineup/create")({
  head: () => ({ meta: [{ title: "Create Lineup | YM" }, { name: "robots", content: "noindex" }] }),
  component: TeamLineupCreatePage,
});
