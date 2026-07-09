import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Cpu, Target, Trophy, Users, Zap } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { StatusBadge } from "@/components/ym/StatusBadge";
import { useAppData } from "@/hooks/useAppData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Young Machine | Ultimate Frisbee Command System" },
      { name: "description", content: "Young Machine is a high-performance ultimate frisbee squad built on discipline, speed, chemistry, and precision." },
      { property: "og:title", content: "Young Machine | Ultimate Frisbee Command System" },
      { property: "og:description", content: "A black and silver robotic squad system for training, tournaments, and performance." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data } = useAppData();
  const featured = data.players.filter((player) => player.isPublic).slice(0, 4);
  const nextTournament = data.tournaments.find((tournament) => tournament.status === "Upcoming") ?? data.tournaments[0];
  const achievements = data.achievements.filter((achievement) => achievement.status === "Published");
  const publishedGalleryIds = new Set(data.galleries.filter((gallery) => gallery.status === "Published").map((gallery) => gallery.id));
  const galleryPhotos = data.galleryImages.filter((image) => publishedGalleryIds.has(image.galleryId));

  return (
    <PublicLayout>
      <section className="relative isolate overflow-hidden">
        <div className="machine-grid-bg machine-grid-animated absolute inset-0 -z-10 opacity-80" />
        <div className="scanlines absolute inset-0 -z-10 opacity-35" />
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="motion-rise">
              <div className="machine-badge">
                <Cpu className="h-3.5 w-3.5 text-cyan" />
                YM squad system online
              </div>
              <h1 className="cyber-scan mt-5 max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-silver sm:text-6xl lg:text-7xl">
                Built Like a Machine. Played as One.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-silver-muted sm:text-lg">
                Young Machine is a high-performance ultimate frisbee squad built on discipline, speed, chemistry, and precision.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/players" className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan/35 bg-cyan/12 px-6 py-3.5 text-sm font-black text-cyan glow-cyan">
                  Explore the squad <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/tournaments" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.055] px-6 py-3.5 text-sm font-black text-silver hover:border-white/25 hover:bg-white/[0.08]">
                  View tournaments
                </Link>
              </div>
              <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                {[
                  { label: "Roster", value: data.players.length },
                  { label: "Sessions", value: data.trainingSessions.length },
                  { label: "Trophies", value: achievements.length },
                ].map((item) => (
                  <div key={item.label} className="machine-card p-4">
                    <div className="metric-nums text-3xl font-black text-silver">{String(item.value).padStart(2, "0")}</div>
                    <div className="mt-1 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-silver-muted">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="motion-rise lg:pl-4">
              <div className="machine-panel p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="machine-section-label">Next competition</div>
                    <h2 className="mt-3 text-2xl font-black text-silver sm:text-3xl">{nextTournament?.name ?? "Season calendar"}</h2>
                    <p className="mt-1 text-sm text-silver-muted">{nextTournament?.location ?? "Young Machine HQ"}</p>
                  </div>
                  <StatusBadge tone="silver">{nextTournament?.status ?? "Draft"}</StatusBadge>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <MachineStat label="Start" value={nextTournament?.start ?? "TBC"} />
                  <MachineStat label="End" value={nextTournament?.end ?? "TBC"} />
                  <MachineStat label="Mode" value="Precision" />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {featured.map((player) => (
                    <div key={player.id} className="machine-card p-3 text-center transition hover:border-cyan/35">
                      <PlayerAvatar name={player.name} hue={player.avatarHue} size={46} className="mx-auto rounded-xl" />
                      <div className="mt-3 truncate text-sm font-black">{player.name}</div>
                      <div className="metric-nums text-xs text-silver-muted">#{player.jersey} / {player.position}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center gap-2 text-sm font-black text-silver">
                    <Zap className="h-4 w-4 text-cyan" />
                    Active training block
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-white/10">
                    <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-silver-muted via-silver to-cyan" />
                  </div>
                  <div className="mt-2 text-xs text-silver-muted">Speed, handlers, sideline pressure, recovery.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        {[
          { icon: Target, title: "Precision training", body: "Weekly blocks are planned like a system: throws, cuts, defense, recovery, and match timing." },
          { icon: Users, title: "Connected roster", body: "Players, roles, attendance, tournament selection, and team lineups stay visible for coaches." },
          { icon: Zap, title: "Performance loop", body: "Fitness, workouts, injuries, stats, and submissions are tracked without slowing the squad down." },
        ].map((item) => (
          <div key={item.title} className="panel panel-hover p-6">
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.055] text-cyan">
              <item.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-xl font-black">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-silver-muted">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="machine-section-label">Roster preview</div>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Public squad cards</h2>
          </div>
          <Link to="/players" className="text-sm font-black text-cyan hover:text-silver">All players</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((player) => (
            <div key={player.id} className="panel panel-hover p-5">
              <div className="flex items-start justify-between gap-3">
                <PlayerAvatar name={player.name} hue={player.avatarHue} size={56} className="rounded-xl" />
                <div className="metric-nums text-3xl font-black text-silver-muted">#{player.jersey}</div>
              </div>
              <div className="mt-5 font-black">{player.name}</div>
              <div className="text-xs text-silver-muted">{player.position}</div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <MachineTinyStat label="SCR" value={player.score} />
                <MachineTinyStat label="AST" value={player.assist} />
                <MachineTinyStat label="BLK" value={player.blocks} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.72fr] lg:px-8">
        <div className="panel p-6 sm:p-8">
          <div className="machine-section-label">Tournament system</div>
          <h2 className="mt-3 text-3xl font-black">{nextTournament?.name ?? "Tournament schedule"}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-silver-muted">{nextTournament?.description ?? "Upcoming competition details will appear here."}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MachineStat label="Location" value={nextTournament?.location ?? "TBC"} />
            <MachineStat label="Start" value={nextTournament?.start ?? "TBC"} />
            <MachineStat label="End" value={nextTournament?.end ?? "TBC"} />
            <MachineStat label="Status" value={nextTournament?.status ?? "Draft"} />
          </div>
        </div>
        <div className="panel p-6 sm:p-8">
          <div className="flex items-center gap-2 text-silver">
            <Trophy className="h-5 w-5 text-cyan" />
            <h2 className="text-xl font-black">Recent achievements</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {achievements.slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="machine-card p-4">
                <div className="font-black">{achievement.title}</div>
                <div className="mt-1 text-xs text-silver-muted">{achievement.date}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="machine-section-label">Gallery signal</div>
            <h2 className="mt-3 text-3xl font-black">From the field</h2>
          </div>
          <Link to="/gallery" className="text-sm font-black text-cyan hover:text-silver">Open gallery</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {galleryPhotos.slice(0, 8).map((image, index) => (
            <div key={image.id} className="panel panel-hover aspect-square p-0">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#202124,#0b0b0c_54%,#151517)]" />
              <div className="absolute inset-0 opacity-70 scanlines" />
              <div className="absolute inset-3 rounded-lg border border-white/10" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="font-mono text-[10px] font-black uppercase tracking-[0.14em] text-cyan">Frame {String(index + 1).padStart(2, "0")}</div>
                <div className="mt-1 truncate text-sm font-black">{image.caption}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="machine-panel cyber-scan p-8 sm:p-12">
          <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <div className="machine-section-label">Join the system</div>
              <h2 className="mt-3 text-3xl font-black sm:text-5xl">Ready to run with the machine?</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-silver-muted">Tryouts, tournament invites, training questions, and club operations can start here.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/contact" className="inline-flex items-center justify-center rounded-xl border border-cyan/30 bg-cyan/10 px-6 py-3.5 text-sm font-black text-cyan">
                Contact the club
              </Link>
              <Link to="/about" className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.055] px-6 py-3.5 text-sm font-black">
                Read the club story
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function MachineStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="machine-card p-3">
      <div className="font-mono text-[10px] font-black uppercase tracking-[0.14em] text-silver-muted">{label}</div>
      <div className="mt-2 truncate text-sm font-black text-silver">{value}</div>
    </div>
  );
}

function MachineTinyStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-2">
      <div className="metric-nums text-sm font-black text-silver">{value}</div>
      <div className="font-mono text-[9px] text-silver-muted">{label}</div>
    </div>
  );
}
