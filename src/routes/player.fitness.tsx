import { createFileRoute } from "@tanstack/react-router";
import { PlayerLayout } from "@/components/layout/PlayerLayout";
import { ComingSoon } from "@/components/ym/ComingSoon";
import { Activity } from "lucide-react";

export const Route = createFileRoute("/player/fitness")({
  head: () => ({ meta: [{ title: "Fitness · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (<PlayerLayout title="Fitness"><ComingSoon icon={Activity} title="Fitness history" /></PlayerLayout>),
});
