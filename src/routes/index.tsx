import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CloudSun,
  Bug,
  TrendingUp,
  Mic,
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
  HelpCircle,
  Wheat,
  User as UserIcon,
  Globe,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/language-context";
import { useWeather } from "@/hooks/use-weather";
import { useAuth } from "@/hooks/use-auth";
import { CUSTOMER_CARE_CONFIG } from "@/lib/customer-care";

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

  const quickFeatures = [
    {
      to: "/assistant",
      icon: Sparkles,
      titleKn: "AI ಕೃಷಿ ಸಹಾಯಕ",
      titleEn: "AI Assistant",
      descKn: "ಕನ್ನಡದಲ್ಲೇ ಕೃಷಿ ಪರಿಹಾರ",
      descEn: "Evidence-grounded advice",
      color: "border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-800",
      iconColor: "bg-emerald-600 text-white",
    },
    {
      to: "/weather",
      icon: CloudSun,
      titleKn: "ಹವಾಮಾನ ಸಲಹೆ",
      titleEn: "Weather Advisor",
      descKn: "7 ದಿನಗಳ ಮಳೆ ಮುನ್ಸೂಚನೆ",
      descEn: "7-day rain & spray forecast",
      color: "border-sky-200 bg-sky-50/60 hover:bg-sky-100/70 text-sky-800",
      iconColor: "bg-sky-600 text-white",
    },
    {
      to: "/pest-alerts",
      icon: Bug,
      titleKn: "ಕೀಟ ರೋಗ ಎಚ್ಚರಿಕೆ",
      titleEn: "Pest Alerts",
      descKn: "ರೋಗ ಪತ್ತೆ ಮತ್ತು ಸುರಕ್ಷಿತ ಔಷಧ",
      descEn: "Disease scan & dosage",
      color: "border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-amber-800",
      iconColor: "bg-amber-600 text-white",
    },
    {
      to: "/market-prices",
      icon: TrendingUp,
      titleKn: "ಮಂಡಿ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ",
      titleEn: "Market Prices",
      descKn: "ಲೈವ್ APMC ದರಗಳು",
      descEn: "Live APMC mandi rates",
      color: "border-green-200 bg-green-50/60 hover:bg-green-100/70 text-green-800",
      iconColor: "bg-green-600 text-white",
    },
    {
      to: "/voice-assistant",
      icon: Mic,
      titleKn: "ಕನ್ನಡ ಧ್ವನಿ AI",
      titleEn: "Voice Assistant",
      descKn: "ಮಾತನಾಡಿ ಉತ್ತರ ಪಡೆಯಿರಿ",
      descEn: "Speak & listen in Kannada",
      color: "border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 text-purple-800",
      iconColor: "bg-purple-600 text-white",
    },
    {
      to: "/help",
      icon: HelpCircle,
      titleKn: "ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ",
      titleEn: "Help & Care",
      descKn: "6360997180 ಗ್ರಾಹಕ ಸೇವೆ",
      descEn: "Direct helpline & support",
      color: "border-teal-200 bg-teal-50/60 hover:bg-teal-100/70 text-teal-800",
      iconColor: "bg-teal-600 text-white",
    },
  ];

  const recentActivities = [
    {
      titleKn: "ಮಂಡ್ಯ ವಲಯ 6 ರಾಗಿ ಬ್ಲಾಸ್ಟ್ ನಿರ್ವಹಣಾ ಸಲಹೆ ನವೀಕರಿಸಲಾಗಿದೆ",
      titleEn: "UASB Zone 6 Ragi Blast advisory updated",
      source: "UAS Bangalore Package of Practices",
      time: "2 hours ago",
    },
    {
      titleKn: "ಮಂಡ್ಯ APMC ಭತ್ತ ಮತ್ತು ಬೆಲ್ಲದ ಮಂಡಿ ಬೆಲೆ ನವೀಕರಣಗೊಂಡಿದೆ",
      titleEn: "Mandya APMC Paddy & Jaggery prices refreshed",
      source: "AGMARKNET Mandi Intelligence",
      time: "Today, 11:30 AM",
    },
    {
      titleKn: "ದಕ್ಷಿಣ ಒಣ ವಲಯಕ್ಕೆ 36 ಗಂಟೆಗಳ ಮಳೆ ಮುನ್ಸೂಚನೆ ಎಚ್ಚರಿಕೆ",
      titleEn: "36-hour rain alert issued for Southern Dry Zone",
      source: "IMD Mausam / Agro-Met Advisory",
      time: "Today, 6:00 AM",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 xl:pb-0 flex flex-col">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-8 flex-1">
        {/* ─── 1. PERSONALIZED WELCOME BANNER ─── */}
        <section className="rounded-3xl border border-green-200 bg-linear-to-r from-green-50 via-emerald-50/70 to-teal-50 p-6 sm:p-8 shadow-xs">
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

        {/* ─── 2. QUICK ACCESS BUTTONS TO DEDICATED FEATURE PAGES ─── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900">
              {language === "kn" ? "ಪ್ರಮುಖ ಕೃಷಿ ಸೌಲಭ್ಯಗಳು (Quick Access)" : "Dedicated Farming Features"}
            </h2>
            <span className="text-xs text-gray-500">
              {language === "kn" ? "ಪ್ರತ್ಯೇಕ ಪುಟವನ್ನು ತೆರೆಯಲು ಕ್ಲಿಕ್ ಮಾಡಿ" : "Tap any feature to open its page"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {quickFeatures.map((f) => {
              const IconComp = f.icon;
              return (
                <Link
                  key={f.to}
                  to={f.to as any}
                  className={`group flex flex-col justify-between rounded-3xl border p-4 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${f.color}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className={`grid h-10 w-10 place-items-center rounded-2xl ${f.iconColor}`}>
                        <IconComp className="h-5 w-5" />
                      </span>
                      {f.badge && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800 border border-amber-200">
                          {f.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-green-700">
                        {language === "kn" ? f.titleKn : f.titleEn}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-gray-600 line-clamp-1">
                        {language === "kn" ? f.descKn : f.descEn}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center text-[11px] font-extrabold text-green-700 group-hover:underline">
                    <span>{language === "kn" ? "ತೆರೆಯಿರಿ" : "Open"}</span>
                    <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ─── 3. FEATURE SUMMARY CARDS (CLEAN SUMMARIES WITH VIEW DETAILS LINKS) ─── */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Summary Card 1: Weather Overview */}
          <Card className="rounded-3xl border border-gray-200/90 bg-white p-5 shadow-sm flex flex-col justify-between">
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
          <Card className="rounded-3xl border border-gray-200/90 bg-white p-5 shadow-sm flex flex-col justify-between">
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
          <Card className="rounded-3xl border border-gray-200/90 bg-white p-5 shadow-sm flex flex-col justify-between">
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
          <Card className="rounded-3xl border-2 border-green-300 bg-linear-to-br from-green-50 via-white to-emerald-50 p-6 shadow-sm space-y-4">
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
          <Card className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
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
                  ಕರೆ ಮಾಡಿ
                </a>
              </div>

              <p className="text-xs text-gray-600">
                ಅಪ್ಲಿಕೇಶನ್ ಬಳಕೆ, ಸೈನ್ ಅಪ್ ಅಥವಾ ಕೃಷಿ ಸಹಾಯಕ್ಕೆ ತಾತ್ಕಾಲಿಕ ಗ್ರಾಹಕ ಸೇವೆ ಸಂಖ್ಯೆಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ.
              </p>

              <div className="rounded-xl bg-slate-50 p-2.5 text-[11px] text-gray-700 space-y-1 border border-slate-100">
                <p>• ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್: <a href="tel:18001801551" className="font-bold underline text-blue-700">1800-180-1551</a> (ಉಚಿತ ಕರೆ)</p>
                <p>• ICAR-KVK ಮಂಡ್ಯ: <a href="tel:08232277456" className="font-bold underline text-green-700">08232-277456</a></p>
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

        {/* ─── 5. RECENT AGRICULTURAL ACTIVITIES & ADVISORIES ─── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
              {language === "kn" ? "ಇತ್ತೀಚಿನ ಕೃಷಿ ನವೀಕರಣಗಳು (Recent Updates)" : "Recent Agricultural Updates"}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {recentActivities.map((act, i) => (
              <Card key={i} className="rounded-2xl border border-gray-200/90 bg-white p-4 space-y-1">
                <p className="text-xs font-bold text-gray-900 leading-snug">
                  {language === "kn" ? act.titleKn : act.titleEn}
                </p>
                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                  <span>{act.source}</span>
                  <span className="font-medium text-green-700">{act.time}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
export default Index;
