import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/notifications")({
  head: () => ({ meta: [{ title: "Notifications | YM" }, { name: "robots", content: "noindex" }] }),
  component: () => <NotificationsPage />,
});
