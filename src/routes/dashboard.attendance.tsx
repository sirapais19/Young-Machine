import { createFileRoute } from "@tanstack/react-router";
import { AttendanceManagerPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/attendance")({
  head: () => ({ meta: [{ title: "Attendance | YM" }, { name: "robots", content: "noindex" }] }),
  component: AttendanceManagerPage,
});
