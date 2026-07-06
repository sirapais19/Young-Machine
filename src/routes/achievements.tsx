import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Trophy } from "lucide-react";
import { achievements } from "@/data/mockData";

export const Route = createFileRoute("/achievements")({
  head: () => ({ meta: [{ title: "Achievements · Young Machine" }, { name: "description", content: "Trophies, podium finishes, and honours." }]}),
  component: () => (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-cyan">Silverware</div>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold">Achievements</h1>
      </section>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 grid gap-4">
        {achievements.map((a) => (
          <div key={a.id} className="panel panel-hover p-6 flex gap-5 items-start">
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-cyan/10 text-cyan border border-cyan/25 shrink-0">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-semibold">{a.title}</div>
              <div className="text-xs text-silver-muted mt-1">{a.date}</div>
              <p className="mt-2 text-sm text-silver">{a.description}</p>
            </div>
          </div>
        ))}
      </section>
    </PublicLayout>
  ),
});
