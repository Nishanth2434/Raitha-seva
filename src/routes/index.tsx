import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CloudSun,
  Bug,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Phone,
  Droplets,
  Thermometer,
  Wind,
  CloudRain,
  MapPin,
  Clock,
  Wheat,
  User as UserIcon,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Landmark,
  Shield,
  Tractor,
  FileText,
  IndianRupee,
  ExternalLink,
  ChevronRight,
  Play,
  Film,
  Eye,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SchemeUrlVerifier } from "@/components/site/SchemeUrlVerifier";
import { useLanguage } from "@/context/language-context";
import { useWeather } from "@/hooks/use-weather";
import { useAuth } from "@/hooks/use-auth";
import { CUSTOMER_CARE_CONFIG } from "@/lib/customer-care";
import {
  fetchAgriculturalUpdates,
  AgriculturalUpdateNotification,
  BASELINE_AGRICULTURAL_UPDATES,
} from "@/lib/agricultural-notifications";
import { KannadaVoiceTutorial } from "@/components/tutorial/KannadaVoiceTutorial";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Raitha Seva AI — ರೈತ ಸೇವಾ ಕೃಷಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" },
      {
        name: "description",
        content:
          "AI-powered farming summary dashboard — hyperlocal weather advice, pest alert summary, live mandi prices, and verified ICAR/UASB agricultural guidance.",
      },
    ],
  }),
  component: Index,
});

