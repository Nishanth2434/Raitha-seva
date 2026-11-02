import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useLanguage, languages, LanguageCode } from "@/context/language-context";
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Loader2,
  RefreshCw,
  MessageSquare,
  ChevronDown,
  Wheat,
  Bug,
  CloudRain,
  TrendingUp,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  PhoneCall,
  Phone,
  Headphones,
  CheckCircle2,
  Globe,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type AIAction = {
  type: "NAVIGATE" | "OPEN_CALL_SUPPORT";
  targetRoute?: string;
  buttonText: string;
  details?: {
    location?: string;
  };
};

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  language?: LanguageCode;
  action?: AIAction | undefined;
}

const trilingualData: Record<
  LanguageCode,
  {
    welcome: string;
    speechGreeting: string;
    placeholder: string;
    actionAckPrefix: string;
    connectionError: string;
    voiceUnavailable: string;
    micError: string;
    queryOptions: Array<{
      icon: any;
      label: string;
      route?: string;
      actionType: "NAVIGATE" | "OPEN_CALL_SUPPORT";
      queryText: string;
    }>;
  }
> = {
  en: {
    welcome:
      "Namaste! 🙏 Welcome to **KrishiMitra AI Assistant**.\n\nHow can I help you today? Please choose an option below or type your farming query:",
    speechGreeting:
      "Namaste! Welcome to KrishiMitra AI Assistant. How can I help you today? Please select an option or ask a question.",
    placeholder: "Ask in English, Kannada (ಕನ್ನಡ), or Hindi (हिन्दी)...",
    actionAckPrefix: "OK! Opening",
    connectionError: "Connection error. Please try again or call Kisan Call Centre 1800-180-1551.",
    voiceUnavailable: "English voice synthesis is not supported on this browser.",
    micError: "Could not capture voice. Please check microphone permissions.",
    queryOptions: [
      {
        icon: TrendingUp,
        label: "Check APMC Mandi Rates & Forecast",
        route: "/market",
        actionType: "NAVIGATE",
        queryText: "I want market prices",
      },
      {
        icon: CloudRain,
        label: "Check Weather & Rain Advisory",
        route: "/weather",
        actionType: "NAVIGATE",
        queryText: "Check weather forecast",
      },
      {
        icon: Bug,
        label: "Diagnose Crop Pest & Disease",
        route: "/pest-alerts",
        actionType: "NAVIGATE",
        queryText: "Diagnose crop pest disease",
      },
      {
        icon: Volume2,
        label: "Watch Agricultural Reels & Videos",
        route: "/reels",
        actionType: "NAVIGATE",
        queryText: "Watch farming reels",
      },
      {
        icon: PhoneCall,
        label: "Connect to Kisan Call Support (24x7)",
        actionType: "OPEN_CALL_SUPPORT",
        queryText: "Call expert support",
      },
    ],
  },
  kn: {
    welcome:
      "ನಮಸ್ಕಾರ! 🙏 **ಕೃಷಿಮಿತ್ರ ಎಐ ಕೃಷಿ ಸಹಾಯಕ**ಕ್ಕೆ ಸ್ವಾಗತ.\n\nನಿಮಗೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ? ಕೆಳಗಿನ ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ ಅಥವಾ ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ:",
    speechGreeting:
      "ನಮಸ್ಕಾರ! ಕೃಷಿಮಿತ್ರ ಎಐ ಸಹಾಯಕ್ಕೆ ಸ್ವಾಗತ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ? ಕೆಳಗಿನ ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ.",
    placeholder: "ಕನ್ನಡದಲ್ಲೇ ಕೇಳಿ (ಉದಾ: ರಾಗಿಯಲ್ಲಿ ಬೆಂಕಿ ರೋಗಕ್ಕೆ ಪರಿಹಾರವೇನು?)...",
    actionAckPrefix: "ಸರಿ! ತೆರೆಯಲಾಗುತ್ತಿದೆ",
    connectionError:
      "ಕ್ಷಮಿಸಿ, ಸಂಪರ್ಕದಲ್ಲಿ ತೊಂದರೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಮರುಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಕಿಸಾನ್ ಸಹಾಯವಾಣಿ 1800-180-1551 ಗೆ ಕರೆ ಮಾಡಿ.",
    voiceUnavailable: "ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಕನ್ನಡ ಧ್ವನಿ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಪಠ್ಯವನ್ನು ಓದಿ.",
    micError: "ಧ್ವನಿ ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ಪರಿಶೀಲಿಸಿ.",
    queryOptions: [
      {
        icon: TrendingUp,
        label: "ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಮಂಡಿ ಬೆಲೆಗಳನ್ನು ನೋಡಿ",
        route: "/market",
        actionType: "NAVIGATE",
        queryText: "ಮಾರುಕಟ್ಟೆ ದರಗಳನ್ನು ತಿಳಿಸಿ",
      },
      {
        icon: CloudRain,
        label: "ಹವಾಮಾನ ಮತ್ತು ಮಳೆ ಮುನ್ಸೂಚನೆ ವರದಿ",
        route: "/weather",
        actionType: "NAVIGATE",
        queryText: "ಹವಾಮಾನ ವರದಿ ತೋರಿಸಿ",
      },
      {
        icon: Bug,
        label: "ಬೆಳೆ ರೋಗ ಮತ್ತು ಕೀಟ ತಪಾಸಣೆ (ಕ್ರಿಮಿ ವೈದ್ಯ)",
        route: "/pest-alerts",
        actionType: "NAVIGATE",
        queryText: "ಕ್ರಿಮಿ ರೋಗ ಪರೀಕ್ಷೆ ಮಾಡಿ",
      },
      {
        icon: Volume2,
        label: "ಕೃಷಿ ವೀಡಿಯೊಗಳು ಮತ್ತು ರೀಲ್ಸ್ ವೀಕ್ಷಿಸಿ",
        route: "/reels",
        actionType: "NAVIGATE",
        queryText: "ಕೃಷಿ ವೀಡಿಯೊಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
      },
      {
        icon: PhoneCall,
        label: "ಕೃಷಿ ತಜ್ಞರ ಉಚಿತ ಕರೆ ಸಹಾಯ (24x7)",
        actionType: "OPEN_CALL_SUPPORT",
        queryText: "ಕರೆ ಸಹಾಯ ಪಡೆಯಿರಿ",
      },
    ],
  },
  hi: {
    welcome:
      "नमस्ते! 🙏 **कृषि मित्र एआई सहायक** में आपका स्वागत है।\n\nमैं आपकी क्या सहायता कर सकता हूँ? नीचे दिए गए विकल्प को चुनें या अपना कृषि प्रश्न पूछें:",
    speechGreeting:
      "नमस्ते! कृषि मित्र एआई में आपका स्वागत है। मैं आपकी क्या सहायता कर सकता हूँ? कृपया नीचे दिया गया विकल्प चुनें।",
    placeholder: "हिन्दी में पूछें (उदा: धान में झुलसा रोग का उपचार क्या है?)...",
    actionAckPrefix: "ठीक है! खोला जा रहा है",
    connectionError:
      "माफ कीजिए, नेटवर्क समस्या है। कृपया पुनः प्रयास करें या किसान हेल्पलाइन 1800-180-1551 पर संपर्क करें।",
    voiceUnavailable: "आपके ब्राउज़र में हिन्दी वॉइस उपलब्ध नहीं है। कृपया टेक्स्ट पढ़ें।",
    micError: "आवाज़ रिकॉर्ड नहीं हो सकी। कृपया माइक्रोफ़ोन अनुमति जांचें।",
    queryOptions: [
      {
        icon: TrendingUp,
        label: "मंडी भाव और बाजार रेट देखें",
        route: "/market",
        actionType: "NAVIGATE",
        queryText: "मंडी भाव देखना चाहते हैं",
      },
      {
        icon: CloudRain,
        label: "मौसम और बारिश पूर्वानुमान रिपोर्ट",
        route: "/weather",
        actionType: "NAVIGATE",
        queryText: "मौसम रिपोर्ट दिखाएं",
      },
      {
        icon: Bug,
        label: "फसल बीमारी जांच (कीट डॉक्टर)",
        route: "/pest-alerts",
        actionType: "NAVIGATE",
        queryText: "फसल की बीमारी जांचें",
      },
      {
        icon: Volume2,
        label: "कृषि रील और खेती वीडियो देखें",
        route: "/reels",
        actionType: "NAVIGATE",
        queryText: "कृषि रील देखना चाहते हैं",
      },
      {
        icon: PhoneCall,
        label: "किसान हेल्पलाइन / कॉल सपोर्ट (24x7)",
        actionType: "OPEN_CALL_SUPPORT",
        queryText: "किसान कॉल सपोर्ट",
      },
    ],
  },
};

