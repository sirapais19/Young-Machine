import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ComingSoon } from "@/components/ym/ComingSoon";
import { Users2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/team-lineup")({
  head: () => ({ meta: [{ title: "Team Lineup · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (
    <DashboardLayout title="Team Lineup">
      <ComingSoon icon={Users2} title="Tournament lineups" description="Build and order tournament lineups per tournament and position." />
    </DashboardLayout>
  ),
});
