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
      className={cn("grid place-items-center rounded-full font-bold text-black shrink-0", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `radial-gradient(circle at 30% 30%, oklch(0.92 0.14 ${hue}), oklch(0.7 0.14 ${hue}))`,
        boxShadow: `0 0 0 1px oklch(0.7 0.14 ${hue} / .5), 0 8px 22px -10px oklch(0.7 0.14 ${hue} / .7)`,
      }}
    >
      {initials}
    </div>
  );
}