function detectActionIntent(query: string, lang: LanguageCode = "en"): AIAction | undefined {
  const q = query.toLowerCase().trim();

  if (
    q.includes("weather") ||
    q.includes("rain") ||
    q.includes("forecast") ||
    q.includes("temperature") ||
    q.includes("monsoon") ||
    q.includes("ಹವಾಮಾನ") ||
    q.includes("ಮಳೆ") ||
    q.includes("मौसम") ||
    q.includes("बारिश")
  ) {
    return {
      type: "NAVIGATE",
      targetRoute: "/weather",
      buttonText:
        lang === "kn"
          ? "⛈️ ಹವಾಮಾನ ಪುಟ"
          : lang === "hi"
          ? "⛈️ मौसम पेज"
          : "⛈️ Weather Page",
    };
  }

  if (
    q.includes("pest") ||
    q.includes("disease") ||
    q.includes("photo") ||
    q.includes("diagnose") ||
    q.includes("doctor") ||
    q.includes("ಕ್ರಿಮಿ") ||
    q.includes("ರೋಗ") ||
    q.includes("कीट") ||
    q.includes("बीमारी")
  ) {
    return {
      type: "NAVIGATE",
      targetRoute: "/pest-alerts",
      buttonText:
        lang === "kn"
          ? "🐛 ಕೀಟ ಎಚ್ಚರಿಕೆ & ರೋಗ ಪುಟ"
          : lang === "hi"
          ? "🐛 कीट व रोग पेज"
          : "🐛 Pest Alerts Page",
    };
  }

  if (
    q.includes("mandi") ||
    q.includes("market") ||
    q.includes("price") ||
    q.includes("rate") ||
    q.includes("apmc") ||
    q.includes("ಮಾರುಕಟ್ಟೆ") ||
    q.includes("ದರ") ||
    q.includes("ಮಂಡಿ") ||
    q.includes("मंडी") ||
    q.includes("भाव")
  ) {
    return {
      type: "NAVIGATE",
      targetRoute: "/market",
      buttonText:
        lang === "kn"
          ? "💰 ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆ ದರಗಳು"
          : lang === "hi"
          ? "💰 मंडी भाव पेज"
          : "💰 APMC Mandi Rates",
    };
  }

  if (
    q.includes("reel") ||
    q.includes("video") ||
    q.includes("ರೀಲ್ಸ್") ||
    q.includes("ವೀಡಿಯೊ") ||
    q.includes("रील") ||
    q.includes("वीडियो")
  ) {
    return {
      type: "NAVIGATE",
      targetRoute: "/reels",
      buttonText:
        lang === "kn"
          ? "📹 ಕೃಷಿ ವೀಡಿಯೊಗಳು"
          : lang === "hi"
          ? "📹 कृषि वीडियो"
          : "📹 Farming Reels",
    };
  }

  if (
    q.includes("call") ||
    q.includes("helpline") ||
    q.includes("expert") ||
    q.includes("support") ||
    q.includes("callback") ||
    q.includes("ಕರೆ") ||
    q.includes("ಸಹಾಯ") ||
    q.includes("कॉल") ||
    q.includes("हेल्पलाइन")
  ) {
    return {
      type: "OPEN_CALL_SUPPORT",
      buttonText:
        lang === "kn"
          ? "📞 ಕಿಸಾನ್ ಕರೆ ಸಹಾಯ"
          : lang === "hi"
          ? "📞 किसान कॉल सपोर्ट"
          : "📞 Kisan Call Support",
    };
  }

  return undefined;
}

function getBestVoice(langCode: LanguageCode): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const prefix = langCode === "kn" ? "kn" : langCode === "hi" ? "hi" : "en";

  // 1. Exact dialect match (kn-IN, hi-IN, en-IN)
  const exact = voices.find(
    (v) => v.lang.toLowerCase().replace("_", "-") === `${prefix}-in`
  );
  if (exact) return exact;

  // 2. Language starts with prefix
  const prefixMatch = voices.find((v) =>
    v.lang.toLowerCase().startsWith(prefix)
  );
  if (prefixMatch) return prefixMatch;

  return null;
}

