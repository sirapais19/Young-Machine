import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Trophy } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";

export const Route = createFileRoute("/achievements")({
  head: () => ({ meta: [{ title: "Achievements | Young Machine" }, { name: "description", content: "Trophies, podium finishes, and honours." }] }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const { data } = useAppData();
  const published = data.achievements.filter((achievement) => achievement.status === "Published");
  return (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="text-xs font-semibold text-cyan">Silverware</div>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">Achievements</h1>
      </section>
      <section className="mx-auto grid max-w-5xl gap-4 px-4 sm:px-6 lg:px-8">
        {published.map((achievement) => (
          <div key={achievement.id} className="panel panel-hover flex items-start gap-5 p-6">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-cyan/25 bg-cyan/10 text-cyan">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-bold">{achievement.title}</div>
              <div className="mt-1 text-xs text-silver-muted">{achievement.date}</div>
              <p className="mt-2 text-sm text-silver">{achievement.description}</p>
            </div>
          </div>
        ))}
      </section>
    </PublicLayout>
  );
}
