import { createFileRoute } from "@tanstack/react-router";
import { PlayerAttendancePage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/player/attendance")({
  head: () => ({ meta: [{ title: "My Attendance | YM" }, { name: "robots", content: "noindex" }] }),
  component: PlayerAttendancePage,
});
