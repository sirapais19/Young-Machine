import { createFileRoute } from "@tanstack/react-router";
import { ContentManagerPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/content")({
  head: () => ({ meta: [{ title: "Public Website Content | YM" }, { name: "robots", content: "noindex" }] }),
  component: ContentManagerPage,
});
