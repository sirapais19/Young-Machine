import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center" onClick={() => setOpen(false)}>
            <YMLogo showWordmark />
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((n) => {
              const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    active ? "text-cyan" : "text-silver-muted hover:text-foreground"
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground glow-cyan"
            >
              Sign in <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <button
            className="lg:hidden grid h-10 w-10 place-items-center rounded-md border border-white/10 text-foreground"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="lg:hidden border-t border-white/5 bg-background">
            <div className="px-4 py-3 flex flex-col gap-1">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-md text-base text-silver hover:bg-white/5"
                >
                  {n.label}
                </Link>
              ))}
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-md bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="mt-24 border-t border-white/5 bg-black/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid gap-8 md:grid-cols-4">
          <div>
            <YMLogo showWordmark />
            <p className="mt-4 text-sm text-silver-muted max-w-xs">
              Young Machine — a competitive Ultimate Frisbee club. Train hard, play smart, move as one.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-cyan mb-3">Club</h4>
            <ul className="space-y-2 text-sm text-silver-muted">
              <li><Link to="/about" className="hover:text-foreground">About</Link></li>
              <li><Link to="/players" className="hover:text-foreground">Players</Link></li>
              <li><Link to="/coaches" className="hover:text-foreground">Coaches</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-cyan mb-3">Compete</h4>
            <ul className="space-y-2 text-sm text-silver-muted">
              <li><Link to="/tournaments" className="hover:text-foreground">Tournaments</Link></li>
              <li><Link to="/achievements" className="hover:text-foreground">Achievements</Link></li>
              <li><Link to="/gallery" className="hover:text-foreground">Gallery</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-cyan mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-silver-muted">
              <li>hello@youngmachine.club</li>
              <li>USJ Field · Selangor</li>
              <li><Link to="/contact" className="hover:text-foreground">Get in touch</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-xs text-silver-muted">
            <span>© {new Date().getFullYear()} Young Machine</span>
            <span className="tracking-widest">MOVE · AS · ONE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