export function Index() {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const { location, weatherData, isLoading, locationSource, isLocating } = useWeather();
  const cur = locationSource === "default" ? undefined : weatherData?.current;

  const [agriculturalUpdates, setAgriculturalUpdates] = useState<AgriculturalUpdateNotification[]>(
    BASELINE_AGRICULTURAL_UPDATES
  );

  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Listen for custom start event dispatched anywhere across the app
    const handleStartTutorial = () => {
      setShowTutorial(true);
    };
    window.addEventListener("raitha_seva_start_tutorial", handleStartTutorial);

    // Check URL query param, session flag, or first-time visitor
    const urlParams = new URLSearchParams(window.location.search);
    const hasTutorialParam = urlParams.get("tutorial") === "true";
    const hasSessionTrigger = sessionStorage.getItem("raitha_seva_trigger_tutorial") === "true";
    const isFirstTime = !localStorage.getItem("raitha_seva_tutorial_completed");

    if (hasTutorialParam || hasSessionTrigger || isFirstTime) {
      if (hasSessionTrigger) {
        sessionStorage.removeItem("raitha_seva_trigger_tutorial");
      }
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 400);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("raitha_seva_start_tutorial", handleStartTutorial);
      };
    }

    return () => {
      window.removeEventListener("raitha_seva_start_tutorial", handleStartTutorial);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchAgriculturalUpdates().then((data) => {
      if (isMounted && data.length > 0) {
        setAgriculturalUpdates(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const featuredReels = [
    {
      id: "reel-1",
      titleEn: "Jeevamrut Preparation in 200L Drum",
      titleKn: "200 ಲೀಟರ್ ಡ್ರಮ್‌ನಲ್ಲಿ ಜೀವಾಮೃತ ತಯಾರಿಕೆ ವಿಧಾನ",
      titleHi: "200 लीटर ड्रम में जीवामृत बनाने की विधि",
      descEn: "Step-by-step ratio of cow dung, urine, jaggery and gram flour to boost soil microbes natively.",
      descKn: "ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಹೆಚ್ಚಿಸಲು ಸಗಣಿ, ಗಂಜಲ, ಬೆಲ್ಲ ಮತ್ತು ಕಡಲೆಹಿಟ್ಟಿನ ನಿಖರ ಪ್ರಮಾಣ.",
      descHi: "मिट्टी की उर्वरता बढ़ाने के लिए गोबर, गोमूत्र, गुड़ और बेसन का सही अनुपात।",
      category: "Organic Farming",
      categoryKn: "ಸಾವಯವ ಕೃಷಿ",
      categoryHi: "जैविक खेती",
      thumbnail: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80",
      views: "18.4K",
      author: "Ramesh Patil",
      location: "Nashik, MH",
    },
    {
      id: "reel-6",
      titleEn: "Pre-Monsoon Foliar Micronutrient Spray",
      titleKn: "ಮುಂಗಾರು ಪೂರ್ವ ಎಲೆಗಳ ಪೋಷಕಾಂಶ ಸಿಂಪಡಣೆ",
      titleHi: "मानसून पूर्व पर्णीय सूक्ष्म पोषक छिड़काव",
      descEn: "Blend Zinc & Boron spray before heavy rains to prevent flower drop.",
      descKn: "ಭಾರೀ ಮಳೆಗೂ ಮುನ್ನ ಹೂವು ಉದುರುವುದನ್ನು ತಡೆಯಲು ಸತು & ಬೋರಾನ್ ಸಿಂಪಡಣೆ.",
      descHi: "फूलों को झड़ने से रोकने के लिए बारिश से पहले जिंक और बोरॉन का छिड़काव।",
      category: "Crop Care",
      categoryKn: "ಬೆಳೆ ರಕ್ಷಣೆ",
      categoryHi: "फसल सुरक्षा",
      thumbnail: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
      views: "12.7K",
      author: "Venkatesh Rao",
      location: "Mandya, KA",
    },
    {
      id: "reel-2",
      titleEn: "Laser Land Leveler Settings & Operation",
      titleKn: "ಲೇಸರ್ ಲ್ಯಾಂಡ್ ಲೆವೆಲರ್ ಸೆಟ್ಟಿಂಗ್ಸ್ & ಬಳಕೆ",
      titleHi: "लेजर लैंड लेवलर सेटिंग्स और संचालन",
      descEn: "Save up to 35% irrigation water by precision levelling your field before paddy sowing.",
      descKn: "ಭತ್ತ ಬಿತ್ತನೆಗೂ ಮುನ್ನ ಮಣ್ಣು ಸಮತಟ್ಟು ಮಾಡಿ ಶೇ. 35 ರಷ್ಟು ನೀರು ಉಳಿಸಿ.",
      descHi: "धान की बुवाई से पहले खेत समतल करके 35% तक सिंचाई जल बचाएं।",
      category: "Machinery",
      categoryKn: "ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ",
      categoryHi: "कृषि मशीनरी",
      thumbnail: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
      views: "24.1K",
      author: "Iqbal Singh",
      location: "Karnal, HR",
    },
    {
      id: "reel-3",
      titleEn: "PM-Kisan 17th Installment Status Check",
      titleKn: "ಪಿಎಂ-ಕಿಸಾನ್ 17ನೇ ಕಂತಿನ ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ",
      titleHi: "पीएम-किसान 17वीं किस्त की स्थिति जांचें",
      descEn: "Quick guide to verify e-KYC status and direct bank transfer eligibility.",
      descKn: "e-KYC ಸ್ಥಿತಿ ಮತ್ತು ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆ ಪರಿಶೀಲಿಸುವ ಸರಳ ಮಾರ್ಗದರ್ಶಿ.",
      descHi: "ई-केवाईसी स्थिति और डायरेक्ट बैंक ट्रांसफर पात्रता जांचने की त्वरित गाइड।",
      category: "Government Schemes",
      categoryKn: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
      categoryHi: "सरकारी योजनाएं",
      thumbnail: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
      views: "42.8K",
      author: "Raitha Seva Govt Desk",
      location: "New Delhi",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 xl:pb-0 flex flex-col">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-8 flex-1">
        {/* ─── 1. PERSONALIZED WELCOME BANNER ─── */}
        <section id="tutorial-welcome" className="rounded-3xl border border-green-200 bg-linear-to-r from-green-50 via-emerald-50/70 to-teal-50 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-green-600 text-white border-0 text-xs px-3 py-1 font-bold">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  {language === "kn" ? "ರೈತ ಸೇವಾ ಕೃಷಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" : "Raitha Seva Dashboard"}
                </Badge>

                {/* Direct Language Switcher Pill */}
                <div className="inline-flex items-center rounded-full border border-green-200 bg-white/95 p-1 shadow-2xs">
                  <Globe className="h-3.5 w-3.5 ml-1 text-green-600" />
                  <button
                    type="button"
                    onClick={() => setLanguage("kn")}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold transition-all cursor-pointer ${
                      language === "kn" ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    ಕನ್ನಡ
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold transition-all cursor-pointer ${
                      language === "en" ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900">
                {language === "kn"
                  ? `ನಮಸ್ಕಾರ, ${user?.full_name || "ರೈತ ಮಿತ್ರರೇ"}!`
                  : `Welcome, ${user?.full_name || "Farmer Friend"}!`}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-2xl">
                {language === "kn"
                  ? "ನಿಮ್ಮ ಕೃಷಿ ಕಾರ್ಯಗಳಿಗೆ ಹವಾಮಾನ, ಬೆಳೆ ರೋಗ ಎಚ್ಚರಿಕೆ, ಮಂಡಿ ಬೆಲೆಗಳು ಮತ್ತು ಅಧಿಕೃತ ವಿಜ್ಞಾನಿಗಳ ಸಲಹೆ ಇಲ್ಲಿದೆ."
                  : "Hyperlocal weather forecasts, pest outbreak alerts, and real-time mandi prices for your farm."}
              </p>
            </div>

            {/* Profile / Region Summary Card */}
            <div className="rounded-2xl border border-green-200/80 bg-white p-4 shadow-sm shrink-0 min-w-[260px]">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-green-600" />
                  <span>{language === "kn" ? "ವಲಯ ಮತ್ತು ಬೆಳೆಗಳು" : "Region & Crops"}</span>
                </span>
                <Link to="/profile" className="text-[11px] font-bold text-green-700 hover:underline">
                  {language === "kn" ? "ಬದಲಾಯಿಸಿ" : "Edit"}
                </Link>
              </div>
              <div className="pt-2 text-xs text-gray-700 space-y-1">
                <p className="font-bold text-gray-900">
                  {location.name || "Mandya District (ಮಂಡ್ಯ)"}
                </p>
                <p className="text-[11px] text-gray-500">ವಲಯ 6 (Southern Dry Zone)</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="rounded-md bg-green-50 border border-green-200 px-1.5 py-0.5 text-[10px] font-bold text-green-800">
                    ಭತ್ತ (Paddy)
                  </span>
                  <span className="rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                    ರಾಗಿ (Ragi)
                  </span>
                  <span className="rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    ಕಬ್ಬು (Sugarcane)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* ─── 3. FEATURE SUMMARY CARDS (CLEAN SUMMARIES WITH VIEW DETAILS LINKS) ─── */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Summary Card 1: Weather Overview */}
          <Card id="tutorial-weather" className="rounded-3xl border border-gray-200/90 bg-white p-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                    <CloudSun className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {language === "kn" ? "ಹವಾಮಾನ ಸಾರಾಂಶ" : "Weather Summary"}
                    </h3>
                    <p className="text-[10px] text-gray-500">Live · {location.name || "Mandya"}</p>
                  </div>
                </div>
                <Badge className="bg-sky-50 text-sky-800 border-sky-200 text-[10px] font-bold">
                  {cur?.conditionLabel || "Clear Sky"}
                </Badge>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-3xl sm:text-4xl font-black text-gray-900">
                    {cur ? `${Math.round(cur.temp)}°C` : "29°C"}
                  </span>
                  <p className="text-[11px] text-gray-500">
                    {cur ? `Feels like ${Math.round(cur.feelsLike)}°C` : "Feels like 31°C"}
                  </p>
                </div>
                <div className="text-right text-[11px] text-gray-600 space-y-0.5">
                  <p className="flex items-center gap-1 justify-end font-semibold text-sky-700">
                    <CloudRain className="h-3.5 w-3.5" />
                    <span>{cur ? `${cur.rainChance}% ಮಳೆ ಸಾಧ್ಯತೆ` : "15% Rain"}</span>
                  </p>
                  <p className="flex items-center gap-1 justify-end">
                    <Droplets className="h-3.5 w-3.5 text-gray-400" />
                    <span>{cur ? `${cur.humidity}% ತೇವಾಂಶ` : "65% Humidity"}</span>
                  </p>
                </div>
              </div>

              {/* Actionable Agricultural Spray Advice */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-950">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                  <span>{language === "kn" ? "ಸಿಂಪಡಣೆ ಸಲಹೆ:" : "Spray Advisory:"}</span>
                </p>
                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                  {language === "kn"
                    ? "ಮಳೆ ಮುನ್ಸೂಚನೆ ಇರುವ ದಿನಗಳಲ್ಲಿ ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ ಮಾಡಬೇಡಿ. ಮುಂಜಾನೆ ಅಥವಾ ಸಂಜೆ ವೇಳೆ ಮಾತ್ರ ಸಿಂಪಡಿಸಿ."
                    : "Postpone chemical spraying during rain spells. Spray during calm morning/evening hours."}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <Button asChild variant="outline" className="w-full rounded-2xl text-xs font-bold text-sky-800 border-sky-200 hover:bg-sky-50">
                <Link to="/weather">
                  <span>{language === "kn" ? "ಸಂಪೂರ್ಣ 7 ದಿನಗಳ ಹವಾಮಾನ ವೀಕ್ಷಿಸಿ" : "View Full 7-Day Forecast"}</span>
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </Card>

          {/* Summary Card 2: Recent Pest Alert */}
          <Card id="tutorial-pest" className="rounded-3xl border border-gray-200/90 bg-white p-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                    <Bug className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {language === "kn" ? "ಕೀಟ ಮತ್ತು ರೋಗ ಎಚ್ಚರಿಕೆ" : "Pest Alert Summary"}
                    </h3>
                    <p className="text-[10px] text-gray-500">Agro-Climatic Zone 6 Alert</p>
                  </div>
                </div>
                <Badge className="bg-rose-50 text-rose-800 border-rose-200 text-[10px] font-bold">
                  {language === "kn" ? "ಹೆಚ್ಚಿನ ಅಪಾಯ" : "Moderate Risk"}
                </Badge>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-3 space-y-1">
                <h4 className="text-xs font-bold text-rose-950">
                  {language === "kn"
                    ? "ಭತ್ತದಲ್ಲಿ ಬೆಂಕಿ ರೋಗ ಮತ್ತು ಕಂದು ಜಿಗಿಹುಳು (BPH)"
                    : "Paddy Blast & Brown Plant Hopper Alert"}
                </h4>
                <p className="text-[11px] text-rose-800/90 leading-relaxed">
                  {language === "kn"
                    ? "ಮೋಡ ಕವಿದ ವಾತಾವರಣದಿಂದಾಗಿ ರೋಗ ಬಾಧೆ ಹೆಚ್ಚಾಗುವ ಸಾಧ್ಯತೆ. ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಮಚ್ಚೆಗಳು ಕಂಡುಬಂದಲ್ಲಿ ಟ್ರೈಸೈಕ್ಲೋಜೋಲ್ (0.6 ಗ್ರಾಂ/ಲೀ) ಸಿಂಪಡಿಸಿ."
                    : "Cloudy humid weather favors blast development. Apply Tricyclazole 75 WP @ 0.6 g/L upon first symptom detection."}
                </p>
              </div>

              <div className="text-[11px] text-gray-600 space-y-1">
                <p className="font-semibold text-gray-800">
                  {language === "kn" ? "ಇತರ ಬೆಳೆಗಳ ಎಚ್ಚರಿಕೆ:" : "Other Crop Advisories:"}
                </p>
                <p>• ರಾಗಿ: ಬೆಂಕಿ ರೋಗಕ್ಕೆ KMR-630 ತಳಿ ಬಳಸಿ</p>
                <p>• ಕಬ್ಬು: ಮುಂಚಿನ ಸುಳಿ ಕೊರೆಯುವ ಹುಳು ಹತೋಟಿಗೆ ಟ್ರೈಕೋಗ್ರಾಮಾ ಪರಾವಲಂಬಿ ಬಿಡುಗಡೆ</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <Button asChild variant="outline" className="w-full rounded-2xl text-xs font-bold text-rose-800 border-rose-200 hover:bg-rose-50">
                <Link to="/pest-alerts">
                  <span>{language === "kn" ? "ರೋಗ ಪತ್ತೆ ಸ್ಕ್ಯಾನ್ ಮತ್ತು ಎಚ್ಚರಿಕೆಗಳು" : "Scan Crop & View All Alerts"}</span>
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </Card>

          {/* Summary Card 3: Mandi Market Prices */}
          <Card id="tutorial-market" className="rounded-3xl border border-gray-200/90 bg-white p-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {language === "kn" ? "ಮಂಡಿ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ" : "Market Price Summary"}
                    </h3>
                    <p className="text-[10px] text-gray-500">APMC Mandya Live Rates</p>
                  </div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                  ಇಂದಿನ ಬೆಲೆ
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                  <div>
                    <p className="font-bold text-gray-900">ಭತ್ತ (Paddy - Jyothi)</p>
                    <p className="text-[10px] text-gray-400">Mandya APMC</p>
                  </div>
                  <span className="font-extrabold text-green-700 text-sm">₹2,350 / Q</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                  <div>
                    <p className="font-bold text-gray-900">ರಾಗಿ (Finger Millet)</p>
                    <p className="text-[10px] text-gray-400">Mandya APMC</p>
                  </div>
                  <span className="font-extrabold text-green-700 text-sm">₹3,420 / Q</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                  <div>
                    <p className="font-bold text-gray-900">ಬೆಲ್ಲ (Sugarcane Jaggery)</p>
                    <p className="text-[10px] text-gray-400">Mandya Mandi</p>
                  </div>
                  <span className="font-extrabold text-green-700 text-sm">₹4,200 / Q</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <Button asChild variant="outline" className="w-full rounded-2xl text-xs font-bold text-emerald-800 border-emerald-200 hover:bg-emerald-50">
                <Link to="/market-prices">
                  <span>{language === "kn" ? "ಎಲ್ಲಾ ಮಂಡಿ ಧಾರಣೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ" : "View All Mandi Prices & Trends"}</span>
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </Card>
        </section>

        {/* ─── 4. AI PROMPT BANNER & DIRECT HELPLINE ─── */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Ask AI Assistant Prompt Box */}
          <Card id="tutorial-assistant" className="rounded-3xl border-2 border-green-300 bg-linear-to-br from-green-50 via-white to-emerald-50 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-600 text-white shadow-md shadow-green-200">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  {language === "kn" ? "AI ಕೃಷಿ ಸಹಾಯಕರಿಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ" : "Ask Raitha Seva AI Assistant"}
                </h3>
                <p className="text-xs text-gray-600">
                  {language === "kn"
                    ? "UAS ಬೆಂಗಳೂರು ಮತ್ತು ICAR ಪ್ಯಾಕೇಜ್ ಆಫ್ ಪ್ರಾಕ್ಟೀಸಸ್ ಆಧಾರಿತ ತ್ವರಿತ ಪರಿಹಾರ."
                    : "Get instant verified advice in Kannada or English."}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed bg-white/80 p-3 rounded-2xl border border-green-100 font-medium">
              "{language === "kn" ? "ರಾಗಿಯಲ್ಲಿ ಬೆಂಕಿ ರೋಗ ಬಂದರೆ ಯಾವ ಔಷಧ ಮತ್ತು ಎಷ್ಟು ಪ್ರಮಾಣದಲ್ಲಿ ಸಿಂಪಡಿಸಬೇಕು?" : "What is the recommended spray dosage for blast disease in Ragi?"}"
            </p>

            <Button asChild className="w-full rounded-2xl bg-green-600 text-white font-bold text-xs hover:bg-green-700">
              <Link to="/assistant">
                <span>{language === "kn" ? "ಎಐ ಸಹಾಯಕ ಪುಟಕ್ಕೆ ತೆರಳಿ" : "Open AI Assistant"}</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </Card>

          {/* Temporary Helpline Support Banner */}
          <Card id="tutorial-help" className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-[10px] font-bold text-amber-800">
                      {CUSTOMER_CARE_CONFIG.labelKn}
                    </Badge>
                    <h3 className="text-lg font-black text-gray-900">
                      {CUSTOMER_CARE_CONFIG.formattedPhone}
                    </h3>
                  </div>
                </div>

                <a
                  href={CUSTOMER_CARE_CONFIG.telLink}
                  className="rounded-full bg-green-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-green-700"
                >
                  {language === "kn" ? "ಕರೆ ಮಾಡಿ" : "Call Now"}
                </a>
              </div>

              <p className="text-xs text-gray-600">
                {language === "kn"
                  ? "ಅಪ್ಲಿಕೇಶನ್ ಬಳಕೆ, ಸೈನ್ ಅಪ್ ಅಥವಾ ಕೃಷಿ ಸಹಾಯಕ್ಕೆ ತಾತ್ಕಾಲಿಕ ಗ್ರಾಹಕ ಸೇವೆ ಸಂಖ್ಯೆಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ."
                  : "Call our dedicated customer care helpline for support with app features, registration, or farming guidance."}
              </p>

              <div className="rounded-xl bg-slate-50 p-2.5 text-[11px] text-gray-700 space-y-1 border border-slate-100">
                <p>
                  • {language === "kn" ? "ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್: " : "Kisan Call Centre: "}
                  <a href="tel:18001801551" className="font-bold underline text-blue-700">1800-180-1551</a>
                  {language === "kn" ? " (ಉಚಿತ ಕರೆ)" : " (Toll-Free)"}
                </p>
                <p>
                  • {language === "kn" ? "ICAR-KVK ಮಂಡ್ಯ: " : "ICAR-KVK Mandya: "}
                  <a href="tel:08232277456" className="font-bold underline text-green-700">08232-277456</a>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <Button asChild variant="outline" className="w-full rounded-2xl text-xs font-bold text-gray-700">
                <Link to="/help">
                  <span>{language === "kn" ? "ಸಹಾಯ ಮತ್ತು ಸಂಪರ್ಕ ಪುಟ (View Details)" : "View Help & Support"}</span>
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </Card>
        </section>

        {/* ─── 5. GOVERNMENT SCHEMES, SUBSIDIES & LOANS + LINK SCANNER ─── */}
        <section id="tutorial-schemes" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Landmark className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900">
                  {t("schemes_title", "Government Schemes & Subsidies")}
                </h2>
                <p className="text-xs text-gray-500">
                  {language === "kn"
                    ? "ಕೇಂದ್ರ ಮತ್ತು ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಸಬ್ಸಿಡಿ, ಬೆಳೆ ವಿಮೆ & ಸಾಲ ಯೋಜನೆಗಳು"
                    : "Central & Karnataka State subsidies, crop insurance & zero/low-interest loans"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://www.myscheme.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-xs font-bold text-blue-600 hover:underline"
              >
                <span>myScheme Portal</span>
                <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </a>
              <Button asChild size="sm" variant="outline" className="rounded-full text-xs font-bold border-blue-200 text-blue-700 hover:bg-blue-50">
                <Link to="/schemes">
                  <span>{language === "kn" ? "ಎಲ್ಲಾ ಯೋಜನೆಗಳು" : "View All"}</span>
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Scheme Link Verifier & Anti-Fraud Scanner */}
          <SchemeUrlVerifier />

          {/* 4 Primary Scheme Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* PM-KISAN */}
            <Card className="rounded-3xl border border-blue-200 bg-blue-50/40 p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-100 text-blue-600">
                  <IndianRupee className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <Badge className="bg-blue-100 text-blue-800 border-0 text-[10px] uppercase font-bold">
                    {t("scheme_active", "Active Scheme")}
                  </Badge>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    {t("scheme_pmkisan_title", "PM-KISAN Samman Nidhi")}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-blue-900">
                    {t("scheme_pmkisan_benefit", "₹6,000/year — 3 installments of ₹2,000 via DBT")}
                  </p>
                  <p className="text-xs leading-relaxed text-gray-600">
                    {t(
                      "scheme_pmkisan_desc",
                      "Income support for all landholding farmer families. Direct bank transfer every 4 months. Check status at pmkisan.gov.in"
                    )}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-blue-100/80 mt-2">
                <a
                  href="https://pmkisan.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-bold text-blue-700 hover:underline"
                >
                  <span>pmkisan.gov.in</span>
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
            </Card>

            {/* PMFBY - Crop Insurance */}
            <Card className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <Shield className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[10px] uppercase font-bold">
                    {t("scheme_active", "Active Scheme")}
                  </Badge>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    {t("scheme_pmfby_title", "PM Fasal Bima Yojana (PMFBY)")}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-emerald-900">
                    {t("scheme_pmfby_benefit", "Crop Insurance: 2% Kharif, 1.5% Rabi, 5% Commercial")}
                  </p>
                  <p className="text-xs leading-relaxed text-gray-600">
                    {t(
                      "scheme_pmfby_desc",
                      "Comprehensive crop insurance from pre-sowing to post-harvest. Satellite and drone assessments for faster claim settlements."
                    )}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-emerald-100/80 mt-2">
                <a
                  href="https://pmfby.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-bold text-emerald-700 hover:underline"
                >
                  <span>pmfby.gov.in</span>
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
            </Card>

            {/* SMAM - Mechanization Subsidy */}
            <Card className="rounded-3xl border border-orange-200 bg-orange-50/40 p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-orange-100 text-orange-600">
                  <Tractor className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <Badge className="bg-orange-100 text-orange-800 border-0 text-[10px] uppercase font-bold">
                    {t("scheme_subsidy", "Subsidy Scheme")}
                  </Badge>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    {t("scheme_smam_title", "SMAM — Agri Mechanization")}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-orange-900">
                    {t("scheme_smam_benefit", "40-50% subsidy on tractors, drones, tillers & sprayers")}
                  </p>
                  <p className="text-xs leading-relaxed text-gray-600">
                    {t(
                      "scheme_smam_desc",
                      "Sub-Mission on Agricultural Mechanization. 50% for SC/ST/small/marginal/women farmers, 40% for others. Supports Custom Hiring Centres."
                    )}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-orange-100/80 mt-2">
                <a
                  href="https://agrimachinery.nic.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-bold text-orange-700 hover:underline"
                >
                  <span>agrimachinery.nic.in</span>
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
            </Card>

            {/* KCC - Low-Interest Crop Loans */}
            <Card className="rounded-3xl border border-violet-200 bg-violet-50/40 p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-600">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <Badge className="bg-violet-100 text-violet-800 border-0 text-[10px] uppercase font-bold">
                    {t("scheme_credit", "Credit Scheme")}
                  </Badge>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    {t("scheme_kcc_title", "Kisan Credit Card (KCC)")}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-violet-900">
                    {t("scheme_kcc_benefit", "Crop loans up to ₹5 lakh at just 4% interest")}
                  </p>
                  <p className="text-xs leading-relaxed text-gray-600">
                    {t(
                      "scheme_kcc_desc",
                      "Collateral-free up to ₹2 lakh. Apply via any bank branch, Kisan Rin Portal, or e-KCC digital process. Covers crop production & allied activities."
                    )}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-violet-100/80 mt-2">
                <a
                  href="https://kisancreditcard.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-bold text-violet-700 hover:underline"
                >
                  <span>kisancreditcard.gov.in</span>
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
            </Card>
          </div>
        </section>

        {/* ─── 5. RECENT AGRICULTURAL ACTIVITIES & ADVISORIES ─── */}
        <section id="tutorial-updates" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-700" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                {language === "kn"
                  ? "ಇತ್ತೀಚಿನ ಕೃಷಿ ನವೀಕರಣಗಳು (Recent Updates)"
                  : language === "hi"
                  ? "हालिया कृषि अपडेट (Recent Updates)"
                  : "Recent Agricultural Updates"}
              </h2>
            </div>
            <Link
              to="/help"
              className="text-xs font-bold text-green-700 hover:underline flex items-center gap-1"
            >
              <span>
                {language === "kn"
                  ? "ಅಧಿಕೃತ ಮೂಲಗಳು"
                  : language === "hi"
                  ? "सत्यापित स्रोत"
                  : "Official Sources"}
              </span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {agriculturalUpdates.slice(0, 3).map((act) => {
              const title =
                language === "kn"
                  ? act.titleKn
                  : language === "hi"
                  ? act.titleHi
                  : act.titleEn;
              const time =
                language === "kn"
                  ? act.relativeTimeKn
                  : language === "hi"
                  ? act.relativeTimeHi
                  : act.relativeTimeEn;

              return (
                <Link key={act.id} to={act.internalUrl as any} className="block group">
                  <Card className="rounded-2xl border border-gray-200/90 bg-white p-4 space-y-2 h-full transition-all group-hover:border-green-300 group-hover:shadow-md">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          act.priority === "urgent"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-green-200 bg-green-50 text-green-700"
                        }`}
                      >
                        {act.priority === "urgent"
                          ? language === "kn"
                            ? "ಅತ್ಯಗತ್ಯ"
                            : language === "hi"
                            ? "अति आवश्यक"
                            : "Urgent Alert"
                          : language === "kn"
                          ? "ನವೀಕರಣ"
                          : language === "hi"
                          ? "अपडेट"
                          : "Update"}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">{time}</span>
                    </div>

                    <p className="text-xs font-bold text-gray-900 leading-snug group-hover:text-green-700 transition-colors line-clamp-2">
                      {title}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-50">
                      <span className="truncate max-w-[200px]" title={act.source}>
                        {act.source}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-green-600 transition-colors shrink-0 ml-1" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ─── 6. 🎥 AGRI REELS & FARMING PRACTICAL VIDEOS ─── */}
        <section id="tutorial-reels" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <Film className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900">
                  {language === "kn"
                    ? "ಕೃಷಿ ರೀಲ್ಸ್‌ಗಳು (Agri Reels)"
                    : language === "hi"
                    ? "कृषि रील्स (Agri Reels)"
                    : "Agri Reels — Practical Farming Videos"}
                </h2>
                <p className="text-xs text-gray-500">
                  {language === "kn"
                    ? "ಸಾವಯವ ಕೃಷಿ, ಯಂತ್ರೋಪಕರಣ ಬಳಕೆ ಮತ್ತು ಬೆಳೆ ರಕ್ಷಣೆಯ ವೀಡಿಯೊಗಳು"
                    : language === "hi"
                    ? "जैविक खेती, मशीनरी और फसल सुरक्षा के उपयोगी वीडियो"
                    : "Short practical farming lessons, machinery demos & expert tips"}
                </p>
              </div>
            </div>

            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-full text-xs font-bold border-purple-200 text-purple-700 hover:bg-purple-50 self-start sm:self-auto"
            >
              <Link to="/reels">
                <Play className="mr-1.5 h-3.5 w-3.5 fill-purple-600 text-purple-600" />
                <span>
                  {language === "kn"
                    ? "ಎಲ್ಲಾ ರೀಲ್ಸ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ"
                    : language === "hi"
                    ? "सभी रील्स देखें"
                    : t("watch_reels", "Watch Reels")}
                </span>
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {/* Featured Reels Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredReels.map((reel) => {
              const title =
                language === "kn"
                  ? reel.titleKn
                  : language === "hi"
                  ? reel.titleHi
                  : reel.titleEn;
              const desc =
                language === "kn"
                  ? reel.descKn
                  : language === "hi"
                  ? reel.descHi
                  : reel.descEn;
              const category =
                language === "kn"
                  ? reel.categoryKn
                  : language === "hi"
                  ? reel.categoryHi
                  : reel.category;

              return (
                <Link
                  key={reel.id}
                  to="/reels"
                  className="group block rounded-3xl overflow-hidden border border-gray-200/90 bg-white shadow-2xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-900">
                    <img
                      src={reel.thumbnail}
                      alt={title}
                      className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Category Pill */}
                    <Badge className="absolute top-3 left-3 bg-white/95 text-gray-900 border-0 text-[10px] font-bold shadow-xs">
                      {category}
                    </Badge>

                    {/* View Count */}
                    <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                      <Eye className="h-3 w-3" /> {reel.views}
                    </span>

                    {/* Center Play Icon */}
                    <div className="absolute inset-0 grid place-items-center">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-white/30 text-white backdrop-blur-md shadow-md transition-transform duration-300 group-hover:scale-115 group-hover:bg-green-600">
                        <Play className="h-5 w-5 ml-0.5 fill-white" />
                      </span>
                    </div>

                    {/* Bottom Author Pill */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px]">
                      <span className="font-semibold truncate drop-shadow-sm">
                        {reel.author} · {reel.location}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-3.5 space-y-1.5">
                    <h3 className="text-xs font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-1">
                      {title}
                    </h3>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {desc}
                    </p>
                    <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-purple-700 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <Play className="h-3 w-3 fill-purple-600" />
                        {language === "kn"
                          ? "ವೀಕ್ಷಿಸಿ"
                          : language === "hi"
                          ? "देखें"
                          : "Play Reel"}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      {/* Kannada Voice-Guided Raitha Seva Interactive Tutorial */}
      <KannadaVoiceTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />

      <Footer />
    </div>
  );
}
export default Index;
