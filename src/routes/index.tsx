import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Trophy, Users, CalendarDays, Sparkles, Target, Zap } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { players, tournaments, achievements, galleryPhotos } from "@/data/mockData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Young Machine · Ultimate Frisbee Club" },
      { name: "description", content: "Young Machine (YM) is a competitive Ultimate Frisbee club. Train hard, play smart, move as one." },
      { property: "og:title", content: "Young Machine · Ultimate Frisbee Club" },
      { property: "og:description", content: "Premium Ultimate Frisbee club — training, tournaments, and team performance." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const featured = players.filter(p => p.isPublic).slice(0, 4);
  const nextTournament = tournaments.find(t => t.status === "Upcoming")!;

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="grid-bg absolute inset-0 -z-10" />
        <div className="scanlines absolute inset-0 -z-10 opacity-40" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/5 px-3 py-1 text-xs font-medium text-cyan">
                <Sparkles className="h-3.5 w-3.5" /> Season 2026 · Roster live
              </div>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
                Train Hard.<br />
                Play Smart.<br />
                <span className="text-cyan text-glow-cyan">Move as One.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base sm:text-lg text-silver-muted">
                Young Machine is a competitive Ultimate Frisbee club built on discipline, chemistry, and relentless work. This is where players become a system.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/players" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground glow-cyan">
                  View Team <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/tournaments" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-white/10">
                  Upcoming Tournaments
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-6 max-w-md">
                {[
                  { k: "Players", v: "24" },
                  { k: "Wins '26", v: "18" },
                  { k: "Trophies", v: "07" },
                ].map((s) => (
                  <div key={s.k}>
                    <div className="text-2xl sm:text-3xl font-bold text-cyan">{s.v}</div>
                    <div className="text-[11px] uppercase tracking-widest text-silver-muted">{s.k}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual card */}
            <div className="relative">
              <div className="panel p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-cyan/20 blur-3xl" />
                <div className="flex items-center justify-between">
                  <StatusBadge tone="cyan">Next Tournament</StatusBadge>
                  <span className="text-xs text-silver-muted">{nextTournament.start}</span>
                </div>
                <div className="mt-4 text-2xl sm:text-3xl font-bold">{nextTournament.name}</div>
                <div className="text-silver-muted">{nextTournament.location}</div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {featured.map((p) => (
                    <div key={p.id} className="panel p-3 text-center">
                      <PlayerAvatar name={p.name} hue={p.avatarHue} size={44} className="mx-auto" />
                      <div className="mt-2 text-sm font-semibold truncate">{p.name}</div>
                      <div className="text-[10px] uppercase tracking-widest text-cyan">#{p.jersey}</div>
                    </div>
                  )).slice(0, 3)}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-silver-muted">Roster</div>
                    <div className="mt-1 font-semibold">24 players confirmed</div>
                  </div>
                  <div className="rounded-lg border border-cyan/25 bg-cyan/10 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-cyan">Status</div>
                    <div className="mt-1 font-semibold text-cyan">Training active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Target, title: "Precision Training", body: "Structured weekly blocks — strength, throwing, and set plays engineered for game speed." },
            { icon: Zap, title: "Sports Performance", body: "Fitness records, sprint benchmarks and workout compliance tracked for every player." },
            { icon: Users, title: "Team Culture", body: "One system. High spirit. Deep bench. Everyone accountable to the machine." },
          ].map((f) => (
            <div key={f.title} className="panel panel-hover p-6">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyan/10 text-cyan border border-cyan/25">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-silver-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PLAYERS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-cyan">Roster</div>
            <h2 className="text-2xl sm:text-3xl font-bold">Featured Players</h2>
          </div>
          <Link to="/players" className="text-sm text-cyan hover:underline">All players →</Link>
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <div key={p.id} className="panel panel-hover p-5">
              <div className="flex items-center justify-between">
                <PlayerAvatar name={p.name} hue={p.avatarHue} size={54} />
                <div className="text-3xl font-bold text-cyan/70">#{p.jersey}</div>
              </div>
              <div className="mt-4 font-semibold">{p.name}</div>
              <div className="text-xs text-silver-muted">{p.position}</div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div><div className="text-sm font-bold">{p.score}</div><div className="text-[10px] text-silver-muted">SCR</div></div>
                <div><div className="text-sm font-bold">{p.assist}</div><div className="text-[10px] text-silver-muted">AST</div></div>
                <div><div className="text-sm font-bold">{p.blocks}</div><div className="text-[10px] text-silver-muted">BLK</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEXT TOURNAMENT + ACHIEVEMENTS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid gap-6 lg:grid-cols-3">
        <div className="panel p-6 lg:col-span-2">
          <div className="flex items-center gap-2 text-cyan">
            <CalendarDays className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.2em]">Coming up</span>
          </div>
          <h3 className="mt-2 text-2xl font-bold">{nextTournament.name}</h3>
          <p className="mt-1 text-silver-muted">{nextTournament.description}</p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><div className="text-[10px] uppercase text-silver-muted">Location</div><div className="font-semibold">{nextTournament.location}</div></div>
            <div><div className="text-[10px] uppercase text-silver-muted">Start</div><div className="font-semibold">{nextTournament.start}</div></div>
            <div><div className="text-[10px] uppercase text-silver-muted">End</div><div className="font-semibold">{nextTournament.end}</div></div>
            <div><div className="text-[10px] uppercase text-silver-muted">Status</div><StatusBadge tone="cyan">{nextTournament.status}</StatusBadge></div>
          </div>
        </div>
        <div className="panel p-6">
          <div className="flex items-center gap-2 text-cyan">
            <Trophy className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.2em]">Recent Silverware</span>
          </div>
          <ul className="mt-4 space-y-4">
            {achievements.slice(0, 3).map((a) => (
              <li key={a.id} className="border-l-2 border-cyan/60 pl-4">
                <div className="text-sm font-semibold">{a.title}</div>
                <div className="text-xs text-silver-muted">{a.date}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">From the Field</h2>
          <Link to="/gallery" className="text-sm text-cyan hover:underline">Full gallery →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {galleryPhotos.slice(0, 8).map((g) => (
            <div key={g.id} className="aspect-square rounded-xl overflow-hidden relative panel-hover"
                 style={{ background: `linear-gradient(135deg, oklch(0.3 0.06 ${g.hue}), oklch(0.15 0.02 ${g.hue}))` }}>
              <div className="absolute inset-0 grid place-items-center text-silver-muted text-xs">{g.caption}</div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 text-[10px] uppercase tracking-widest text-cyan">{g.caption}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="panel p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan/20 blur-3xl" />
          <div className="relative grid gap-6 md:grid-cols-2 items-center">
            <div>
              <h3 className="text-3xl sm:text-4xl font-bold">Ready to run with the machine?</h3>
              <p className="mt-3 text-silver-muted max-w-lg">Tryouts, tournaments, and training info — get in touch and follow the club.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground glow-cyan">Contact the club</Link>
              <Link to="/about" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold">Learn more</Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
