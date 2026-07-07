import { createFileRoute } from "@tanstack/react-router";
import { TrainingListPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/training")({
  head: () => ({ meta: [{ title: "Training | YM" }, { name: "robots", content: "noindex" }] }),
  component: TrainingListPage,
});
