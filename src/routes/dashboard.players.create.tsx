import { createFileRoute } from "@tanstack/react-router";
import { PlayerCreatePage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/players/create")({
  head: () => ({ meta: [{ title: "Add Player | YM" }, { name: "robots", content: "noindex" }] }),
  component: PlayerCreatePage,
});
