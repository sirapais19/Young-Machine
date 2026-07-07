import { createFileRoute } from "@tanstack/react-router";
import { InjuriesManagerPage } from "@/components/app/PrototypePages";

export const Route = createFileRoute("/dashboard/injuries")({
  head: () => ({ meta: [{ title: "Injury Records | YM" }, { name: "robots", content: "noindex" }] }),
  component: InjuriesManagerPage,
});
