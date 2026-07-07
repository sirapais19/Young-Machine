import { createFileRoute } from "@tanstack/react-router";
import { PlayerInjuryPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/player/injury")({
  head: () => ({ meta: [{ title: "Injury Status | YM" }, { name: "robots", content: "noindex" }] }),
  component: PlayerInjuryPage,
});
