import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Phone,
  MessageCircle,
  Copy,
  Check,
  HelpCircle,
  Sparkles,
  Info,
  Clock,
  Landmark,
  ShieldCheck,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PageShell } from "@/components/site/PageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/language-context";
import { CUSTOMER_CARE_CONFIG } from "@/lib/customer-care";
import { toast } from "sonner";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "ಸಹಾಯ ಮತ್ತು ಗ್ರಾಹಕ ಸೇವೆ | Raitha Seva Help & Customer Care" },
      {
        name: "description",
        content:
          "ರೈತ ಸೇವಾ ಗ್ರಾಹಕ ಸೇವೆ ಸಹಾಯವಾಣಿ: 6360997180. ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ ಮತ್ತು ಕೆವಿಕೆ ಮಂಡ್ಯ ನೇರ ಸಂಪರ್ಕ.",
      },
    ],
  }),
  component: HelpPage,
});

export function HelpPage() {
  const { language, t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(CUSTOMER_CARE_CONFIG.rawPhone);
      setCopied(true);
      toast.success(`${CUSTOMER_CARE_CONFIG.copiedKn} (${CUSTOMER_CARE_CONFIG.formattedPhone})`);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.info(`ಸಂಖ್ಯೆ: ${CUSTOMER_CARE_CONFIG.formattedPhone}`);
    }
  };

  const FAQS = [
    {
      qKn: "ರೈತ ಸೇವಾ ಅಪ್ಲಿಕೇಶನ್ ಸಂಪೂರ್ಣ ಉಚಿತವೇ?",
      qEn: "Is Raitha Seva platform free to use?",
      aKn: "ಹೌದು, ರೈತ ಸೇವಾದ ಎಲ್ಲಾ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ, ರೋಗ ಪತ್ತೆ ಮತ್ತು ಕೃಷಿ ಸಲಹೆಗಳು ಸಂಪೂರ್ಣ ಉಚಿತವಾಗಿ ಲಭ್ಯವಿವೆ.",
      aEn: "Yes, all weather forecasts, pest diagnosis, and advisory tools are free for farmers.",
    },
    {
      qKn: "ಎಐ ಕೃಷಿ ಸಲಹೆಗಳು ಎಷ್ಟು ನಿಖರವಾಗಿವೆ?",
      qEn: "How accurate is the AI agricultural advisory?",
      aKn: "ನಮ್ಮ ಸಲಹೆಗಳು ಬೆಂಗಳೂರು ಕೃಷಿ ವಿವಿ (UASB) ಮತ್ತು ICAR ಅಧಿಕೃತ ಪ್ಯಾಕೇಜ್ ಆಫ್ ಪ್ರಾಕ್ಟೀಸಸ್ ಆಧಾರಿತವಾಗಿದ್ದು, ಅತ್ಯುನ್ನತ ಸುರಕ್ಷತಾ ಪರಿಶೀಲನೆಗೆ ಒಳಪಟ್ಟಿರುತ್ತವೆ.",
      aEn: "All recommendations are grounded in authentic ICAR and UAS Bangalore Package of Practices with pesticide safety validation.",
    },
    {
      qKn: "ತುರ್ತು ಬೆಳೆ ರೋಗ ತೊಂದರೆಗೆ ಯಾರನ್ನು ಸಂಪರ್ಕಿಸಬೇಕು?",
      qEn: "Who to contact for urgent crop emergencies?",
      aKn: "ತಕ್ಷಣವೇ ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ (1800-180-1551) ಅಥವಾ ಸ್ಥಳೀಯ ಕೆವಿಕೆ ಮಂಡ್ಯ (08232-277456) ಗೆ ಕರೆ ಮಾಡಿ.",
      aEn: "Contact Kisan Call Centre at 1800-180-1551 (Toll-free) or ICAR-KVK Mandya at 08232-277456.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col">
      <Navbar />

      <PageShell
        eyebrow={t("nav_help", "Help & Customer Care")}
        title={language === "kn" ? "ಸಹಾಯ ಮತ್ತು ಗ್ರಾಹಕ ಸೇವೆ" : "Help & Customer Care"}
        description={
          language === "kn"
            ? "ಯಾವುದೇ ತಾಂತ್ರಿಕ ನೆರವು, ಅಪ್ಲಿಕೇಶನ್ ಮಾಹಿತಿ ಅಥವಾ ಕೃಷಿ ತಜ್ಞರ ಸಂಪರ್ಕಕ್ಕಾಗಿ ಕೆಳಗಿನ ಸೇವೆಗಳನ್ನು ಬಳಸಿ."
            : "Direct helpline access, customer support, and government extension contact numbers."
        }
      >
        <div className="space-y-6">
          {/* Main Customer Care Card */}
          <Card className="overflow-hidden rounded-3xl border-2 border-green-500 bg-linear-to-br from-green-50 via-white to-emerald-50 p-6 sm:p-8 shadow-xl">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-white shadow-lg shadow-green-200">
                <Phone className="h-7 w-7" />
              </div>

              <div>
                <Badge variant="outline" className="border-amber-400 bg-amber-50 text-[11px] font-bold text-amber-800">
                  {language === "kn" ? CUSTOMER_CARE_CONFIG.labelKn : CUSTOMER_CARE_CONFIG.labelEn}
                </Badge>
                <h3 className="mt-2 text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                  {CUSTOMER_CARE_CONFIG.formattedPhone}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-600">
                  {language === "kn"
                    ? "ರೈತ ಸೇವಾ ಬಳಕೆದಾರರಿಗಾಗಿ ಮೀಸಲಾದ ತಾತ್ಕಾಲಿಕ ಸಹಾಯವಾಣಿ."
                    : "Direct dedicated customer care helpline for Raitha Seva farmers."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
                <a
                  href={CUSTOMER_CARE_CONFIG.telLink}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 text-sm font-bold text-white shadow-md hover:bg-green-700 active:scale-98"
                >
                  <Phone className="h-4 w-4" />
                  <span>{language === "kn" ? CUSTOMER_CARE_CONFIG.callButtonKn : CUSTOMER_CARE_CONFIG.callButtonEn}</span>
                </a>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyPhone}
                  className="h-12 rounded-2xl border-gray-300 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 active:scale-98"
                >
                  {copied ? (
                    <>
                      <Check className="mr-1.5 h-4 w-4 text-green-600" />
                      <span className="text-green-700">
                        {language === "kn" ? CUSTOMER_CARE_CONFIG.copiedKn : CUSTOMER_CARE_CONFIG.copiedEn}
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-4 w-4 text-gray-500" />
                      <span>{language === "kn" ? CUSTOMER_CARE_CONFIG.copyButtonKn : CUSTOMER_CARE_CONFIG.copyButtonEn}</span>
                    </>
                  )}
                </Button>
              </div>

              <a
                href={CUSTOMER_CARE_CONFIG.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <span>{language === "kn" ? CUSTOMER_CARE_CONFIG.whatsappButtonKn : CUSTOMER_CARE_CONFIG.whatsappButtonEn}</span>
              </a>

              <p className="text-[11px] text-amber-900/80 pt-1">
                {language === "kn" ? CUSTOMER_CARE_CONFIG.disclaimerKn : CUSTOMER_CARE_CONFIG.disclaimerEn}
              </p>
            </div>
          </Card>

          {/* Institutional Extension Helplines */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="rounded-3xl border border-gray-200/90 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {language === "kn" ? "ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ (Kisan Call Centre)" : "Kisan Call Centre (KCC Toll-Free)"}
                  </h4>
                  <p className="text-xs text-gray-500">Government of India Toll-Free</p>
                </div>
              </div>

              <p className="text-xs text-gray-600">
                {language === "kn"
                  ? "ದೇಶದ ಯಾವುದೇ ಭಾಗದಿಂದ ಉಚಿತವಾಗಿ ಕರೆ ಮಾಡಿ ಕೃಷಿ ತಜ್ಞರಿಂದ ನೇರ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ."
                  : "Free call from any part of the country for direct guidance from agricultural experts."}
              </p>

              <div className="pt-1">
                <a
                  href="tel:18001801551"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100"
                >
                  <Phone className="h-3.5 w-3.5 text-blue-600" />
                  <span>1800-180-1551 (Toll-Free, 6 AM - 10 PM)</span>
                </a>
              </div>
            </Card>

            <Card className="rounded-3xl border border-gray-200/90 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {language === "kn" ? "ICAR - KVK ಮಂಡ್ಯ (V.C. Farm)" : "ICAR - KVK Mandya (V.C. Farm)"}
                  </h4>
                  <p className="text-xs text-gray-500">Zonal Agricultural Research Station</p>
                </div>
              </div>

              <p className="text-xs text-gray-600">
                {language === "kn"
                  ? "ಮಂಡ್ಯ ಜಿಲ್ಲೆಯ ಸ್ಥಳೀಯ ಮಣ್ಣು, ಬೆಳೆ ರೋಗ ಮತ್ತು ಹವಾಮಾನಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ವೈಜ್ಞಾನಿಕ ಪರಿಹಾರ."
                  : "Scientific remedies tailored to Mandya district soil, crops, and micro-climate."}
              </p>

              <div className="pt-1 flex flex-wrap gap-2">
                <a
                  href="tel:08232277456"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-green-50 px-3.5 py-2 text-xs font-bold text-green-800 hover:bg-green-100"
                >
                  <Phone className="h-3.5 w-3.5 text-green-600" />
                  <span>08232-277456</span>
                </a>
              </div>
            </Card>
          </div>

          {/* Quick Onboarding Tour Link */}
          <Card className="rounded-3xl border border-green-200 bg-linear-to-r from-green-50 to-emerald-50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-green-950 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-700" />
                <span>{language === "kn" ? "ರೈತ ಸೇವಾ ಸಾಥಿ ಮಾರ್ಗದರ್ಶಿ (Onboarding Tour)" : "Raitha Seva Saathi Tour"}</span>
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                {language === "kn"
                  ? "ಅಪ್ಲಿಕೇಶನ್‌ನ ಪ್ರಮುಖ ಸೌಲಭ್ಯಗಳ ಪರಿಚಯ ಮತ್ತು ಸ್ವಾಗತ ಪರದೆಯನ್ನು ವೀಕ್ಷಿಸಿ."
                  : "Explore feature highlights and introductory walkthrough guide."}
              </p>
            </div>
            <Button asChild className="rounded-full bg-green-600 font-bold text-xs text-white hover:bg-green-700 shrink-0">
              <Link to="/onboarding">
                <span>{language === "kn" ? "ಪರಿಚಯ ವೀಕ್ಷಿಸಿ" : "View Tour"}</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </Card>

          {/* FAQs */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-green-600" />
              <span>{language === "kn" ? "ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೋತ್ತರಗಳು (FAQs)" : "Frequently Asked Questions"}</span>
            </h3>

            <div className="space-y-2.5">
              {FAQS.map((faq, idx) => (
                <Card key={idx} className="rounded-2xl border border-gray-200/90 bg-white p-4">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                    {language === "kn" ? faq.qKn : faq.qEn}
                  </h4>
                  <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                    {language === "kn" ? faq.aKn : faq.aEn}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </PageShell>

      <Footer />
    </div>
  );
}
export default HelpPage;
