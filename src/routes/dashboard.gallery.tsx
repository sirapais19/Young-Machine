import { createFileRoute } from "@tanstack/react-router";
import { GalleryManagerPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/gallery")({
  head: () => ({ meta: [{ title: "Gallery Manager | YM" }, { name: "robots", content: "noindex" }] }),
  component: GalleryManagerPage,
});
