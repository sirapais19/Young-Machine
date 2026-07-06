import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ComingSoon } from "@/components/ym/ComingSoon";
import { HeartPulse } from "lucide-react";

export const Route = createFileRoute("/dashboard/injuries")({
  head: () => ({ meta: [{ title: "Injuries · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (
    <DashboardLayout title="Injury Records">
      <ComingSoon icon={HeartPulse} title="Injury tracker" description="Injury history, recovery status, and expected return dates." />
    </DashboardLayout>
  ),
});
