import { createFileRoute } from "@tanstack/react-router";
import { PlayerLayout } from "@/components/layout/PlayerLayout";
import { ComingSoon } from "@/components/ym/ComingSoon";
import { HeartPulse } from "lucide-react";

export const Route = createFileRoute("/player/injury")({
  head: () => ({ meta: [{ title: "Injury · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (<PlayerLayout title="Injury Status"><ComingSoon icon={HeartPulse} title="No active injuries" description="You're healthy — keep it up." /></PlayerLayout>),
});
