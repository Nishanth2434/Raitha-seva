import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Phone,
  BookOpen,
  Wheat,
  ExternalLink,
  Mic,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PageShell } from "@/components/site/PageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/language-context";
import { CUSTOMER_CARE_CONFIG } from "@/lib/customer-care";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI ಕೃಷಿ ಸಹಾಯಕ | Raitha Seva AI Farming Assistant" },
      {
        name: "description",
        content:
          "ಕನ್ನಡದಲ್ಲಿ ಎಐ ಕೃಷಿ ಸಲಹೆಗಾರ. ಭತ್ತ, ರಾಗಿ, ಕಬ್ಬು, ಮೆಕ್ಕೆಜೋಳ ಬೆಳೆಗಳಿಗೆ ಅಧಿಕೃತ UASB ಮತ್ತು ICAR ಪ್ರಮಾಣೀಕೃತ ಕೃಷಿ ಪರಿಹಾರಗಳು.",
      },
    ],
  }),
  component: AssistantPage,
});

interface Citation {
  source_name: string;
  url: string;
  topic?: string;
  authority?: string;
  crop?: string;
}

interface AskResponse {
  success: boolean;
  answer: string;
  language: string;
  sources?: Citation[];
  safety_passed?: boolean;
  warnings?: string[];
  kvk_contact?: {
    name: string;
    phone: string;
    kisan_call_center: string;
  };
}

const CROPS = [
  { id: "Ragi", nameKn: "ರಾಗಿ (Finger Millet)", nameEn: "Ragi" },
  { id: "Paddy", nameKn: "ಭತ್ತ (Paddy)", nameEn: "Paddy" },
  { id: "Sugarcane", nameKn: "ಕಬ್ಬು (Sugarcane)", nameEn: "Sugarcane" },
  { id: "Maize", nameKn: "ಮೆಕ್ಕೆಜೋಳ (Maize)", nameEn: "Maize" },
  { id: "Red Gram", nameKn: "ತೊಗರಿ (Red Gram)", nameEn: "Red Gram" },
  { id: "Tomato", nameKn: "ಟೊಮ್ಯಾಟೊ / ತರಕಾರಿ", nameEn: "Vegetables" },
  { id: "Coconut", nameKn: "ತೆಂಗು (Coconut)", nameEn: "Coconut" },
];

const SUGGESTIONS = [
  { crop: "Ragi", queryKn: "ರಾಗಿಯಲ್ಲಿ ಬೆಂಕಿ ರೋಗ (Blast) ನಿರ್ವಹಣೆಗೆ ಶಿಫಾರಸು ಏನು?", queryEn: "How to manage blast disease in Ragi?" },
  { crop: "Paddy", queryKn: "ಭತ್ತದಲ್ಲಿ ಕಂದು ಜಿಗಿಹುಳು (BPH) ಹತೋಟಿಗೆ ಯಾವ ಔಷಧ ಸಿಂಪಡಿಸಬೇಕು?", queryEn: "What spray is recommended for Brown Plant Hopper in paddy?" },
  { crop: "Sugarcane", queryKn: "ಕಬ್ಬಿನಲ್ಲಿ ಸುಳಿ ಕೊರೆಯುವ ಹುಳು ಬಾಧೆಗೆ ಪರಿಹಾರವೇನು?", queryEn: "Remedy for early shoot borer in sugarcane?" },
  { crop: "Maize", queryKn: "ಮೆಕ್ಕೆಜೋಳದಲ್ಲಿ ಸೈನಿಕ ಹುಳು (Fall Armyworm) ನಿಯಂತ್ರಣ ಹೇಗೆ?", queryEn: "How to control Fall Armyworm in maize?" },
];

