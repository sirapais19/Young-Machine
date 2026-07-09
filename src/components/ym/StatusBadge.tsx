import { cn } from "@/lib/utils";

type Tone = "cyan" | "green" | "amber" | "red" | "silver";

const tones: Record<Tone, string> = {
  cyan: "bg-cyan/10 text-cyan border-cyan/30",
  green: "bg-success/10 text-success border-success/30",
  amber: "bg-warning/10 text-warning border-warning/30",
  red: "bg-destructive/10 text-destructive border-destructive/30",
  silver: "bg-white/[0.055] text-silver border-white/15",
};

export function StatusBadge({
  tone = "cyan",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[10px] font-black uppercase leading-none tracking-[0.08em]",
        tones[tone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_10px_currentColor]" />
      {children}
    </span>
  );
}
