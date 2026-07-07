import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings | YM" }, { name: "robots", content: "noindex" }] }),
  component: SettingsPage,
});
