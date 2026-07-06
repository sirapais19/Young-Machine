import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ComingSoon } from "@/components/ym/ComingSoon";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (
    <DashboardLayout title="Settings">
      <ComingSoon icon={Settings} title="Club settings" description="Manage club profile, seasons, and integrations." />
    </DashboardLayout>
  ),
});
