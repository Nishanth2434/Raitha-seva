import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Phone,
  MessageCircle,
  Copy,
  Check,
  ArrowRight,
  CloudSun,
  Bug,
  TrendingUp,
  Mic,
  Clock,
  Sparkles,
  ArrowLeft,
  Info,
  CheckCircle2,
  Landmark,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/context/language-context";
import { CUSTOMER_CARE_CONFIG } from "@/lib/customer-care";
import { supabase } from "@/lib/supabase";

import { requireAuth } from "@/lib/auth-guard";
import { AuthGuard } from "@/components/auth/AuthGuard";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "ರೈತ ಸೇವಾ ಸಾಥಿ | Raitha Seva Saathi — Onboarding & Support" },
      {
        name: "description",
        content:
          "Welcome to Raitha Seva AI. Empowering farmers in Karnataka with bilingual advisory, disease diagnosis, weather, and market intelligence.",
      },
    ],
  }),
  component: () => (
    <AuthGuard>
      <OnboardingPage />
    </AuthGuard>
  ),
});

export function OnboardingPage() {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const { language, setLanguage } = useLanguage();
  const isKn = language === "kn";
  const [copied, setCopied] = useState(false);

  // Mark onboarding completed and navigate to dashboard
  const completeOnboardingAndProceed = async (targetRoute = "/") => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("raitha_seva_is_new_signup");
        localStorage.setItem("raitha_seva_onboarding_completed", "true");
        if (authUser?.id) {
          localStorage.setItem(`raitha_seva_onboarding_completed_${authUser.id}`, "true");
        }
      }

      // Record in Supabase profile if possible (graceful fallback if column not present)
      if (authUser?.id) {
        Promise.resolve(
          supabase
            .from("profiles")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", authUser.id)
        ).catch(() => {});
      }
    } catch {
      // Ignore storage errors
    }

    navigate({ to: targetRoute as any, replace: true });
  };

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(CUSTOMER_CARE_CONFIG.rawPhone);
      setCopied(true);
      toast.success(
        isKn
          ? `${CUSTOMER_CARE_CONFIG.copiedKn} (${CUSTOMER_CARE_CONFIG.formattedPhone})`
          : `${CUSTOMER_CARE_CONFIG.copiedEn} (${CUSTOMER_CARE_CONFIG.formattedPhone})`
      );
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.info(
        isKn
          ? `ಗ್ರಾಹಕ ಸೇವೆ ಸಂಖ್ಯೆ: ${CUSTOMER_CARE_CONFIG.formattedPhone}`
          : `Helpline: ${CUSTOMER_CARE_CONFIG.formattedPhone}`
      );
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-green-50/60 via-white to-amber-50/40 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        {/* Top Navigation Bar with Back & Skip & Language Toggle */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              completeOnboardingAndProceed("/");
            }}
            className="group inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-xs transition-all hover:bg-green-50 hover:text-green-700 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4 text-green-600 transition-transform group-hover:-translate-x-0.5" />
            <span>{isKn ? "ಹಿಂದೆ" : "Back"}</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Bilingual Toggle */}
            <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 text-xs shadow-xs">
              <button
                type="button"
                onClick={() => setLanguage("kn")}
                className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                  isKn ? "bg-green-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                ಕನ್ನಡ
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                  !isKn ? "bg-green-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                English
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => completeOnboardingAndProceed("/")}
              className="text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              {isKn ? "ದಾಟಿಸಿ (Skip)" : "Skip to Dashboard"}
            </Button>
          </div>
        </div>

        {/* Welcome Header */}
        <header className="text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-100/80 px-4 py-1.5 text-xs font-bold text-green-800 shadow-xs">
            <Sparkles className="h-4 w-4 text-green-600" />
            <span>{isKn ? "ರೈತ ಸೇವಾ ಸಾಥಿ • Raitha Seva Saathi" : "Raitha Seva AI • Welcome Guide"}</span>
          </div>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {isKn ? "ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರರೇ!" : "Welcome, Farmer Friend!"}
          </h1>
          <p className="mt-2 text-base font-semibold text-green-700 sm:text-xl">
            {isKn
              ? "ರೈತ ಸೇವಾಕ್ಕೆ ಸ್ವಾಗತ. ನಿಮ್ಮ ಕೃಷಿ ಕೆಲಸಗಳಿಗೆ ನಾವು ಸಹಾಯ ಮಾಡುತ್ತೇವೆ."
              : "Empowering farmers with AI-driven weather, disease alerts, market prices, and loans."}
          </p>
          <p className="mx-auto mt-2 max-w-xl text-xs text-gray-600 sm:text-sm">
            {isKn
              ? "ಕರ್ನಾಟಕದ ರೈತರಿಗೆ ಹವಾಮಾನ, ಕೀಟ ಬಾಧೆ ನಿಯಂತ್ರಣ, ಮಂಡಿ ಬೆಲೆಗಳು ಮತ್ತು ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರದ (KVK) ಅಧಿಕೃತ ಮಾರ್ಗದರ್ಶನ ನೀಡುವ ತಂತ್ರಜ್ಞಾನ ವೇದಿಕೆ."
              : "A dedicated bilingual agricultural intelligence platform connecting you to official UAS Bangalore, ICAR, and Karnataka KSDA Package of Practices."}
          </p>
        </header>

        {/* Temporary Customer Care Section */}
        <Card className="mt-8 overflow-hidden rounded-3xl border-2 border-green-500 bg-linear-to-br from-green-50 via-white to-emerald-50 shadow-xl shadow-green-100/50">
          <CardHeader className="bg-green-600/10 pb-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 text-white shadow-md shadow-green-200">
              <Phone className="h-6 w-6" />
            </div>
            <div className="mt-3">
              <Badge variant="outline" className="border-amber-400 bg-amber-50 text-[11px] font-bold text-amber-800">
                {isKn ? CUSTOMER_CARE_CONFIG.labelKn : CUSTOMER_CARE_CONFIG.labelEn}
              </Badge>
            </div>
            <CardTitle className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl tracking-tight">
              {CUSTOMER_CARE_CONFIG.formattedPhone}
            </CardTitle>
            <CardDescription className="text-xs text-gray-600">
              {isKn
                ? "ಯಾವುದೇ ತಾಂತ್ರಿಕ ನೆರವು ಅಥವಾ ಅಪ್ಲಿಕೇಶನ್ ಬಳಕೆಯ ಪ್ರಶ್ನೆಗಳಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ."
                : "Dedicated support helpline for assistance with account login, app tools, or farming questions."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Call Button */}
              <a
                href={CUSTOMER_CARE_CONFIG.telLink}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 text-sm font-bold text-white shadow-lg shadow-green-200 transition-all hover:bg-green-700 hover:shadow-green-300 active:scale-98"
                aria-label={isKn ? CUSTOMER_CARE_CONFIG.callButtonKn : CUSTOMER_CARE_CONFIG.callButtonEn}
              >
                <Phone className="h-4 w-4" />
                <span>{isKn ? CUSTOMER_CARE_CONFIG.callButtonKn : CUSTOMER_CARE_CONFIG.callButtonEn}</span>
              </a>

              {/* Desktop Copy Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyPhone}
                className="h-12 w-full rounded-2xl border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-98"
              >
                {copied ? (
                  <>
                    <Check className="mr-1.5 h-4 w-4 text-green-600" />
                    <span className="text-green-700 font-bold">
                      {isKn ? CUSTOMER_CARE_CONFIG.copiedKn : CUSTOMER_CARE_CONFIG.copiedEn}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-4 w-4 text-gray-500" />
                    <span>{isKn ? CUSTOMER_CARE_CONFIG.copyButtonKn : CUSTOMER_CARE_CONFIG.copyButtonEn}</span>
                  </>
                )}
              </Button>
            </div>

            {/* Optional WhatsApp Button */}
            <a
              href={CUSTOMER_CARE_CONFIG.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 text-xs font-bold text-emerald-800 transition-all hover:bg-emerald-100 hover:border-emerald-400 active:scale-98 sm:text-sm"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              <span>{isKn ? CUSTOMER_CARE_CONFIG.whatsappButtonKn : CUSTOMER_CARE_CONFIG.whatsappButtonEn}</span>
            </a>

            {/* Disclaimers & Notes */}
            <div className="rounded-xl bg-amber-50/80 p-3 text-[11px] text-amber-900 border border-amber-200/60 space-y-1">
              <p className="flex items-start gap-1.5 font-medium">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-700" />
                <span>{isKn ? CUSTOMER_CARE_CONFIG.disclaimerKn : CUSTOMER_CARE_CONFIG.disclaimerEn}</span>
              </p>
              <p className="text-[10px] text-amber-800/80 pl-5">
                {isKn ? CUSTOMER_CARE_CONFIG.whatsappNoteKn : CUSTOMER_CARE_CONFIG.whatsappNoteEn}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feature Explanations */}
        <section className="mt-10">
          <div className="mb-4 text-center sm:text-left">
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              {isKn ? "ರೈತ ಸೇವಾದಲ್ಲಿ ಲಭ್ಯವಿರುವ ಪ್ರಮುಖ ಸೌಲಭ್ಯಗಳು" : "Core Agricultural Features Available"}
            </h2>
            <p className="text-xs text-gray-500">
              {isKn
                ? "ನಮ್ಮ ಅಪ್ಲಿಕೇಶನ್‌ನಲ್ಲಿ ನೀವು ಬಳಸಬಹುದಾದ ಸೇವೆಗಳ ವಿವರ ಇಲ್ಲಿದೆ:"
                : "Explore smart farming tools designed for precision and productivity:"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Feature 1: Weather */}
            <Card className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:border-green-300 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <CloudSun className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {isKn ? "ಹವಾಮಾನ ಮಾಹಿತಿ" : "Weather Advisor"}
                    </h3>
                    <p className="text-[11px] text-gray-500">7-Day Rain & Spray Forecast</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-[10px] font-semibold text-green-800 border-green-200">
                  <CheckCircle2 className="mr-1 h-3 w-3 text-green-600" />
                  {isKn ? "ಚಾಲ್ತಿಯಲ್ಲಿದೆ" : "Active"}
                </Badge>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-600">
                {isKn
                  ? "ಮುಂದಿನ 7 ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ, ತಾಪಮಾನ, ಮಳೆಯ ಸಾಧ್ಯತೆ ಮತ್ತು ಕೃಷಿ ಸಿಂಪಡಣೆಗೆ ಸೂಕ್ತ ದಿನಗಳ ಸಲಹೆ."
                  : "Hyperlocal 7-day forecast with GPS pinpoint accuracy for rainfall, spray timing, and harvesting windows."}
              </p>
            </Card>

            {/* Feature 2: Pest & Disease */}
            <Card className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:border-green-300 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                    <Bug className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {isKn ? "ಕೀಟ ಮತ್ತು ರೋಗ ಎಚ್ಚರಿಕೆಗಳು" : "Pest & Disease Diagnosis"}
                    </h3>
                    <p className="text-[11px] text-gray-500">AI Leaf Scan & Bulletins</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-[10px] font-semibold text-green-800 border-green-200">
                  <CheckCircle2 className="mr-1 h-3 w-3 text-green-600" />
                  {isKn ? "ಚಾಲ್ತಿಯಲ್ಲಿದೆ" : "Active"}
                </Badge>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-600">
                {isKn
                  ? "ಬೆಳೆಯ ಎಲೆ ಅಥವಾ ರೋಗದ ಫೋಟೋ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಅಥವಾ ಲಕ್ಷಣ ವಿವರಿಸಿ. ಅಧಿಕೃತ ICAR/UASB ಶಿಫಾರಸಿನ ಸುರಕ್ಷಿತ ಔಷಧ ಪ್ರಮಾಣ ಪಡೆಯಿರಿ."
                  : "Scan leaf disease photos or explore synchronized advisories from UAS Bengaluru, ICAR, and Raitamitra."}
              </p>
            </Card>

            {/* Feature 3: Market Prices */}
            <Card className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:border-green-300 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {isKn ? "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಮಾಹಿತಿ" : "Market Mandi Rates"}
                    </h3>
                    <p className="text-[11px] text-gray-500">Live APMC & 7-Day Forecast</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-[10px] font-semibold text-green-800 border-green-200">
                  <CheckCircle2 className="mr-1 h-3 w-3 text-green-600" />
                  {isKn ? "ಚಾಲ್ತಿಯಲ್ಲಿದೆ" : "Active"}
                </Badge>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-600">
                {isKn
                  ? "ಮಂಡ್ಯ ಮತ್ತು ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆಗಳಲ್ಲಿ ಭತ್ತ, ರಾಗಿ, ಬೆಲ್ಲ, ತರಕಾರಿಗಳ ಇತ್ತೀಚಿನ ಕನಿಷ್ಠ ಮತ್ತು ಗರಿಷ್ಠ ಬೆಲೆಗಳು."
                  : "Live AGMARKNET prices, price trend indicators, and sell-or-hold recommendations for local mandis."}
              </p>
            </Card>

            {/* Feature 4: Schemes & Loans */}
            <Card className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:border-green-300 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {isKn ? "ಯೋಜನೆಗಳು & ಸಾಲ ಸ್ಕ್ಯಾನರ್" : "Schemes, Loans & Scanner"}
                    </h3>
                    <p className="text-[11px] text-gray-500">Subsidies & Link Verifier</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-[10px] font-semibold text-green-800 border-green-200">
                  <CheckCircle2 className="mr-1 h-3 w-3 text-green-600" />
                  {isKn ? "ಚಾಲ್ತಿಯಲ್ಲಿದೆ" : "Active"}
                </Badge>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-600">
                {isKn
                  ? "PM-KISAN, ಬೆಳೆ ವಿಮೆ, 40-50% ಯಂತ್ರೋಪಕರಣ ಸಬ್ಸಿಡಿ ಮತ್ತು 4% KCC ಸಾಲದ ಮಾಹಿತಿ ಜೊತೆಗೆ ವಂಚನೆ ತಡೆಗಟ್ಟುವ ಲಿಂಕ್ ಸ್ಕ್ಯಾನರ್."
                  : "PM-KISAN income support, PMFBY insurance, 50% mechanization subsidies, and anti-fraud URL verification."}
              </p>
            </Card>
          </div>
        </section>

        {/* Primary Continue Button */}
        <div className="mt-10 pb-8 text-center">
          <Button
            size="lg"
            onClick={() => completeOnboardingAndProceed("/")}
            className="h-14 w-full max-w-md rounded-2xl bg-green-600 px-8 text-base font-extrabold text-white shadow-xl shadow-green-200 hover:bg-green-700 active:scale-98"
          >
            <span>{isKn ? CUSTOMER_CARE_CONFIG.skipButtonKn : CUSTOMER_CARE_CONFIG.skipButtonEn}</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="mt-2 text-[11px] text-gray-500">
            {isKn
              ? "ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ತೆರಳಿ ಹವಾಮಾನ, ಬೆಳೆ ಸಲಹೆ ಮತ್ತು ಮಂಡಿ ಬೆಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ."
              : "Proceed to your dashboard to view weather forecasts, pest alerts, and mandi market prices."}
          </p>
        </div>
      </div>
    </main>
  );
}
export default OnboardingPage;