export function GeminiChatbot() {
  const navigate = useNavigate();
  const { language: authoritativeLang, setLanguage: setAuthoritativeLang, t } = useLanguage();

  // Initialize language selection state checking persistent local storage
  const [isLangSelected, setIsLangSelected] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("krishimitra_lang");
        return saved === "kn" || saved === "hi" || saved === "en";
      } catch {
        return false;
      }
    }
    return false;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isCallSupportOpen, setIsCallSupportOpen] = useState(false);
  const [callbackMobile, setCallbackMobile] = useState("");
  const [callbackRequested, setCallbackRequested] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const config = trilingualData[authoritativeLang] || trilingualData.en;
    return [
      {
        id: "msg-welcome-init",
        sender: "ai",
        text: config.welcome,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language: authoritativeLang,
      },
    ];
  });

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentRequestIdRef = useRef<number>(0);

  const langConfig = trilingualData[authoritativeLang] || trilingualData.en;

  // Update welcome message if language changed and conversation is at initial state
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1 && prev[0]?.id.startsWith("msg-welcome")) {
        const conf = trilingualData[authoritativeLang] || trilingualData.en;
        return [
          {
            id: `msg-welcome-${authoritativeLang}`,
            sender: "ai",
            text: conf.welcome,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            language: authoritativeLang,
          },
        ];
      }
      return prev;
    });
  }, [authoritativeLang]);

  function handleOpenChatbot() {
    setIsOpen(true);
    if (isCallSupportOpen) setIsCallSupportOpen(false);
  }

  const handleSelectLanguage = useCallback(
    (code: LanguageCode) => {
      // 1. Immediately update global authoritative state & persistence
      setAuthoritativeLang(code);
      setIsLangSelected(true);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("krishimitra_lang", code);
          localStorage.setItem("krishimitra_lang_selected", "true");
        } catch (e) {
          console.warn("Storage error:", e);
        }
      }

      // 2. Stop any existing voice synthesis
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setSpeakingMsgId(null);
      }

      // 3. Update welcome message and greet in selected language
      const config = trilingualData[code];
      const welcomeMsg: ChatMessage = {
        id: `msg-welcome-${code}-${Date.now()}`,
        sender: "ai",
        text: config.welcome,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language: code,
      };

      setMessages([welcomeMsg]);

      // 4. Voice greeting in selected language
      setTimeout(() => {
        speakText(config.speechGreeting, welcomeMsg.id, code);
      }, 300);

      toast.success(
        code === "kn"
          ? "ಆಯ್ಕೆಮಾಡಿದ ಭಾಷೆ: ಕನ್ನಡ (Kannada)"
          : code === "hi"
          ? "चयनित भाषा: हिन्दी (Hindi)"
          : "Selected Language: English"
      );
    },
    [setAuthoritativeLang]
  );

  function handleRequestCallback(e: React.FormEvent) {
    e.preventDefault();
    if (!callbackMobile.trim()) return;
    setCallbackRequested(true);
    toast.success(
      authoritativeLang === "kn"
        ? "ಕರೆ ವಿನಂತಿಯನ್ನು ಸ್ವೀಕರಿಸಲಾಗಿದೆ! ಕೃಷಿ ತಜ್ಞರು ಶೀಘ್ರದಲ್ಲೇ ನಿಮಗೆ ಕರೆ ಮಾಡಲಿದ್ದಾರೆ 📞"
        : authoritativeLang === "hi"
        ? "कॉलबैक अनुरोध प्राप्त हुआ! कृषि विशेषज्ञ जल्द ही आपसे संपर्क करेंगे 📞"
        : "Callback request received! An agri-expert will call you shortly 📞"
    );
    setTimeout(() => {
      setCallbackRequested(false);
      setCallbackMobile("");
      setIsCallSupportOpen(false);
    }, 2500);
  }

  function startListening() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(langConfig.micError);
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang =
        authoritativeLang === "kn" ? "kn-IN" : authoritativeLang === "hi" ? "hi-IN" : "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
        toast.info(
          authoritativeLang === "kn"
            ? "ಆಲಿಸಲಾಗುತ್ತಿದೆ... ಈಗ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ 🎙️"
            : authoritativeLang === "hi"
            ? "सुन रहे हैं... अब हिन्दी में बोलें 🎙️"
            : "Listening... speak now 🎙️"
        );
      };
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setInputValue(transcript);
      };
      recognition.onerror = () => {
        setIsListening(false);
        toast.error(langConfig.micError);
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  }

  function speakText(text: string, msgId: string, msgLang?: LanguageCode) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const targetLang = msgLang || authoritativeLang;
    const cleanText = text.replace(/[*#_`~]/g, "").trim();
    if (!cleanText) return;

    // Verify browser voice capability for Indic languages
    const matchingVoice = getBestVoice(targetLang);

    // If Kannada or Hindi requested but browser has neither matching voice nor native support
    if ((targetLang === "kn" || targetLang === "hi") && !matchingVoice) {
      // In Chromium / Android / Edge, kn-IN / hi-IN synth works even if getVoices() is empty on start.
      // But avoid speaking Kannada text using an English-only voice.
      const hasAnyIndicVoice = window.speechSynthesis
        .getVoices()
        .some((v) => v.lang.startsWith("kn") || v.lang.startsWith("hi"));
      if (window.speechSynthesis.getVoices().length > 0 && !hasAnyIndicVoice) {
        toast.info(
          targetLang === "kn"
            ? "ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಕನ್ನಡ ಧ್ವನಿ ಲಭ್ಯವಿಲ್ಲ. ಪಠ್ಯವನ್ನು ಓದಿ."
            : "आपके डिवाइस में हिन्दी वॉइस उपलब्ध नहीं है। कृपया टेक्स्ट पढ़ें।"
        );
        return;
      }
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang =
      targetLang === "kn" ? "kn-IN" : targetLang === "hi" ? "hi-IN" : "en-IN";
    if (matchingVoice) utterance.voice = matchingVoice;
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  }

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Action Navigation Confirmation
  function triggerOptionAction(route?: string, actionType?: string, actionLabel?: string) {
    const okId = `ai-action-${Date.now()}`;
    const targetLang = authoritativeLang;
    const conf = trilingualData[targetLang];

    const labelText = actionLabel || (route ? route.replace("/", "") : "Support");
    const ackText = `${conf.actionAckPrefix} ${labelText}...`;

    const okMsg: ChatMessage = {
      id: okId,
      sender: "ai",
      text: ackText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      language: targetLang,
    };

    setMessages((prev) => [...prev, okMsg]);
    speakText(ackText, okId, targetLang);
    toast.success(ackText);

    if (actionType === "OPEN_CALL_SUPPORT") {
      setIsCallSupportOpen(true);
    } else if (route) {
      setTimeout(() => {
        navigate({ to: route as any });
      }, 350);
    }
  }

  async function handleSendMessage(customMessage?: string) {
    const textToSend = (customMessage || inputValue).trim();
    if (!textToSend || isLoading) return;

    const targetLang = authoritativeLang; // Snapshot current authoritative language
    const currentRequestId = ++currentRequestIdRef.current;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      language: targetLang,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customMessage) setInputValue("");
    setIsLoading(true);

    const action = detectActionIntent(textToSend, targetLang);

    if (action) {
      setIsLoading(false);
      triggerOptionAction(action.targetRoute, action.type, action.buttonText);
      return;
    }

    try {
      const responseText = await fetchGeminiResponse(textToSend, messages, targetLang);

      // Verify request is still active and user did not switch language/abort
      if (currentRequestId !== currentRequestIdRef.current) {
        return; // Stale async response discarded
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language: targetLang,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      if (currentRequestId !== currentRequestIdRef.current) return;

      const fallback: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: "ai",
        text: langConfig.connectionError,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language: targetLang,
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      if (currentRequestId === currentRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }

  function formatMarkdown(text: string) {
    return text;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {isOpen && (
        <Card className="pointer-events-auto mb-3 flex h-[540px] w-[385px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex flex-col border-b border-white/10 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 p-3.5 px-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-white/20">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm">
                    {authoritativeLang === "kn"
                      ? "ಕೃಷಿಮಿತ್ರ ಎಐ"
                      : authoritativeLang === "hi"
                      ? "कृषि मित्र एआई"
                      : "KrishiMitra AI"}
                  </h3>
                  <p className="text-[10px] text-green-100/90 font-medium">
                    {authoritativeLang === "kn"
                      ? "ತ್ರಿಭಾಷಾ ಕೃಷಿ ಸಹಾಯಕ"
                      : authoritativeLang === "hi"
                      ? "त्रिभाषी किसान सहायक"
                      : "Trilingual Farming Assistant"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Language Switcher Bar */}
            {isLangSelected && (
              <div className="mt-2 flex items-center justify-between border-t border-white/15 pt-1.5 text-[10px]">
                <span className="flex items-center gap-1 font-semibold text-green-100">
                  <Globe className="h-3 w-3 text-amber-300" />
                  {authoritativeLang === "kn" ? "ಭಾಷೆ:" : authoritativeLang === "hi" ? "भाषा:" : "Language:"}
                </span>
                <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-full">
                  <button
                    onClick={() => handleSelectLanguage("en")}
                    className={`rounded-full px-2 py-0.5 font-bold transition-all cursor-pointer ${
                      authoritativeLang === "en"
                        ? "bg-white text-green-800 shadow-xs"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    🇬🇧 EN
                  </button>
                  <button
                    onClick={() => handleSelectLanguage("kn")}
                    className={`rounded-full px-2 py-0.5 font-bold transition-all cursor-pointer ${
                      authoritativeLang === "kn"
                        ? "bg-white text-green-800 shadow-xs"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    🇮🇳 ಕನ್ನಡ
                  </button>
                  <button
                    onClick={() => handleSelectLanguage("hi")}
                    className={`rounded-full px-2 py-0.5 font-bold transition-all cursor-pointer ${
                      authoritativeLang === "hi"
                        ? "bg-white text-green-800 shadow-xs"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    🇮🇳 हिन्दी
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SCREEN 1: Mandatory Language Selector Overlay on first launch */}
          {!isLangSelected ? (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-emerald-50/50 via-white to-gray-50/80">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-green-600 to-teal-600 text-white shadow-lg shadow-green-600/30 mb-4 animate-bounce">
                <Globe className="h-7 w-7" />
              </div>
              <h4 className="font-extrabold text-gray-900 text-base mb-1">Select Language</h4>
              <p className="text-xs text-gray-700 mb-1 font-semibold">ದಯವಿಟ್ಟು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ</p>
              <p className="text-xs text-gray-500 mb-6">कृपया अपनी भाषा चुनें</p>

              <div className="w-full space-y-2.5">
                <button
                  onClick={() => handleSelectLanguage("en")}
                  className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white p-3.5 px-4 font-bold text-xs text-gray-800 shadow-xs hover:border-green-500 hover:bg-green-50/70 hover:text-green-900 transition-all group cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">🇬🇧</span> English
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => handleSelectLanguage("kn")}
                  className="flex w-full items-center justify-between rounded-2xl border border-emerald-300 bg-emerald-50/50 p-3.5 px-4 font-bold text-xs text-emerald-950 shadow-xs hover:border-green-600 hover:bg-emerald-100 transition-all group cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">🇮🇳</span> ಕನ್ನಡ (Kannada)
                  </span>
                  <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => handleSelectLanguage("hi")}
                  className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white p-3.5 px-4 font-bold text-xs text-gray-800 shadow-xs hover:border-green-500 hover:bg-green-50/70 hover:text-green-900 transition-all group cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">🇮🇳</span> हिन्दी (Hindi)
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* SCREEN 2: Chat Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gray-50/40">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${
                      msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-white shadow-2xs ${
                        msg.sender === "user"
                          ? "bg-green-600"
                          : "bg-emerald-700 ring-2 ring-emerald-200"
                      }`}
                    >
                      {msg.sender === "user" ? (
                        <User className="h-3.5 w-3.5" />
                      ) : (
                        <Bot className="h-3.5 w-3.5" />
                      )}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-[20px] px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                        msg.sender === "user"
                          ? "bg-green-600 text-white rounded-tr-xs font-medium"
                          : "bg-white text-gray-800 border border-gray-100 rounded-tl-xs"
                      }`}
                    >
                      <div className="whitespace-pre-line font-sans">{formatMarkdown(msg.text)}</div>

                      {/* Interactive Action Query Option Buttons inside welcome message */}
                      {msg.id.startsWith("msg-welcome") && (
                        <div className="mt-3 grid grid-cols-1 gap-1.5 border-t border-gray-100 pt-2.5">
                          {langConfig.queryOptions.map((opt, idx) => {
                            const IconComp = opt.icon;
                            return (
                              <button
                                key={idx}
                                onClick={() =>
                                  triggerOptionAction(opt.route, opt.actionType, opt.label)
                                }
                                className="flex items-center justify-between rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-2 px-3 text-left text-[11px] font-bold text-emerald-950 hover:bg-emerald-600 hover:text-white transition-all group cursor-pointer"
                              >
                                <span className="flex items-center gap-2">
                                  <IconComp className="h-3.5 w-3.5 shrink-0 text-emerald-600 group-hover:text-white" />
                                  <span>{opt.label}</span>
                                </span>
                                <ArrowRight className="h-3 w-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-1.5 flex items-center justify-between border-t border-gray-100/60 pt-1">
                        <span
                          className={`text-[9px] ${
                            msg.sender === "user" ? "text-green-200" : "text-gray-400"
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                        {msg.sender === "ai" && (
                          <button
                            type="button"
                            onClick={() => speakText(msg.text, msg.id, msg.language)}
                            className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 hover:text-green-700 cursor-pointer"
                          >
                            {speakingMsgId === msg.id ? (
                              <>
                                <VolumeX className="h-3 w-3 text-red-600" />
                                <span className="text-red-600">
                                  {authoritativeLang === "kn"
                                    ? "ನಿಲ್ಲಿಸಿ"
                                    : authoritativeLang === "hi"
                                    ? "रोकें"
                                    : "Stop"}
                                </span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="h-3 w-3 text-green-700" />
                                <span>
                                  {authoritativeLang === "kn"
                                    ? "ಕೇಳಿ"
                                    : authoritativeLang === "hi"
                                    ? "सुनें"
                                    : "Listen"}
                                </span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-emerald-800">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-[11px] shadow-2xs">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-green-600" />
                      {authoritativeLang === "kn"
                        ? "ಚಿಂತಿಸುತ್ತಿದೆ..."
                        : authoritativeLang === "hi"
                        ? "विचार कर रहे हैं..."
                        : "Thinking..."}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div className="p-3 border-t bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-1.5 rounded-full border bg-gray-50/80 p-1.5 pl-4 focus-within:border-green-500"
                >
                  <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={langConfig.placeholder}
                    className="flex-1 bg-transparent text-xs text-gray-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={startListening}
                    className={`grid h-8 w-8 place-items-center rounded-full cursor-pointer transition-all ${
                      isListening
                        ? "bg-red-500 text-white animate-bounce"
                        : "text-gray-500 hover:text-green-600"
                    }`}
                    title={authoritativeLang === "kn" ? "ಧ್ವನಿ ಮೂಲಕ ಕೇಳಿ" : authoritativeLang === "hi" ? "बोलकर पूछें" : "Voice input"}
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="grid h-8 w-8 place-items-center rounded-full bg-green-600 text-white disabled:opacity-40 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Floating Action Buttons */}
      <div className="pointer-events-auto flex flex-col items-center gap-2.5">
        <button
          onClick={() => {
            setIsCallSupportOpen(!isCallSupportOpen);
            if (isOpen) setIsOpen(false);
          }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-xl hover:scale-110 active:scale-95 group relative cursor-pointer"
          aria-label="Kisan Call Support"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[9px] font-extrabold text-gray-900 ring-2 ring-white">
            📞
          </span>
          {isCallSupportOpen ? (
            <X className="h-5 w-5 text-white" />
          ) : (
            <PhoneCall className="h-5 w-5 text-white transition-transform group-hover:scale-110" />
          )}
        </button>

        <button
          onClick={handleOpenChatbot}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-green-600 via-emerald-600 to-teal-500 text-white shadow-2xl hover:scale-110 active:scale-95 group relative cursor-pointer"
          aria-label="Toggle Gemini AI Assistant"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-extrabold text-gray-900 ring-2 ring-white">
            AI
          </span>
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Bot className="h-7 w-7 text-white transition-transform group-hover:rotate-12" />
          )}
        </button>
      </div>

      {/* Kisan Call Support Modal Dialog */}
      {isCallSupportOpen && (
        <Card className="pointer-events-auto mb-3 flex w-[340px] flex-col overflow-hidden rounded-[28px] border border-amber-200 bg-white shadow-2xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-amber-800">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">
                  {authoritativeLang === "kn"
                    ? "ಕಿಸಾನ್ ಸಹಾಯವಾಣಿ"
                    : authoritativeLang === "hi"
                    ? "किसान हेल्पलाइन"
                    : "Kisan Support"}
                </h4>
                <p className="text-[10px] text-gray-500">24x7 Toll-Free Agri Care</p>
              </div>
            </div>
            <button
              onClick={() => setIsCallSupportOpen(false)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-amber-50/80 p-3.5 border border-amber-200/70 text-center">
              <p className="text-[10px] font-semibold text-amber-900 uppercase">
                {authoritativeLang === "kn"
                  ? "ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ ಸಂಖ್ಯೆ"
                  : authoritativeLang === "hi"
                  ? "किसान कॉल सेंटर नंबर"
                  : "National Kisan Call Centre"}
              </p>
              <a
                href="tel:18001801551"
                className="mt-1 block text-lg font-extrabold text-amber-800 hover:underline"
              >
                1800-180-1551
              </a>
              <span className="text-[9px] text-amber-700">Toll-Free (All Indian Languages)</span>
            </div>

            <form onSubmit={handleRequestCallback} className="space-y-2 pt-1">
              <label className="text-[10px] font-bold text-gray-700 block">
                {authoritativeLang === "kn"
                  ? "ತಜ್ಞರಿಂದ ಕಾಲ್‌ಬ್ಯಾಕ್ ಪಡೆಯಲು ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನೀಡಿ:"
                  : authoritativeLang === "hi"
                  ? "विशेषज्ञ कॉलबैक के लिए मोबाइल नंबर दर्ज करें:"
                  : "Request expert callback (enter mobile number):"}
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={callbackMobile}
                  onChange={(e) => setCallbackMobile(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-amber-500"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={callbackRequested || !callbackMobile.trim()}
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                >
                  {callbackRequested ? "✓ Sent" : "Request"}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Gemini API & Backend RAG Multi-Turn Call Function ───────────────────────

async function fetchGeminiResponse(
  userPrompt: string,
  history: ChatMessage[],
  lang: LanguageCode = "en"
): Promise<string> {
  const backendUrl = import.meta.env["VITE_BACKEND_API_URL"] || "http://127.0.0.1:8000";

  // 1. Try Raitha Seva Evidence-Grounded Backend RAG (ChromaDB + Multi-Crop POP)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const backendRes = await fetch(`${backendUrl}/api/assistant/ask/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: userPrompt,
        language: lang,
        region: "Mandya",
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (backendRes.ok) {
      const ragData = await backendRes.json();
      if (ragData.answer && ragData.answer.trim().length > 0) {
        return ragData.answer;
      }
    }
  } catch (backendErr) {
    // Backend offline / fallback to direct Gemini or local knowledge engine
  }

  const apiKey = import.meta.env["VITE_GEMINI_API_KEY"];

  const langInstruction =
    lang === "kn"
      ? "MANDATORY REQUIREMENT: Respond STRICTLY in authentic, grammatically correct Kannada script (ಕನ್ನಡ). Even if the user asks in English or conversation history has English, your ENTIRE advisory MUST be in Kannada script."
      : lang === "hi"
      ? "MANDATORY REQUIREMENT: Respond STRICTLY in authentic, grammatically correct Hindi script (हिन्दी). Even if the user asks in English or conversation history has English, your ENTIRE advisory MUST be in Hindi script."
      : "MANDATORY REQUIREMENT: Respond in clear, simple English.";

  const systemPromptText = `You are KrishiMitra AI — the expert, evidence-grounded conversational AI assistant for Indian farmers.
Your goal is to provide clear, simple, farmer-friendly answers.

${langInstruction}

Formatting Guidelines:
1. **Simple Direct Overview**: Warm 1-2 sentence direct explanation answering the main question.
2. **Detailed Actionable Breakdown**:
   - Step-by-step guide with bold section headers.
   - Real commercial spray remedies in India (e.g. Bayer Nativo, Coragen, Imidacloprid, Neem oil 1500ppm), exact spray ratios (0.5ml/L or 80g/acre), and split NPK fertilizer schedules.
3. **Smart Agri Tip & Prevention**: 2-3 practical field prevention tips.`;

  if (apiKey && apiKey.length > 5) {
    const modelsToTry = [
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
    ];

    const contentsHistory = history
      .filter((m) => !m.id.startsWith("msg-welcome"))
      .slice(-4)
      .map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text.substring(0, 250) }],
      }));

    contentsHistory.push({
      role: "user",
      parts: [{ text: userPrompt }],
    });

    for (const model of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: systemPromptText }],
              },
              contents: contentsHistory,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim().length > 0) return text;
        }
      } catch (e) {
        console.warn(`Gemini API call model ${model} failed:`, e);
      }
    }
  }

  // Dynamic Real-World Multilingual Agronomist AI Knowledge Synthesizer
  return generateDynamicAgriResponse(userPrompt, lang);
}

// ─── Dynamic Multilingual AI Synthesizer Engine ───────────────────────────────

function generateDynamicAgriResponse(query: string, preferredLang: LanguageCode = "en"): string {
  const q = query.toLowerCase().trim();

  // Strict enforcement: The explicitly selected language governs the response!
  const isKn = preferredLang === "kn";
  const isHi = preferredLang === "hi";

  // 1. CHILLI / MIRCHI SCENARIOS
  if (
    q.includes("chilli") ||
    q.includes("mirchi") ||
    q.includes("murda") ||
    q.includes("ಮೆಣಸಿನಕಾಯಿ") ||
    q.includes("मिर्च")
  ) {
    if (isKn) {
      return `🌶️ **ಮೆಣಸಿನಕಾಯಿ ಎಲೆ ಮುರುಟು ರೋಗ (ಮುರ್ದಾ ರೋಗ) ಸಂಪೂರ್ಣ ನಿಯಂತ್ರಣ ಮಾರ್ಗದರ್ಶಿ**

**ಸರಳ ಸಾರಾಂಶ:**
ಮೆಣಸಿನಕಾಯಿಯಲ್ಲಿ ಎಲೆ ಮುರುಟು ರೋಗವು (ಮುರ್ದಾ ರೋಗ) ಥ್ರಿಪ್ಸ್ ಮತ್ತು ನುಸಿ ಕೀಟಗಳಿಂದ ರಸ ಹೀರುವುದರಿಂದ ಉಂಟಾಗುತ್ತದೆ. ತಕ್ಷಣದ ಸಿಂಪಡಣೆಯು ಹೊಸ ಎಲೆಗಳ ಬೆಳವಣಿಗೆಯನ್ನು ಉತ್ತೇಜಿಸುತ್ತದೆ.

---

📋 **ಹಂತ-ಹಂತದ ಚಿಕಿತ್ಸಾ ಕ್ರಮ:**

1. **ಕೀಟ ನಾಶಕ ಸಿಂಪಡಣೆ**:
   • **ಡೆಲಿಗೇಟ್ (Spinetoram 11.7% SC)** @ 0.9 ಮಿಲಿ / ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.
   • ಅಥವಾ **ಪೆಗಾಸಸ್ (Diafenthiuron 50% WP)** @ 1.2 ಗ್ರಾಂ / ಲೀಟರ್ ನೀರಿಗೆ ಸಿಂಪಡಿಸಿ.
   • ತೀವ್ರ ನುಸಿ ಬಾಧೆಗೆ **ಅಬಾಮೆಕ್ಟಿನ್ 1.9% EC** @ 1 ಮಿಲಿ / ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.

2. **ಶಿಲೀಂಧ್ರ ನಾಶಕ ಸಿಂಪಡಣೆ**:
   • **ಅಮಿಸ್ಟಾರ್ ಟಾಪ್ (Amistar Top)** @ 1 ಮಿಲಿ / ಲೀಟರ್ ನೀರಿಗೆ ಸಿಂಪಡಿಸಿ.

3. **ಪೋಷಕಾಂಶಗಳ ಪೂರೈಕೆ**:
   • **19-19-19 ಎನ್‌ಪಿಕೆ** @ 5 ಗ್ರಾಂ / ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.

---

💡 **ಮುನ್ನೆಚ್ಚರಿಕೆ:**
• ಥ್ರಿಪ್ಸ್ ಕೀಟಗಳಿಗಾಗಿ ಹೊಲದಲ್ಲಿ **ನೀಲಿ ಜಿಗುಟು ಬೋರ್ಡ್‌ಗಳನ್ನು** (ಎಕರೆಗೆ 10) ಅಳವಡಿಸಿ.`;
    }

    if (isHi) {
      return `🌶️ **मिर्च लीफ कर्ल (मुरडा रोग) संपूर्ण नियंत्रण गाइड**

**सरल सारांश:**
मिर्च में पत्तियों का मुड़ना (मुरडा रोग) थ्रिप्स और मकोड़ों द्वारा रस चूसने से होता है। तुरंत छिड़काव से फसल सुरक्षित हो जाती है।

---

📋 **चरणबद्ध उपचार योजना:**

1. **कीटनाशक छिड़काव**:
   • **डेलिगेट (Spinetoram 11.7% SC)** @ 0.9 मिली/लीटर पानी में घोलकर छिड़कें।
   • या **पेगासस (Diafenthiuron 50% WP)** @ 1.2 ग्राम/लीटर छिड़कें।
   • गंभीर माइट समस्या में **एबामेक्टिन 1.9% EC** @ 1 मिली/लीटर छिड़कें।

2. **फंगल रोग नियंत्रण**:
   • **अमिस्टार टॉप (Amistar Top)** @ 1 मिली/लीटर पानी में मिलाकर छिड़कें।

3. **पोषण प्रबंधन**:
   • **19-19-19 NPK** @ 5 ग्राम/लीटर पानी में घोलकर छिड़कें।

---

💡 **विशेष सलाह:**
• थ्रिप्स नियंत्रण के लिए खेत में **नीले चिपचिपे कार्ड** (10 प्रति एकड़) लगाएं।`;
    }

    return `🌶️ **Chilli Leaf Curl & Murda Disease Detailed Treatment Guide**

**Simple Overview:**
Leaf curl in Chilli (Murda disease) is caused by Thrips and Mites sucking sap from under the leaves. Immediate spraying stops leaf distortion and restores plant growth.

---

📋 **Detailed Step-by-Step Action Plan:**

1. **For Thrips & Mites Sucking Control**:
   • Spray **Spinetoram 11.7% SC (Delegate)** @ 0.9 ml per liter of water OR **Diafenthiuron 50% WP (Pegasus)** @ 1.2 grams per liter.
   • For severe mite curling, spray **Abamectin 1.9% EC** @ 1 ml per liter.

2. **Fungal Mildew & Dieback Spray**:
   • Spray **Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Amistar Top)** @ 1 ml per liter.

3. **Nutritional Support**:
   • Spray **19-19-19 NPK** @ 5 grams per liter for rapid leaf recovery.

---

💡 **Pro Tips:**
• Hang **Blue Sticky Traps** (10/acre) specifically for thrips.`;
  }

  // 2. TOMATO SCENARIOS
  if (
    q.includes("tomato") ||
    q.includes("tamatar") ||
    q.includes("ಟೊಮೆಟೊ") ||
    q.includes("ಟೊಮ್ಯಾಟೊ") ||
    q.includes("टमाटर")
  ) {
    if (isKn) {
      return `🍅 **ಟೊಮೆಟೊ ಎಲೆ ಹಳದಿ ಮತ್ತು ಮುರುಟು ರೋಗ ಚಿಕಿತ್ಸೆ**

**ಸರಳ ಸಾರಾಂಶ:**
ಬಿಳಿ ನೊಣಗಳು ಹಳದಿ ಎಲೆ ವೈರಸ್ ಅನ್ನು ಹರಡುತ್ತವೆ, ಶಿಲೀಂಧ್ರಗಳಿಂದ ಬ್ಲೈಟ್ ಉಂಟಾಗುತ್ತದೆ. ತಕ್ಷಣವೇ ಕೀಟನಾಶಕ ಮತ್ತು ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸುವುದು ಅಗತ್ಯ.

---

📋 **ಚಿಕಿತ್ಸಾ ಕ್ರಮ:**
1. **ಕೀಟ ನಿಯಂತ್ರಣ**: **ಕಾನ್ಫಿಡಾರ್ (Imidacloprid 17.8% SL)** @ 0.5 ಮಿಲಿ / ಲೀಟರ್ ನೀರಿಗೆ ಸಿಂಪಡಿಸಿ.
2. **ಶಿಲೀಂಧ್ರ ರೋಗ ನಿಯಂತ್ರಣ**: **ಬಾಯರ್ ನೆಟಿವೋ (Nativo)** @ 0.8 ಗ್ರಾಂ / ಲೀಟರ್ ನೀರಿಗೆ ಸಿಂಪಡಿಸಿ.
3. **ಮುನ್ನೆಚ್ಚರಿಕೆ**: ಹಳದಿ ಜಿಗುಟು ಬೋರ್ಡ್‌ಗಳನ್ನು ಎಕರೆಗೆ 12 ಅಳವಡಿಸಿ.`;
    }

    if (isHi) {
      return `🍅 **टमाटर लीफ कर्ल और झुलसा रोग उपचार गाइड**

**सरल सारांश:**
सफेद मक्खी द्वारा फैलाए जाने वाले वायरस से पत्तियां पीली और मुड़ जाती हैं। 

---

📋 **छिड़काव शेड्यूलिंग:**
1. **कीट नियंत्रण**: **कॉन्फिडोर (Imidacloprid 17.8% SL)** @ 0.5 मिली/लीटर पानी में मिलाकर छिड़कें।
2. **फंगल रोग नियंत्रण**: **बायार नैटिवो (Nativo)** @ 0.8 ग्राम/लीटर छिड़कें।
3. **रोकथाम**: खेत में पीले चिपचिपे ट्रैप (12 प्रति एकड़) लगाएं।`;
    }

    return `🍅 **Tomato Yellow Leaf Curl & Blight Detailed Treatment Guide**

**Simple Overview:**
Yellow leaf curl is transmitted by Whiteflies, while brown water-soaked spots are Early/Late Blight fungal infections.

---

📋 **Detailed Action & Dosage Schedule:**
1. **Whitefly Eradication**: Spray **Imidacloprid 17.8% SL (Confidor)** @ 0.5 ml per liter of water.
2. **Fungal Blight Eradication**: Spray **Bayer Nativo (Tebuconazole + Trifloxystrobin)** @ 0.8 grams per liter.
3. **Prevention**: Install 12 Yellow Sticky Traps per acre.`;
  }

  // 3. PADDY / RICE SCENARIOS
  if (
    q.includes("paddy") ||
    q.includes("rice") ||
    q.includes("blast") ||
    q.includes("bph") ||
    q.includes("ಭತ್ತ") ||
    q.includes("धान")
  ) {
    if (isKn) {
      return `🌾 **ಭತ್ತದ ಬೆಂಕಿ ರೋಗ (Blast) & ಕಂದು ಜಿಗಿಹುಳು (BPH) ನಿರ್ವಹಣೆ**

**ಸರಳ ಸಾರಾಂಶ:**
ಭತ್ತದಲ್ಲಿ ಬೆಂಕಿ ರೋಗ (Pyricularia oryzae) ಮತ್ತು ಕಂದು ಜಿಗಿಹುಳು (BPH) ಇಳುವರಿಯನ್ನು ಕುಂಠಿತಗೊಳಿಸುತ್ತವೆ.

---

📋 **ಅಧಿಕೃತ ಶಿಫಾರಸು ಕ್ರಮಗಳು:**
1. **ಬೆಂಕಿ ರೋಗಕ್ಕೆ**: **ಟ್ರೈಸೈಕ್ಲೋಜೋಲ್ 75% WP (ಬೀಮ್)** @ 0.6 ಗ್ರಾಂ / ಲೀಟರ್ ಅಥವಾ **ಕಾರ್ಬೆಂಡಾಜಿಮ್ 50% WP** @ 1 ಗ್ರಾಂ / ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.
2. **ಕಂದು ಜಿಗಿಹುಳು (BPH)**: ಹೊಲದಲ್ಲಿನ ನೀರನ್ನು ಬಸಿದು, **ಟ್ರೈಫ್ಲುಮೆಜೋಪೈರಿಮ್ 10% SC (ಪೆಕ್ಸಲಾನ್)** @ 0.5 ಮಿಲಿ / ಲೀಟರ್ ಅಥವಾ **ಪೈಮೆಟ್ರೋಜೈನ್ 50% WG (ಚೆಸ್)** @ 0.6 ಗ್ರಾಂ / ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.
3. **ಗೊಬ್ಬರ ನಿರ್ವಹಣೆ**: ಸಾರಜನಕ (ಯೂರಿಯಾ) ಅಧಿಕವಾಗಿ ಹಾಕಬೇಡಿ, ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರವನ್ನು ಸಕಾಲದಲ್ಲಿ ನೀಡಿ.`;
    }

    if (isHi) {
      return `🌾 **धान में झुलसा (ब्लास्ट) और भूरा फुदका (BPH) नियंत्रण गाइड**

**सरल सारांश:**
धान में ब्लास्ट फफूंद से और भूरा फुदका (BPH) रस चूसने से भारी नुकसान पहुंचाते हैं।

---

📋 **आधिकारिक अनुशंसित कदम:**
1. **ब्लास्ट रोग के लिए**: **ट्राइसाइक्लाजोल 75% WP (बीम)** @ 0.6 ग्राम/लीटर या **कार्बेंडाजिम 50% WP** @ 1 ग्राम/लीटर का छिड़काव करें।
2. **भूरा फुदका (BPH)**: खेत से अतिरिक्त पानी निकालें और **पेक्सलॉन (Triflumezopyrim 10% SC)** @ 0.5 मिली/लीटर का छिड़काव करें।
3. **उर्वरक प्रबंधन**: यूरिया का अत्यधिक उपयोग न करें, पोटाश का उचित प्रयोग करें।`;
    }

    return `🌾 **Paddy Leaf Blast & Brown Plant Hopper (BPH) Management Guide**

**Simple Overview:**
Paddy blast (*Pyricularia oryzae*) and BPH hopper burn are major biotic threats in rice cultivation.

---

📋 **Recommended Action Plan:**
1. **For Blast Disease**: Spray **Tricyclazole 75% WP (Beam)** @ 0.6 g/liter OR **Carbendazim 50% WP** @ 1 g/liter.
2. **For Brown Plant Hopper (BPH)**: Drain excess field water. Spray **Triflumezopyrim 10% SC (Pexalon)** @ 0.5 ml/liter.
3. **Nutrient Management**: Avoid excessive nitrogen (Urea) and ensure recommended potash application.`;
  }

  // 4. RAGI SCENARIOS
  if (q.includes("ragi") || q.includes("millet") || q.includes("ರಾಗಿ") || q.includes("रागी")) {
    if (isKn) {
      return `🌾 **ರಾಗಿ ಬೆಳೆಯ ಬೆಂಕಿ ರೋಗ (Blast) ಹಾಗೂ ಅಧಿಕ ಇಳುವರಿ ಮಾರ್ಗದರ್ಶಿ**

**ಸರಳ ಸಾರಾಂಶ:**
ಮಂಡ್ಯ ಮತ್ತು ದಕ್ಷಿಣ ಕರ್ನಾಟಕದ ಮುಖ್ಯ ಆಹಾರ ಬೆಳೆಯಾದ ರಾಗಿಯಲ್ಲಿ ಎಲೆ ಬೆಂಕಿ ರೋಗ ಮತ್ತು ಕುತ್ತಿಗೆ ಬೆಂಕಿ ರೋಗ ಬಾಧೆ ತಡೆಯಲು ಅಧಿಕೃತ UASB ಶಿಫಾರಸುಗಳು ಇಲ್ಲಿವೆ.

---

📋 **ಶಿಫಾರಸು ಕ್ರಮಗಳು:**
1. **ಬೆಂಕಿ ರೋಗ ನಿಯಂತ್ರಣ**: **ಮ್ಯಾಂಕೋಜೆಬ್ 75% WP** @ 2 ಗ್ರಾಂ / ಲೀಟರ್ ಅಥವಾ **ಟ್ರೈಸೈಕ್ಲೋಜೋಲ್ 75% WP** @ 0.6 ಗ್ರಾಂ / ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.
2. **ರಸಗೊಬ್ಬರ**: ಎಕರೆಗೆ 40 kg ಯೂರಿಯಾ, 25 kg DAP ಮತ್ತು 15 kg ಪೊಟ್ಯಾಷ್ ಸಮತೋಲಿತವಾಗಿ ನೀಡಿ.
3. **ಸಲಹೆ**: ರೋಗ ನಿರೋಧಕ ತಳಿಗಳಾದ GPU-28, ಇಂದಾಫ್-8, ಅಥವಾ ML-365 ಬಳಸಿ.`;
    }

    if (isHi) {
      return `🌾 **रागी (मंडुआ) फसल में ब्लास्ट रोग व पोषण प्रबंधन**

**सरल सारांश:**
रागी में पत्ती और गर्दन का झुलसा रोग उपज को प्रभावित करता है। इसके नियंत्रण हेतु आधिकारिक उपाय निम्नलिखित हैं।

---

📋 **अनुशंसित कदम:**
1. **ब्लास्ट रोग के लिए**: **मैंकोजेब 75% WP** @ 2 ग्राम/लीटर या **ट्राइसाइक्लाजोल 75% WP** @ 0.6 ग्राम/लीटर का छिड़काव करें।
2. **उर्वरक प्रबंधन**: संतुलित NPK (40 किग्रा यूरिया + 25 किग्रा DAP + 15 किग्रा पोटाश प्रति एकड़) का प्रयोग करें।
3. **उन्नत किस्में**: रोग प्रतिरोधी किस्में (GPU-28, ML-365) अपनाएं।`;
    }

    return `🌾 **Ragi (Finger Millet) Blast Control & Agronomic Guide**

**Simple Overview:**
Finger millet blast (*Pyricularia grisea*) causes leaf and neck lesions. Timely protective fungicide spray is vital.

---

📋 **Recommended Action Plan:**
1. **Blast Control**: Spray **Mancozeb 75% WP** @ 2 g/liter OR **Tricyclazole 75% WP** @ 0.6 g/liter at first sign of spindle lesions.
2. **Fertilizer Dose**: Apply balanced NPK 40:20:20 kg/acre with split nitrogen application.
3. **Varieties**: Sow blast-tolerant varieties like GPU-28, ML-365, or Indaf-8.`;
  }

  // 5. SUGARCANE SCENARIOS
  if (q.includes("sugar") || q.includes("cane") || q.includes("ಕಬ್ಬು") || q.includes("गन्ना")) {
    if (isKn) {
      return `🎋 **ಕಬ್ಬಿನ ಸುಳಿ ಕೊರೆಯುವ ಹುಳು ಮತ್ತು ಪೋಷಕಾಂಶ ನಿರ್ವಹಣೆ**

**ಸರಳ ಸಾರಾಂಶ:**
ಕಬ್ಬಿನಲ್ಲಿ ಸುಳಿ ಕೊರೆಯುವ ಹುಳು (Early Shoot Borer) ಮತ್ತು ಕೆಂಪು ಕೊಳೆ ರೋಗ ತಡೆಗಟ್ಟಲು ಅಧಿಕೃತ ನಿಯಂತ್ರಣ ಕ್ರಮಗಳು.

---

📋 **ಶಿಫಾರಸು ಕ್ರಮಗಳು:**
1. **ಸುಳಿ ಕೊರೆಯುವ ಹುಳು ನಿಯಂತ್ರಣ**: ನಾಟಿ ಮಾಡಿದ 30-45 ದಿನಗಳಲ್ಲಿ **ಕೋರಜನ್ (Chlorantraniliprole 18.5% SC)** @ 0.4 ಮಿಲಿ / ಲೀಟರ್ ಅಥವಾ ಹೆಕ್ಟೇರಿಗೆ 150 ಮಿಲಿ ಬುಡಕ್ಕೆ ಬೀಳುವಂತೆ ಸಿಂಪಡಿಸಿ.
2. **ಬುಡ ಕಟ್ಟುವುದು**: 45 ಮತ್ತು 90 ದಿನಗಳಲ್ಲಿ ಸಾಲುಗಳಿಗೆ ಮಣ್ಣು ಏರಿಸಿ.
3. **ಮಣ್ಣಿನ ತೇವಾಂಶ**: ನಿಯಮಿತ ನೀರಾವರಿ ಒದಗಿಸಿ ಹಾಗೂ ಕಳೆ ನಿಯಂತ್ರಣ ಮಾಡಿ.`;
    }

    if (isHi) {
      return `🎋 **गन्ने में तना छेदक (Shoot Borer) और पोषण प्रबंधन**

**सरल सारांश:**
गन्ने में प्रारंभिक तना छेदक कीट की रोकथाम के लिए समय पर नियंत्रण आवश्यक है।

---

📋 **अनुशंसित कदम:**
1. **कीट नियंत्रण**: रोपाई के 30-45 दिनों में **कोराजन (Chlorantraniliprole 18.5% SC)** @ 0.4 मिली/लीटर पानी में घोलकर जड़ों के पास डालें।
2. **मिट्टी चढ़ाना**: 45 और 90 दिनों पर पौधों की जड़ों पर मिट्टी चढ़ाएं।
3. **सिंचाई**: खेत में नमी बनाए रखें और खरपतवार नियंत्रण करें।`;
    }

    return `🎋 **Sugarcane Early Shoot Borer & Agronomic Care Guide**

**Simple Overview:**
Early Shoot Borer (*Chilo infuscatellus*) causes dead hearts during formative crop stages (30-90 days).

---

📋 **Recommended Action Plan:**
1. **Shoot Borer Control**: Apply **Chlorantraniliprole 18.5% SC (Coragen)** @ 0.4 ml/liter or 150 ml/ha directed at plant base.
2. **Earthing Up**: Perform light earthing up at 45 days and final earthing up at 90 days.
3. **Moisture**: Maintain optimum soil moisture and remove affected dead hearts.`;
  }

  // General Dynamic Multilingual Agronomist Synthesizer
  const cleanWords = q
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(" ")
    .filter((w) => w.length > 3);
  const topicName = cleanWords.length > 0 ? cleanWords.slice(0, 3).join(" ") : "Farming Query";

  if (isKn) {
    return `👨‍🌾 **ಕೃಷಿಮಿತ್ರ ಗೆಮಿನಿ ಎಐ ಕೃಷಿ ಸಲಹೆಗಾರ - "${topicName}"**

**ಸರಳ ಸಾರಾಂಶ:**
ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಸಕಾಲಿಕ ಕೀಟ ನಿಯಂತ್ರಣ, ಸಮತೋಲಿತ ಪೋಷಕಾಂಶ ನಿರ್ವಹಣೆ ಹಾಗೂ ಸೂಕ್ತ ನೀರಾವರಿ ಅತ್ಯಗತ್ಯ.

---

📋 **ಮುಖ್ಯ ಸಲಹೆಗಳು:**
1. **ಕೀಟ/ರೋಗ ತಪಾಸಣೆ**: ಎಲೆಗಳ ಅಡಿಭಾಗ ಹಾಗೂ ಬುಡವನ್ನು ಪರಿಶೀಲಿಸಿ, ಪ್ರಾಥಮಿಕ ಹಂತದಲ್ಲೇ **ಬೇವಿನ ಎಣ್ಣೆ (1500 ppm @ 5 ಮಿಲಿ/ಲೀಟರ್)** ಸಿಂಪಡಿಸಿ.
2. **ರಸಗೊಬ್ಬರ**: ಯೂರಿಯಾ ಮತ್ತು ಡಿಎಪಿಯನ್ನು ನೀರಾವರಿ ನಂತರ ಸಮತೋಲಿತವಾಗಿ ನೀಡಿ.
3. **ಸ್ಮಾರ್ಟ್ ಪರಿಕರಗಳು**: ರೋಗ ಪತ್ತೆಗೆ **Pest AI** ಪುಟ ಹಾಗೂ ಮಳೆ ಮುನ್ಸೂಚನೆಗೆ **Weather** ಪುಟ ವೀಕ್ಷಿಸಿ!

💡 **ಸೂಚನೆ**: ಯಾವುದೇ ರಾಸಾಯನಿಕ ಸಿಂಪಡಿಸುವ ಮುನ್ನ ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.`;
  }

  if (isHi) {
    return `👨‍🌾 **कृषि मित्र जेमिनी एआई गाइड - "${topicName}"**

**सरल सारांश:**
आपके कृषि प्रश्न से संबंधित वैज्ञानिक एवं व्यावहारिक समाधान नीचे दिए गए हैं।

---

📋 **मुख्य सुझाव:**
1. **कीट/रोग निगरानी**: पत्तियों के नीचे कीटों की जांच करें और प्राथमिक बचाव के लिए **नीम तेल (1500 ppm @ 5 मिली/लीटर)** का छिड़काव करें।
2. **उर्वरक प्रबंधन**: यूरिया और डीएपी का प्रयोग हमेशा सिंचाई के बाद संतुलित मात्रा में करें।
3. **स्मार्ट टूल्स**: बीमारी जांच के लिए **Pest AI** पेज और मौसम रिपोर्ट के लिए **Weather** पेज देखें!

💡 **चेतावनी**: किसी भी कीटनाशक के प्रयोग से पहले सुरक्षात्मक दस्ताने और मास्क अवश्य पहनें।`;
  }

  return `👨‍🌾 **KrishiMitra AI Comprehensive Farming Guide for "${topicName}"**

**Simple Overview:**
Managing farm operations effectively requires understanding soil moisture, crop nutrition, pest cycles, and timely harvesting.

---

📋 **Detailed Recommended Guide:**
1. **Pest Control**: Inspect crop foliage every 3 days. Use **Neem Oil 1500 ppm** (5 ml/liter) as organic preventive spray.
2. **Nutrient Management**: Apply balanced NPK fertilizers (Urea + DAP + Potash) post-irrigation.
3. **Smart Features**: Use **Pest AI** tab for photo disease diagnosis and **Weather** tab for 7-day rain forecasts!

💡 **Notice**: Always read pesticide container label and follow prescribed dilution ratios strictly.`;
}

function formatMarkdown(text: string): React.ReactNode {
  return text;
}
