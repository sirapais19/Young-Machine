import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { useAppData } from "@/hooks/useAppData";

export const Route = createFileRoute("/players")({
  head: () => ({
    meta: [
      { title: "Players | Young Machine" },
      { name: "description", content: "Meet the Young Machine roster: handlers, cutters, hybrids, and defenders." },
    ],
  }),
  component: PlayersPage,
});

function PlayersPage() {
  const { data } = useAppData();
  const publicPlayers = data.players.filter((player) => player.isPublic);
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="text-xs font-semibold text-cyan">Roster</div>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">The Players</h1>
        <p className="mt-3 max-w-2xl text-silver-muted">{publicPlayers.length} athletes wearing the YM cyan.</p>
      </section>
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8 xl:grid-cols-4">
        {publicPlayers.map((player) => (
          <div key={player.id} className="panel panel-hover p-5">
            <div className="flex items-center justify-between">
              <PlayerAvatar name={player.name} hue={player.avatarHue} size={64} />
              <div className="metric-nums text-4xl font-black text-cyan/70">#{player.jersey}</div>
            </div>
            <div className="mt-4">
              <div className="text-lg font-bold">{player.name}</div>
              <div className="text-xs font-semibold text-silver-muted">{player.position}</div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 border-t border-white/10 pt-4 text-center">
              <Mini label="SCR" value={player.score} />
              <Mini label="AST" value={player.assist} />
              <Mini label="BLK" value={player.blocks} />
              <Mini label="ATT" value={`${player.attendance}%`} />
            </div>
          </div>
        ))}
      </section>
    </PublicLayout>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="metric-nums text-sm font-bold text-foreground">{value}</div>
      <div className="text-[10px] text-silver-muted">{label}</div>
    </div>
  );
}
