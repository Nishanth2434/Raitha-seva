import { createFileRoute } from "@tanstack/react-router";
import { PestPage } from "./pest";
import { requireAuth } from "@/lib/auth-guard";
import { AuthGuard } from "@/components/auth/AuthGuard";

export const Route = createFileRoute("/pest-alerts")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "ಕೀಟ ಮತ್ತು ರೋಗ ಎಚ್ಚರಿಕೆಗಳು | Raitha Seva Pest & Disease Alerts" },
      {
        name: "description",
        content:
          "ಬೆಳೆ ರೋಗ ಮತ್ತು ಕೀಟ ಬಾಧೆ ಎಚ್ಚರಿಕೆಗಳು. AI ಮೂಲಕ ರೋಗ ಪತ್ತೆ ಮತ್ತು ಸುರಕ್ಷಿತ ಪರಿಹಾರ.",
      },
    ],
  }),
  component: () => (
    <AuthGuard>
      <PestPage />
    </AuthGuard>
  ),
});
