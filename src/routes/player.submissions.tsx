import { createFileRoute } from "@tanstack/react-router";
import { PlayerSubmissionsPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/player/submissions")({
  head: () => ({ meta: [{ title: "My Submissions | YM" }, { name: "robots", content: "noindex" }] }),
  component: PlayerSubmissionsPage,
});
