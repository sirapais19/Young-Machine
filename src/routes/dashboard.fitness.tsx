import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ComingSoon } from "@/components/ym/ComingSoon";
import { Activity } from "lucide-react";

export const Route = createFileRoute("/dashboard/fitness")({
  head: () => ({ meta: [{ title: "Fitness · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (
    <DashboardLayout title="Fitness Records">
      <ComingSoon icon={Activity} title="Fitness records" description="Weight, sprint time, endurance, and fitness score progression per player." />
    </DashboardLayout>
  ),
});
