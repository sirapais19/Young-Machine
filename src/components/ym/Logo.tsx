import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}

export function YMLogo({ className, size = 36, showWordmark = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="relative grid place-items-center rounded-lg glow-cyan"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg, #0a0a0a, #1a1a1a)",
          border: "1px solid color-mix(in oklab, var(--cyan) 45%, transparent)",
        }}
      >
        <svg viewBox="0 0 32 32" width={size * 0.7} height={size * 0.7} fill="none">
          <defs>
            <linearGradient id="ym-stroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7EE8FA" />
              <stop offset="1" stopColor="#00BFFF" />
            </linearGradient>
          </defs>
          <path
            d="M4 6 L10 6 L16 15 L22 6 L28 6 L18 20 L18 26 L14 26 L14 20 Z"
            stroke="url(#ym-stroke)"
            strokeWidth="1.4"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M6 26 L10 26 L12 22 L20 22 L22 26 L26 26"
            stroke="url(#ym-stroke)"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.7"
            fill="none"
          />
        </svg>
      </div>
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold tracking-[0.2em] text-foreground">YOUNG MACHINE</span>
          <span className="text-[10px] tracking-[0.35em] text-cyan">ULTIMATE · YM</span>
        </div>
      )}
    </div>
  );
}
