import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { readAuthUserForGuard } from "@/store/AuthProvider";

export const Route = createFileRoute("/player")({
  beforeLoad: async () => {
    const user = await readAuthUserForGuard();
    if (!user) throw redirect({ to: "/login" });
    if (user.role === "coach" || user.role === "manager") throw redirect({ to: "/dashboard" });
  },
  component: () => <Outlet />,
});
