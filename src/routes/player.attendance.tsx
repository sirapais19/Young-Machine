import { createFileRoute } from "@tanstack/react-router";
import { PlayerLayout } from "@/components/layout/PlayerLayout";
import { ComingSoon } from "@/components/ym/ComingSoon";
import { ClipboardCheck } from "lucide-react";

export const Route = createFileRoute("/player/attendance")({
  head: () => ({ meta: [{ title: "My Attendance · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (<PlayerLayout title="My Attendance"><ComingSoon icon={ClipboardCheck} title="Attendance history" /></PlayerLayout>),
});
