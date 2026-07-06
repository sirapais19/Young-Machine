import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ComingSoon } from "@/components/ym/ComingSoon";
import { Image } from "lucide-react";

export const Route = createFileRoute("/dashboard/gallery")({
  head: () => ({ meta: [{ title: "Gallery · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (
    <DashboardLayout title="Gallery Manager">
      <ComingSoon icon={Image} title="Gallery manager" description="Create albums, upload photos, and publish to the public gallery." />
    </DashboardLayout>
  ),
});
