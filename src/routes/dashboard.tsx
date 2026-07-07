import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { readAuthUserForGuard } from "@/store/AuthProvider";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const user = await readAuthUserForGuard();
    if (!user) throw redirect({ to: "/login" });
    if (user.role === "player") throw redirect({ to: "/player/dashboard" });
  },
  component: () => <Outlet />,
});
