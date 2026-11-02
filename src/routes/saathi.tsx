import { createFileRoute } from "@tanstack/react-router";
import { OnboardingPage } from "./onboarding";

export const Route = createFileRoute("/saathi")({
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
  component: OnboardingPage,
});
