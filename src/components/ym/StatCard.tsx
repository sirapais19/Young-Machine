import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label, value, hint, icon: Icon, tone = "cyan", className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "cyan" | "silver" | "green" | "amber" | "red";
  className?: string;
}) {
  const toneClass = {
    cyan: "text-cyan",
    silver: "text-silver",
    green: "text-success",
    amber: "text-warning",
    red: "text-destructive",
  }[tone];

  return (
    <div className={cn("panel panel-hover p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.18em] text-silver-muted">{label}</div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">{value}</div>
          {hint && <div className="mt-1 text-xs text-silver-muted">{hint}</div>}
        </div>
        {Icon && (
          <div className={cn("grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 shrink-0", toneClass)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
