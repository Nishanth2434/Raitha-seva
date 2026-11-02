import { createFileRoute } from "@tanstack/react-router";
import { PestPage } from "./pest";

export const Route = createFileRoute("/pest-alerts")({
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
  component: PestPage,
});
