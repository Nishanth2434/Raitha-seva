import { createFileRoute } from "@tanstack/react-router";
import { MarketPage } from "./market";

export const Route = createFileRoute("/market-prices")({
  head: () => ({
    meta: [
      { title: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಮಾಹಿತಿ | Raitha Seva APMC Mandi Prices" },
      {
        name: "description",
        content:
          "ಮಂಡ್ಯ ಮತ್ತು ಕರ್ನಾಟಕದ ಎಪಿಎಂಸಿ ಮಂಡಿ ಬೆಲೆಗಳು, ಭತ್ತ, ರಾಗಿ, ಬೆಲ್ಲ, ತರಕಾರಿಗಳ ದರಗಳು.",
      },
    ],
  }),
  component: MarketPage,
});
