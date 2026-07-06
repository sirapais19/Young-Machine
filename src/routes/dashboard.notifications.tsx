import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Bell } from "lucide-react";
import { notifications } from "@/data/mockData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/notifications")({
  head: () => ({ meta: [{ title: "Notifications · YM" }, { name: "robots", content: "noindex" }]}),
  component: () => (
    <DashboardLayout title="Notifications">
      <div className="max-w-2xl space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className={cn("panel p-4 flex gap-3 items-start", !n.read && "border-cyan/25")}>
            <div className={cn("grid h-9 w-9 place-items-center rounded-lg border shrink-0",
              !n.read ? "bg-cyan/10 border-cyan/25 text-cyan" : "bg-white/5 border-white/10 text-silver-muted")}>
              <Bell className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between gap-2">
                <div className="font-semibold text-sm">{n.title}</div>
                <div className="text-[11px] text-silver-muted">{n.time}</div>
              </div>
              <div className="text-sm text-silver-muted">{n.body}</div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  ),
});
