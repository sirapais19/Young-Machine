import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { YMLogo } from "@/components/ym/Logo";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in | Young Machine" }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

const demos = [
  { label: "Coach", email: "coach@youngmachine.club" },
  { label: "Manager", email: "manager@youngmachine.club" },
  { label: "Player", email: "player@youngmachine.club" },
];

function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoadingAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate({ to: result.user.role === "player" ? "/player/dashboard" : "/dashboard" });
  };

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-2 grid-bg">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 p-12 lg:flex">
        <div className="scanlines absolute inset-0 opacity-30" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-cyan/20 blur-3xl" />
        <YMLogo showWordmark />
        <div className="relative">
          <h2 className="text-5xl font-black leading-tight">
            Train hard.
            <br />
            Play smart.
            <br />
            <span className="text-cyan text-glow-cyan">Move as one.</span>
          </h2>
          <p className="mt-6 max-w-md text-silver-muted">The Young Machine dashboard for training, tournaments, workouts, and stats.</p>
        </div>
        <div className="relative text-xs font-semibold text-silver-muted">YM {new Date().getFullYear()}</div>
      </div>

      <div className="flex flex-col justify-center p-6 sm:p-12">
        <div className="mb-8 lg:hidden">
          <YMLogo showWordmark />
        </div>
        <div className="mx-auto w-full max-w-md lg:mx-0">
          <div className="text-xs font-semibold text-cyan">Members</div>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Sign in to YM</h1>
          <p className="mt-2 text-silver-muted">Coaches, managers, and players.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-semibold text-silver-muted">Email</label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-3 focus-within:border-cyan/50 focus-within:bg-cyan/5">
                <Mail className="h-4 w-4 text-silver-muted" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="you@youngmachine.club"
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-silver-muted"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-silver-muted">Password</label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-3 focus-within:border-cyan/50 focus-within:bg-cyan/5">
                <Lock className="h-4 w-4 text-silver-muted" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  placeholder="Password"
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-silver-muted"
                />
              </div>
            </div>
            {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
            <button disabled={isSubmitting || isLoadingAuth} type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground glow-cyan disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Signing in..." : "Sign in"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 grid gap-2 text-xs">
            <div className="text-silver-muted">Known account emails</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {demos.map((demo) => (
                <button
                  key={demo.email}
                  onClick={() => {
                    setEmail(demo.email);
                    setError("");
                  }}
                  className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 text-left hover:border-cyan/40"
                >
                  <div className="font-semibold">{demo.label}</div>
                  <div className="text-silver-muted">{demo.email}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 text-xs text-silver-muted">
            <Link to="/" className="hover:text-foreground">
              Back to website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
