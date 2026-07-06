import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ComingSoon } from "@/components/ym/ComingSoon";
import { ClipboardCheck } from "lucide-react";

export const Route = createFileRoute("/dashboard/attendance")({
  head: () => ({ meta: [{ title: "Attendance · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (
    <DashboardLayout title="Attendance">
      <ComingSoon icon={ClipboardCheck} title="Attendance manager" description="Mark attended / absent per session and view historical attendance." />
    </DashboardLayout>
  ),
});
