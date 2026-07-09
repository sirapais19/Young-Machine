import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, Cpu, Menu, X } from "lucide-react";
import { YMLogo } from "@/components/ym/Logo";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/players", label: "Players" },
  { to: "/coaches", label: "Coaches" },
  { to: "/tournaments", label: "Tournaments" },
  { to: "/achievements", label: "Achievements" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

export function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="machine-grid-bg min-h-screen text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#030303]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center" onClick={() => setOpen(false)}>
            <YMLogo showWordmark />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((n) => {
              const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                    active ? "border border-white/10 bg-white/[0.055] text-foreground" : "text-silver-muted hover:bg-white/[0.04] hover:text-foreground",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-bold text-foreground hover:border-cyan/35 hover:bg-white/[0.09]"
            >
              Sign in <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button
            className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.045] text-foreground lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-white/10 bg-[#030303] lg:hidden">
            <div className="flex flex-col gap-1 px-4 py-3">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-base font-semibold text-silver hover:bg-white/5"
                >
                  {n.label}
                </Link>
              ))}
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-center text-sm font-bold text-cyan"
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="mt-24 border-t border-white/10 bg-[#030303]/88">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          <div>
            <YMLogo showWordmark />
            <p className="mt-4 max-w-xs text-sm leading-6 text-silver-muted">
              Young Machine is a robotic squad system for ultimate frisbee training, tournaments, and performance.
            </p>
          </div>
          <FooterColumn title="Club" links={[["About", "/about"], ["Players", "/players"], ["Coaches", "/coaches"]]} />
          <FooterColumn title="Compete" links={[["Tournaments", "/tournaments"], ["Achievements", "/achievements"], ["Gallery", "/gallery"]]} />
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-silver">
              <Cpu className="h-3.5 w-3.5 text-cyan" />
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-silver-muted">
              <li>hello@youngmachine.club</li>
              <li>USJ Field, Selangor</li>
              <li>
                <Link to="/contact" className="hover:text-foreground">
                  Get in touch
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-xs text-silver-muted sm:px-6 lg:px-8">
            <span>Copyright {new Date().getFullYear()} Young Machine</span>
            <span className="tracking-widest">BUILT LIKE A MACHINE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-silver">
        <Cpu className="h-3.5 w-3.5 text-cyan" />
        {title}
      </h4>
      <ul className="space-y-2 text-sm text-silver-muted">
        {links.map(([label, to]) => (
          <li key={to}>
            <Link to={to} className="hover:text-foreground">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
