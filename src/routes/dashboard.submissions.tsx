import { createFileRoute } from "@tanstack/react-router";
import { SubmissionsPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/submissions")({
  head: () => ({ meta: [{ title: "Workout Submissions | YM" }, { name: "robots", content: "noindex" }] }),
  component: SubmissionsPage,
});
