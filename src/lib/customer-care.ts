/**
 * Customer Care Configuration for Raitha Seva AI.
 * Temporary helpline for farmer onboarding & technical assistance.
 */

export const CUSTOMER_CARE_CONFIG = {
  // Configurable via env var VITE_CUSTOMER_CARE_PHONE, defaulting to 6360997180
  rawPhone:
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_CUSTOMER_CARE_PHONE"]) ||
    "6360997180",
  countryCode: "+91",
  get formattedPhone(): string {
    return `${this.countryCode} ${this.rawPhone}`;
  },
  get telLink(): string {
    return `tel:${this.countryCode}${this.rawPhone}`;
  },
  get whatsappLink(): string {
    const text = encodeURIComponent(
      "ನಮಸ್ಕಾರ, ನನಗೆ ರೈತ ಸೇವಾ ಅಪ್ಲಿಕೇಶನ್ ಬಗ್ಗೆ ಮಾಹಿತಿ ಮತ್ತು ಸಹಾಯ ಬೇಕು."
    );
    return `https://wa.me/91${this.rawPhone}?text=${text}`;
  },
  labelKn: "ತಾತ್ಕಾಲಿಕ ಗ್ರಾಹಕ ಸೇವೆ ಸಂಖ್ಯೆ",
  labelEn: "Temporary Customer Care Number",
  callButtonKn: "📞 ಗ್ರಾಹಕ ಸೇವೆಗೆ ಕರೆ ಮಾಡಿ",
  callButtonEn: "📞 Call Customer Care",
  whatsappButtonKn: "💬 WhatsApp ಮೂಲಕ ಸಂಪರ್ಕಿಸಿ",
  whatsappButtonEn: "💬 Contact via WhatsApp",
  copyButtonKn: "📋 ನಂಬರ್ ಕಾಪಿ ಮಾಡಿ",
  copyButtonEn: "📋 Copy Number",
  copiedKn: "ಸಂಖ್ಯೆಯನ್ನು ಕಾಪಿ ಮಾಡಲಾಗಿದೆ!",
  copiedEn: "Phone number copied!",
  skipButtonKn: "ಈಗಲೇ ಅಪ್ಲಿಕೇಶನ್ ಬಳಸಿ",
  skipButtonEn: "Proceed to App",
  disclaimerKn: "ಸೂಚನೆ: ಇದು ಉಚಿತ ಸಂಖ್ಯೆಯಲ್ಲ. ನಿಮ್ಮ ಮೊಬೈಲ್ ಆಪರೇಟರ್‌ನ ಸಾಮಾನ್ಯ ಕರೆ ದರಗಳು ಅನ್ವಯಿಸುತ್ತವೆ.",
  disclaimerEn: "Note: Standard carrier call charges may apply.",
  whatsappNoteKn: "ಗಮನಿಸಿ: WhatsApp ಬಳಕೆಗೆ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಮತ್ತು ಸಕ್ರಿಯ WhatsApp ಖಾತೆ ಅಗತ್ಯವಿದೆ.",
  whatsappNoteEn: "Note: Internet connection and active WhatsApp account required.",
};
