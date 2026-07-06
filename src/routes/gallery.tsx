import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { galleryPhotos } from "@/data/mockData";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: "Gallery · Young Machine" }, { name: "description", content: "Photos from Young Machine training, tournaments, and team moments." }]}),
  component: () => (
    <PublicLayout>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-cyan">On the field</div>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold">Gallery</h1>
      </section>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {galleryPhotos.map((g) => (
          <div key={g.id} className="aspect-square rounded-xl relative overflow-hidden panel-hover"
               style={{ background: `linear-gradient(135deg, oklch(0.32 0.06 ${g.hue}), oklch(0.15 0.02 ${g.hue}))` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <div className="text-sm font-semibold">{g.caption}</div>
              <div className="text-[10px] uppercase tracking-widest text-cyan">{g.date}</div>
            </div>
          </div>
        ))}
      </section>
    </PublicLayout>
  ),
});
