import { createFileRoute } from "@tanstack/react-router";
import { PlayerLayout } from "@/components/layout/PlayerLayout";
import { ComingSoon } from "@/components/ym/ComingSoon";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/player/settings")({
  head: () => ({ meta: [{ title: "Settings · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (<PlayerLayout title="Settings"><ComingSoon icon={Settings} title="Account settings" /></PlayerLayout>),
});
