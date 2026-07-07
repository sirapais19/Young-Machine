import { createFileRoute } from "@tanstack/react-router";
import { StatsManagerPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/stats")({
  head: () => ({ meta: [{ title: "Player Statistics | YM" }, { name: "robots", content: "noindex" }] }),
  component: StatsManagerPage,
});
