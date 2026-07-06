import { createFileRoute } from "@tanstack/react-router";
import { PlayerLayout } from "@/components/layout/PlayerLayout";
import { Bell } from "lucide-react";
import { notifications } from "@/data/mockData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/player/notifications")({
  head: () => ({ meta: [{ title: "Notifications · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (
    <PlayerLayout title="Notifications">
      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className={cn("panel p-3 flex gap-3", !n.read && "border-cyan/25")}>
            <div className={cn("grid h-9 w-9 place-items-center rounded-lg border shrink-0",
              !n.read ? "bg-cyan/10 border-cyan/25 text-cyan" : "bg-white/5 border-white/10 text-silver-muted")}>
              <Bell className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between gap-2">
                <div className="text-sm font-semibold">{n.title}</div>
                <div className="text-[11px] text-silver-muted">{n.time}</div>
              </div>
              <div className="text-sm text-silver-muted">{n.body}</div>
            </div>
          </div>
        ))}
      </div>
    </PlayerLayout>
  ),
});