export function AssistantPage() {
  const { language, t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState("Ragi");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const text = (customQuery || query).trim();
    if (!text || loading) return;

    setLoading(true);
    setError(null);

    const backendUrl = import.meta.env["VITE_BACKEND_API_URL"] || "http://127.0.0.1:8000";

    try {
      const res = await fetch(`${backendUrl}/api/assistant/ask/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          language: language === "kn" ? "kn" : "en",
          crop: selectedCrop,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned code ${res.status}`);
      }

      const data: AskResponse = await res.json();
      setResponse(data);
    } catch {
      setError(
        language === "kn"
          ? "ಕ್ಷಮಿಸಿ, ಎಐ ಸಂಪರ್ಕದಲ್ಲಿ ತೊಂದರೆ ಉಂಟಾಗಿದೆ. ದಯವಿಟ್ಟು ಕಿಸಾನ್ ಸಹಾಯವಾಣಿ 1800-180-1551 ಅಥವಾ ಕೆವಿಕೆ ಮಂಡ್ಯ ಸಂಪರ್ಕಿಸಿ."
          : "Connection issue with AI assistant. Please try again or call Kisan Call Centre 1800-180-1551."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col">
      <Navbar />

      <PageShell
        eyebrow={t("nav_assistant", "AI Farming Assistant")}
        title={language === "kn" ? "ಕನ್ನಡ ಎಐ ಕೃಷಿ ಸಹಾಯಕ" : "Raitha Seva AI Assistant"}
        description={
          language === "kn"
            ? "ಬೆಂಗಳೂರು ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯ (UASB) ಮತ್ತು ICAR ಮಾರ್ಗಸೂಚಿಗಳ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ಬೆಳೆಗಳಿಗೆ ಸುರಕ್ಷಿತ ಸಲಹೆ."
            : "Evidence-grounded agricultural advisory grounded in UAS Bangalore and ICAR Package of Practices."
        }
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Crop Selector & Prompt Chips */}
          <div className="space-y-4 lg:col-span-1">
            <Card className="rounded-3xl border border-gray-200/90 bg-white shadow-sm p-4">
              <CardHeader className="p-0 pb-3">
                <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Wheat className="h-4 w-4 text-green-600" />
                  <span>{language === "kn" ? "ನಿಮ್ಮ ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ" : "Select Your Crop"}</span>
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  {language === "kn" ? "ಮಂಡ್ಯ ಮತ್ತು ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಬೆಳೆಗಳು" : "Southern Dry Zone crops"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 pt-1 space-y-1.5">
                {CROPS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCrop(c.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      selectedCrop === c.id
                        ? "bg-green-600 text-white shadow-xs font-bold"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>{language === "kn" ? c.nameKn : c.nameEn}</span>
                    {selectedCrop === c.id && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Questions Suggestions */}
            <Card className="rounded-3xl border border-gray-200/90 bg-white shadow-sm p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                {language === "kn" ? "ಪ್ರಮುಖ ಪ್ರಶ್ನೆಗಳು" : "Suggested Queries"}
              </h3>
              <div className="space-y-2">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedCrop(s.crop);
                      setQuery(language === "kn" ? s.queryKn : s.queryEn);
                      handleSubmit(undefined, language === "kn" ? s.queryKn : s.queryEn);
                    }}
                    className="w-full text-left rounded-xl border border-green-100 bg-green-50/50 p-2.5 text-xs text-green-900 hover:bg-green-100/70 hover:border-green-300 transition-all font-medium"
                  >
                    "{language === "kn" ? s.queryKn : s.queryEn}"
                  </button>
                ))}
              </div>
            </Card>

            {/* Emergency KVK Helpline Callout */}
            <Card className="rounded-3xl border-2 border-amber-300 bg-amber-50/70 p-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Phone className="h-4 w-4 text-amber-700 shrink-0" />
                <span>{language === "kn" ? "ನೇರ ತಜ್ಞರ ಸಹಾಯವಾಣಿ" : "Direct Scientist Helpline"}</span>
              </div>
              <p className="mt-1 text-[11px] text-amber-800">
                ICAR-KVK Mandya (V.C. Farm):{" "}
                <a href="tel:08232277456" className="font-bold underline">
                  08232-277456
                </a>
              </p>
              <p className="text-[11px] text-amber-800">
                Kisan Call Centre (Toll-Free):{" "}
                <a href="tel:18001801551" className="font-bold underline">
                  1800-180-1551
                </a>
              </p>
            </Card>
          </div>

          {/* Right Column: Q&A Output & Input Box */}
          <div className="space-y-4 lg:col-span-2">
            {/* Input Box */}
            <Card className="rounded-3xl border border-gray-200/90 bg-white p-4 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="agri-q" className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-green-600" />
                    <span>
                      {language === "kn"
                        ? `${selectedCrop} ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ:`
                        : `Ask agricultural question about ${selectedCrop}:`}
                    </span>
                  </label>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">
                    {selectedCrop}
                  </span>
                </div>

                <textarea
                  id="agri-q"
                  rows={3}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    language === "kn"
                      ? "ಉದಾಹರಣೆಗೆ: ರಾಗಿಯಲ್ಲಿ ಬೆಂಕಿ ರೋಗದ ಲಕ್ಷಣಗಳು ಯಾವುವು? ಯಾವ ಔಷಧ ಮತ್ತು ಎಷ್ಟು ಪ್ರಮಾಣದಲ್ಲಿ ಸಿಂಪಡಿಸಬೇಕು?"
                      : "E.g., What are the symptoms of blast in Ragi? What is the verified chemical spray dose?"
                  }
                  className="w-full rounded-2xl border border-gray-200 p-3 text-xs sm:text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-gray-500">
                    {language === "kn" ? "ಕನ್ನಡ ಮತ್ತು English ಎರಡರಲ್ಲೂ ಕೇಳಬಹುದು" : "Bilingual Kannada & English support"}
                  </p>
                  <Button
                    type="submit"
                    disabled={!query.trim() || loading}
                    className="rounded-full bg-green-600 px-6 font-bold text-white shadow-md hover:bg-green-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>{language === "kn" ? "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..." : "Thinking..."}</span>
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-3.5 w-3.5" />
                        <span>{language === "kn" ? "ಕೇಳಿ (Ask AI)" : "Ask AI"}</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Error Message */}
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* AI Response Display */}
            {response && (
              <Card className="rounded-3xl border-2 border-green-200 bg-white p-5 shadow-lg space-y-4 animate-fade-up">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-green-100 text-green-700 font-bold">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        {language === "kn" ? "ರೈತ ಸೇವಾ ಅಧಿಕೃತ ಕೃಷಿ ಸಲಹೆ" : "Raitha Seva Verified Advisory"}
                      </h4>
                      <p className="text-[10px] text-gray-500">
                        {language === "kn" ? "ಕೃಷಿ ವಿವಿ ಪ್ಯಾಕೇಜ್ ಆಫ್ ಪ್ರಾಕ್ಟೀಸಸ್ ಆಧಾರಿತ" : "Grounded in Official Package of Practices"}
                      </p>
                    </div>
                  </div>

                  {response.safety_passed && (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[11px] font-bold">
                      <ShieldCheck className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                      {language === "kn" ? "ಸುರಕ್ಷತೆ ಪರಿಶೀಲಿಸಲಾಗಿದೆ" : "Safety Verified"}
                    </Badge>
                  )}
                </div>

                <div className="whitespace-pre-line text-xs sm:text-sm text-gray-800 leading-relaxed font-sans bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                  {response.answer}
                </div>

                {/* Sources & Citations */}
                {response.sources && response.sources.length > 0 && (
                  <div className="rounded-2xl border border-gray-100 bg-emerald-50/40 p-3">
                    <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 mb-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-emerald-700" />
                      <span>{language === "kn" ? "ಅಧಿಕೃತ ಮೂಲಗಳು (Citations):" : "Verified Institutional Sources:"}</span>
                    </p>
                    <ul className="space-y-1 text-[11px] text-gray-700">
                      {response.sources.map((src, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="text-emerald-700 font-bold">•</span>
                          <span>{src.source_name}</span>
                          {src.authority && <span className="text-gray-400">({src.authority})</span>}
                          {src.url && (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-700 font-semibold underline hover:text-green-900 inline-flex items-center gap-0.5"
                            >
                              <span>ಲಿಂಕ್</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </PageShell>

      <Footer />
    </div>
  );
}
export default AssistantPage;
