import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ComingSoon } from "@/components/ym/ComingSoon";
import { BarChart3 } from "lucide-react";

export const Route = createFileRoute("/dashboard/stats")({
  head: () => ({ meta: [{ title: "Stats · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (
    <DashboardLayout title="Player Statistics">
      <ComingSoon icon={BarChart3} title="Player statistics" description="Per-player scoring, assists, blocks, and turnover trends across the season." />
    </DashboardLayout>
  ),
});
