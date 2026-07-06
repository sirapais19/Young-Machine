import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PlayerAvatar } from "@/components/ym/Avatar";
import { Mail } from "lucide-react";
import { staff } from "@/data/mockData";

export const Route = createFileRoute("/coaches")({
  head: () => ({ meta: [{ title: "Coaches & Management · Young Machine" }, { name: "description", content: "Meet the coaching staff and management team behind Young Machine." }]}),
  component: () => (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-cyan">Staff</div>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold">Coach & Management</h1>
      </section>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 grid gap-6 sm:grid-cols-2">
        {staff.map((s) => (
          <div key={s.id} className="panel panel-hover p-6">
            <div className="flex items-center gap-4">
              <PlayerAvatar name={s.name} hue={200} size={64} />
              <div>
                <div className="text-xl font-semibold">{s.name}</div>
                <div className="text-xs uppercase tracking-widest text-cyan">{s.role}</div>
              </div>
            </div>
            <p className="mt-4 text-silver-muted">{s.bio}</p>
            <div className="mt-4 flex items-center gap-2 text-sm text-silver-muted">
              <Mail className="h-4 w-4 text-cyan" /> {s.email}
            </div>
          </div>
        ))}
      </section>
    </PublicLayout>
  ),
});
