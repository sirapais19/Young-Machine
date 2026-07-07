import { createFileRoute } from "@tanstack/react-router";
import { PlayerSettingsPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/player/settings")({
  head: () => ({ meta: [{ title: "Settings | YM" }, { name: "robots", content: "noindex" }] }),
  component: PlayerSettingsPage,
});
