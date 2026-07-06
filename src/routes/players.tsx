import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { players } from "@/data/mockData";

export const Route = createFileRoute("/players")({
  head: () => ({ meta: [
    { title: "Players · Young Machine" },
    { name: "description", content: "Meet the Young Machine roster — handlers, cutters, and hybrids." },
  ]}),
  component: PlayersPage,
});

function PlayersPage() {
  const publicPlayers = players.filter(p => p.isPublic);
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-cyan">Roster</div>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold">The Players</h1>
        <p className="mt-3 max-w-2xl text-silver-muted">{publicPlayers.length} athletes wearing the YM cyan.</p>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {publicPlayers.map((p) => (
          <div key={p.id} className="panel panel-hover p-5">
            <div className="flex items-center justify-between">
              <PlayerAvatar name={p.name} hue={p.avatarHue} size={64} />
              <div className="text-4xl font-bold text-cyan/70">#{p.jersey}</div>
            </div>
            <div className="mt-4">
              <div className="text-lg font-semibold">{p.name}</div>
              <div className="text-xs text-silver-muted uppercase tracking-widest">{p.position}</div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center border-t border-white/5 pt-4">
              <div><div className="text-sm font-bold text-foreground">{p.score}</div><div className="text-[10px] text-silver-muted">SCR</div></div>
              <div><div className="text-sm font-bold text-foreground">{p.assist}</div><div className="text-[10px] text-silver-muted">AST</div></div>
              <div><div className="text-sm font-bold text-foreground">{p.blocks}</div><div className="text-[10px] text-silver-muted">BLK</div></div>
              <div><div className="text-sm font-bold text-foreground">{p.attendance}%</div><div className="text-[10px] text-silver-muted">ATT</div></div>
            </div>
          </div>
        ))}
      </section>
    </PublicLayout>
  );
}
