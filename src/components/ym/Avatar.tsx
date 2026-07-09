import { cn } from "@/lib/utils";

export function PlayerAvatar({
  name,
  hue = 200,
  size = 44,
  className,
}: { name: string; hue?: number; size?: number; className?: string }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      className={cn("grid shrink-0 place-items-center rounded-xl font-black text-black", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, oklch(0.92 0.02 ${hue}), oklch(0.68 0.02 ${hue}) 58%, oklch(0.82 0.09 210))`,
        boxShadow: `0 0 0 1px rgb(255 255 255 / .18), 0 10px 26px -18px oklch(0.82 0.09 210 / .8)`,
      }}
    >
      {initials}
    </div>
  );
}
