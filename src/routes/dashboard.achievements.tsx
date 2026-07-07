import { createFileRoute } from "@tanstack/react-router";
import { AchievementsManagerPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/achievements")({
  head: () => ({ meta: [{ title: "Achievements Manager | YM" }, { name: "robots", content: "noindex" }] }),
  component: AchievementsManagerPage,
});
