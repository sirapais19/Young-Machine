import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useAppData } from "@/hooks/useAppData";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: "Gallery | Young Machine" }, { name: "description", content: "Photos from Young Machine training, tournaments, and team moments." }] }),
  component: GalleryPage,
});

function GalleryPage() {
  const { data } = useAppData();
  const published = data.galleries.filter((gallery) => gallery.status === "Published");
  const images = data.galleryImages.filter((image) => published.some((gallery) => gallery.id === image.galleryId));
  return (
    <PublicLayout>
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="text-xs font-semibold text-cyan">On the field</div>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">Gallery</h1>
      </section>
      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 sm:px-6 md:grid-cols-3 lg:grid-cols-4 lg:px-8">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="panel-hover relative aspect-square overflow-hidden rounded-xl"
            style={{ background: `linear-gradient(135deg, oklch(0.32 0.06 ${180 + index * 12}), oklch(0.15 0.02 ${180 + index * 12}))` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <div className="text-sm font-bold">{image.caption}</div>
              <div className="text-[10px] font-semibold text-cyan">{image.date}</div>
            </div>
          </div>
        ))}
      </section>
    </PublicLayout>
  );
}
