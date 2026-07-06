import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ComingSoon } from "@/components/ym/ComingSoon";
import { ClipboardList } from "lucide-react";

export const Route = createFileRoute("/dashboard/submissions")({
  head: () => ({ meta: [{ title: "Submissions · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (
    <DashboardLayout title="Workout Submissions">
      <ComingSoon icon={ClipboardList} title="Player workout submissions" description="Review proof uploads, notes, and completion status per assigned task." />
    </DashboardLayout>
  ),
});
