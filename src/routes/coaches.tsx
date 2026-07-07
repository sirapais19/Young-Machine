import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { Mail } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";

export const Route = createFileRoute("/coaches")({
  head: () => ({ meta: [{ title: "Coaches & Management | Young Machine" }, { name: "description", content: "Meet the coaching staff and management team behind Young Machine." }] }),
  component: CoachesPage,
});

function CoachesPage() {
  const { data } = useAppData();
  const contact = data.clubPages.find((page) => page.slug === "contact");
  const staff = [
    {
      id: "coach",
      name: "Young Machine Coaching Unit",
      role: "Coach",
      email: "coach@youngmachine.club",
      bio: "Training design, match preparation, and player development for the current roster.",
    },
    {
      id: "manager",
      name: "Young Machine Management",
      role: "Manager",
      email: "manager@youngmachine.club",
      bio: contact?.body ?? "Operations, scheduling, tournament logistics, and club communications.",
    },
  ];

  return (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="text-xs uppercase tracking-[0.2em] text-cyan">Staff</div>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Coach & Management</h1>
      </section>
      <section className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:px-8">
        {staff.map((person) => (
          <div key={person.id} className="panel panel-hover p-6">
            <div className="flex items-center gap-4">
              <PlayerAvatar name={person.name} hue={200} size={64} />
              <div>
                <div className="text-xl font-semibold">{person.name}</div>
                <div className="text-xs uppercase tracking-widest text-cyan">{person.role}</div>
              </div>
            </div>
            <p className="mt-4 text-silver-muted">{person.bio}</p>
            <div className="mt-4 flex items-center gap-2 text-sm text-silver-muted">
              <Mail className="h-4 w-4 text-cyan" />
              {person.email}
            </div>
          </div>
        ))}
      </section>
    </PublicLayout>
  );
}
