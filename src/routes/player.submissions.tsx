import { createFileRoute } from "@tanstack/react-router";
import { PlayerLayout } from "@/components/layout/PlayerLayout";
import { ComingSoon } from "@/components/ym/ComingSoon";
import { ClipboardList } from "lucide-react";

export const Route = createFileRoute("/player/submissions")({
  head: () => ({ meta: [{ title: "My Submissions · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (<PlayerLayout title="My Submissions"><ComingSoon icon={ClipboardList} title="Workout submissions" /></PlayerLayout>),
});
