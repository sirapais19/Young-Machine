import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Mail, MapPin, Phone, Instagram } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact · Young Machine" }, { name: "description", content: "Get in touch with Young Machine — tryouts, tournaments, and questions." }]}),
  component: ContactPage,
});

function ContactPage() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-cyan">Contact</div>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold">Get in touch</h1>
        <p className="mt-3 max-w-xl text-silver-muted">Tryouts, tournament invites, sponsorship, or just want to say hi.</p>
      </section>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid gap-6 lg:grid-cols-3">
        <form className="panel p-6 lg:col-span-2 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" placeholder="Your name" />
            <Field label="Email" placeholder="you@email.com" type="email" />
          </div>
          <Field label="Subject" placeholder="What is it about?" />
          <div>
            <label className="text-xs uppercase tracking-widest text-silver-muted">Message</label>
            <textarea rows={5} className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan/50 focus:bg-cyan/5" placeholder="Write your message…" />
          </div>
          <button type="button" className="w-full sm:w-auto rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground glow-cyan">Send message</button>
        </form>
        <div className="space-y-3">
          <InfoCard icon={Mail} label="Email" value="hello@youngmachine.club" />
          <InfoCard icon={Phone} label="Phone" value="+60 12 345 6789" />
          <InfoCard icon={MapPin} label="Location" value="USJ Field · Selangor" />
          <InfoCard icon={Instagram} label="Instagram" value="@youngmachine.ym" />
        </div>
      </section>
    </PublicLayout>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-silver-muted">{label}</label>
      <input {...props} className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan/50 focus:bg-cyan/5" />
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="panel p-4 flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan/10 text-cyan border border-cyan/25"><Icon className="h-4 w-4" /></div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-silver-muted">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}
