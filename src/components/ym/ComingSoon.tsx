import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

export function ComingSoon({ title, description, icon: Icon = Sparkles }: {
  title: string; description?: string; icon?: LucideIcon;
}) {
  return (
    <div className="panel p-10 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-cyan/10 text-cyan border border-cyan/25">
        <Icon className="h-6 w-6" />
      </div>
      <div className="mt-4 text-xl font-semibold">{title}</div>
      <p className="mt-2 text-sm text-silver-muted max-w-md mx-auto">
        {description ?? "This module is wired up and ready — full UI ships in the next iteration."}
      </p>
    </div>
  );
}
