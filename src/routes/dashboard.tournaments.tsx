import { createFileRoute } from "@tanstack/react-router";
import { TournamentsListPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/tournaments")({
  head: () => ({ meta: [{ title: "Tournaments | YM" }, { name: "robots", content: "noindex" }] }),
  component: TournamentsListPage,
});
