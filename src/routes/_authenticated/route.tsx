import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth-guard";
import { AuthGuard } from "@/components/auth/AuthGuard";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AuthGuard>
      <Outlet />
    </AuthGuard>
  ),
});