import { createFileRoute } from "@tanstack/react-router";
import { Index } from "./index";

export const Route = createFileRoute("/dashboard")({
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
  component: Index,
});
