import { createFileRoute } from "@tanstack/react-router";
import { TrainingCreatePage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/training/create")({
  head: () => ({ meta: [{ title: "Create Training | YM" }, { name: "robots", content: "noindex" }] }),
  component: TrainingCreatePage,
});
