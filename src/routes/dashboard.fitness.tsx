import { createFileRoute } from "@tanstack/react-router";
import { FitnessManagerPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/fitness")({
  head: () => ({ meta: [{ title: "Fitness Records | YM" }, { name: "robots", content: "noindex" }] }),
  component: FitnessManagerPage,
});
