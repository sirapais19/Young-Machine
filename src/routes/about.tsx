import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Target, Users, Zap, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · Young Machine" },
      { name: "description", content: "About Young Machine — mission, values, culture, and training philosophy." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="text-xs uppercase tracking-[0.2em] text-cyan">About the club</div>
        <h1 className="mt-3 text-4xl sm:text-6xl font-bold tracking-tight">We are Young Machine.</h1>
        <p className="mt-6 max-w-3xl text-lg text-silver-muted">
          A competitive Ultimate Frisbee club built on discipline, sports science, and team chemistry. We train like professionals and play like a family.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-2">
        {[
          { icon: Target, title: "Mission", body: "To develop elite Ultimate athletes and compete at the highest level of Malaysian and regional tournaments." },
          { icon: Heart, title: "Values",  body: "Respect. Grit. Spirit. Ownership. We lift teammates, and we finish what we start." },
          { icon: Users, title: "Culture", body: "One roster, one voice. Rookies and veterans train side-by-side. Everyone contributes to the system." },
          { icon: Zap,   title: "Philosophy", body: "Structured periodization, film review, and data-driven fitness. Every rep has a purpose." },
        ].map((b) => (
          <div key={b.title} className="panel panel-hover p-6">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyan/10 text-cyan border border-cyan/25">
              <b.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">{b.title}</h3>
            <p className="mt-2 text-silver-muted">{b.body}</p>
          </div>
        ))}
      </section>
    </PublicLayout>
  );
}
