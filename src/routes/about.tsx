import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Target, Users, Zap, Heart } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | Young Machine" },
      { name: "description", content: "About Young Machine: mission, values, culture, and training philosophy." },
    ],
  }),
  component: About,
});

function About() {
  const { data } = useAppData();
  const page = (slug: string) => data.clubPages.find((item) => item.slug === slug)?.body;
  return (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="text-xs font-semibold text-cyan">About the club</div>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">We are Young Machine.</h1>
        <p className="mt-6 max-w-3xl text-lg text-silver-muted">{page("about")}</p>
      </section>
      <section className="mx-auto grid max-w-5xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
        {[
          { icon: Target, title: "Mission", body: page("mission") },
          { icon: Heart, title: "Values", body: page("values") },
          { icon: Users, title: "Culture", body: "One roster, one voice. Rookies and veterans train side by side. Everyone contributes to the system." },
          { icon: Zap, title: "Contact", body: page("contact") },
        ].map((block) => (
          <div key={block.title} className="panel panel-hover p-6">
            <div className="grid h-11 w-11 place-items-center rounded-lg border border-cyan/25 bg-cyan/10 text-cyan">
              <block.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-bold">{block.title}</h3>
            <p className="mt-2 text-silver-muted">{block.body}</p>
          </div>
        ))}
      </section>
    </PublicLayout>
  );
}
