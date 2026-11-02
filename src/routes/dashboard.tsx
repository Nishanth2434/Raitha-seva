import { createFileRoute } from "@tanstack/react-router";
import { Index } from "./index";
import { requireAuth } from "@/lib/auth-guard";
import { AuthGuard } from "@/components/auth/AuthGuard";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ | Raitha Seva Farmer Dashboard" },
      {
        name: "description",
        content:
          "ರೈತ ಸೇವಾ ಕೃಷಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್. ಹವಾಮಾನ, ಬೆಳೆ ರೋಗ ಎಚ್ಚರಿಕೆ, ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು ಮತ್ತು ಎಐ ಕೃಷಿ ಸಹಾಯಕ.",
      },
    ],
  }),
  component: () => (
    <AuthGuard>
      <Index />
    </AuthGuard>
  ),
});
