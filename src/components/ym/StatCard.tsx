import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "cyan",
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "cyan" | "silver" | "green" | "amber" | "red";
  className?: string;
}) {
  const toneClass = {
    cyan: "text-cyan bg-cyan/10 border-cyan/25",
    silver: "text-silver bg-white/[0.045] border-white/10",
    green: "text-success bg-success/10 border-success/25",
    amber: "text-warning bg-warning/10 border-warning/25",
    red: "text-destructive bg-destructive/10 border-destructive/25",
  }[tone];

  return (
    <div className={cn("panel-shell motion-rise", className)}>
      <div className="panel-core panel-hover h-full p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold text-silver-muted">{label}</div>
            <div className="metric-nums mt-2 text-3xl font-black leading-none text-foreground sm:text-4xl">
              {value}
            </div>
            {hint && <div className="mt-2 text-xs leading-snug text-silver-muted">{hint}</div>}
          </div>
          {Icon && (
            <div
              className={cn(
                "grid h-11 w-11 shrink-0 place-items-center rounded-xl border",
                toneClass,
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
