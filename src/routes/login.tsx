import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { YMLogo } from "@/components/ym/Logo";
import { ArrowRight, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · Young Machine" }, { name: "robots", content: "noindex" }]}),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Role-aware mock redirect
    const target =
      email.startsWith("capang") || email.startsWith("aina")
        ? "/dashboard"
        : "/player/dashboard";
    navigate({ to: target });
  };

  return (
    <div className="min-h-screen grid-bg grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 border-r border-white/5 overflow-hidden">
        <div className="scanlines absolute inset-0 opacity-30" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-cyan/20 blur-3xl" />
        <YMLogo showWordmark />
        <div className="relative">
          <h2 className="text-5xl font-bold leading-tight">
            Train hard.<br />
            Play smart.<br />
            <span className="text-cyan text-glow-cyan">Move as one.</span>
          </h2>
          <p className="mt-6 max-w-md text-silver-muted">
            The Young Machine club dashboard — training, tournaments, workouts and stats in one system.
          </p>
        </div>
        <div className="relative text-xs text-silver-muted tracking-widest">© {new Date().getFullYear()} · YM</div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col justify-center p-6 sm:p-12">
        <div className="lg:hidden mb-8"><YMLogo showWordmark /></div>
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="text-xs uppercase tracking-[0.2em] text-cyan">Members</div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold">Sign in to YM</h1>
          <p className="mt-2 text-silver-muted">Coaches, managers and players.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-silver-muted">Email</label>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-cyan/50 focus-within:bg-cyan/5">
                <Mail className="h-4 w-4 text-silver-muted" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@youngmachine.club" className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-silver-muted" />
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <label className="text-xs uppercase tracking-widest text-silver-muted">Password</label>
                <a className="text-xs text-cyan hover:underline" href="#">Forgot?</a>
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-cyan/50 focus-within:bg-cyan/5">
                <Lock className="h-4 w-4 text-silver-muted" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="••••••••" className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-silver-muted" />
              </div>
            </div>
            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-semibold text-primary-foreground glow-cyan">
              Sign in <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 grid gap-2 text-xs">
            <div className="text-silver-muted">Quick demo:</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setEmail("capang@gmail.com"); setPassword("demo"); }} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-left hover:border-cyan/40">
                <div className="font-semibold">Coach Capang</div>
                <div className="text-silver-muted">capang@gmail.com</div>
              </button>
              <button onClick={() => { setEmail("aidit@gmail.com"); setPassword("demo"); }} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-left hover:border-cyan/40">
                <div className="font-semibold">Player Aidit</div>
                <div className="text-silver-muted">aidit@gmail.com</div>
              </button>
            </div>
          </div>

          <div className="mt-8 text-xs text-silver-muted">
            <Link to="/" className="hover:text-foreground">← Back to website</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
