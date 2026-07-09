import { createFileRoute } from "@tanstack/react-router";
import { TacticalCreatePage } from "@/components/tactical/TacticalPages";

export const Route = createFileRoute("/dashboard/tactical/create")({
  head: () => ({ meta: [{ title: "Create Tactical Board | YM" }, { name: "robots", content: "noindex" }] }),
  component: TacticalCreatePage,
});
