import { createFileRoute } from "@tanstack/react-router";
import { TrainingEditPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/training/$trainingId/edit")({
  head: () => ({ meta: [{ title: "Edit Training | YM" }, { name: "robots", content: "noindex" }] }),
  component: () => {
    const { trainingId } = Route.useParams();
    return <TrainingEditPage trainingId={trainingId} />;
  },
});
