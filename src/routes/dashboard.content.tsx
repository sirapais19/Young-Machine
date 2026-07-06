import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ComingSoon } from "@/components/ym/ComingSoon";
import { Globe } from "lucide-react";

export const Route = createFileRoute("/dashboard/content")({
  head: () => ({ meta: [{ title: "Website Content · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (
    <DashboardLayout title="Public Website Content">
      <ComingSoon icon={Globe} title="Website manager" description="Edit About, publish tournaments, control player profile visibility." />
    </DashboardLayout>
  ),
});
