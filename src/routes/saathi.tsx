import { createFileRoute } from "@tanstack/react-router";
import { OnboardingPage } from "./onboarding";
import { requireAuth } from "@/lib/auth-guard";
import { AuthGuard } from "@/components/auth/AuthGuard";

export const Route = createFileRoute("/saathi")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "ರೈತ ಸೇವಾ ಸಾಥಿ | Raitha Seva Saathi — Customer Care & Welcome" },
      {
        name: "description",
        content:
          "ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರರೇ! ರೈತ ಸೇವಾಕ್ಕೆ ಸ್ವಾಗತ. ನಿಮ್ಮ ಕೃಷಿ ಕೆಲಸಗಳಿಗೆ ನಾವು ಸಹಾಯ ಮಾಡುತ್ತೇವೆ.",
      },
    ],
  }),
  component: () => (
    <AuthGuard>
      <OnboardingPage />
    </AuthGuard>
  ),
});
