import { createFileRoute } from "@tanstack/react-router";
import { TrainingDetailPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/training/$trainingId")({
  head: () => ({ meta: [{ title: "Training Detail | YM" }, { name: "robots", content: "noindex" }] }),
  component: () => {
    const { trainingId } = Route.useParams();
    return <TrainingDetailPage trainingId={trainingId} />;
  },
});
