import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ComingSoon } from "@/components/ym/ComingSoon";
import { Award } from "lucide-react";

export const Route = createFileRoute("/dashboard/achievements")({
  head: () => ({ meta: [{ title: "Achievements · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (
    <DashboardLayout title="Achievements">
      <ComingSoon icon={Award} title="Achievements manager" description="Publish trophies and honours to the public website." />
    </DashboardLayout>
  ),
});
