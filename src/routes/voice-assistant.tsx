import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Loader2,
  Phone,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Radio,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PageShell } from "@/components/site/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/language-context";
import { toast } from "sonner";

export const Route = createFileRoute("/voice-assistant")({
  head: () => ({
    meta: [
      { title: "ಕನ್ನಡ ಧ್ವನಿ ಸಹಾಯಕ | Raitha Seva Kannada Voice AI" },
      {
        name: "description",
        content:
          "ಕನ್ನಡದಲ್ಲೇ ಮಾತನಾಡಿ ಕೃಷಿ ಸಲಹೆ ಪಡೆಯಿರಿ. Voice AI assistant for Karnataka farmers supporting Kannada speech recognition and text-to-speech.",
      },
    ],
  }),
  component: VoiceAssistantPage,
});

export function VoiceAssistantPage() {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === "kn" ? "kn-IN" : "en-IN";

      recognition.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        setTranscript(spokenText);
        setIsListening(false);
        askAssistant(spokenText);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error(
          language === "kn"
            ? "ಧ್ವನಿ ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ಪರಿಶೀಲಿಸಿ."
            : "Could not capture voice. Please check microphone permissions."
        );
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        toast.info(
          language === "kn"
            ? "ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಸೌಲಭ್ಯ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಟೈಪ್ ಮಾಡಿ."
            : "Speech recognition not supported in this browser."
        );
        return;
      }
      setTranscript("");
      setAiAnswer("");
      setIsListening(true);
      try {
        recognitionRef.current.lang = language === "kn" ? "kn-IN" : "en-IN";
        recognitionRef.current.start();
      } catch {
        setIsListening(false);
      }
    }
  };

  const askAssistant = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);

    const backendUrl = import.meta.env["VITE_BACKEND_API_URL"] || "http://127.0.0.1:8000";

    try {
      const res = await fetch(`${backendUrl}/api/assistant/ask/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          language: language === "kn" ? "kn" : "en",
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setAiAnswer(data.answer);
      speakText(data.answer);
    } catch {
      const fallback =
        language === "kn"
          ? "ಕ್ಷಮಿಸಿ, ಉತ್ತರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ 1800-180-1551 ಗೆ ಕರೆ ಮಾಡಿ."
          : "Unable to reach advisory engine. Please call Kisan Call Centre 1800-180-1551.";
      setAiAnswer(fallback);
      speakText(fallback);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "kn" ? "kn-IN" : "en-IN";
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const samplePrompts = [
    { textKn: "ರಾಗಿಯಲ್ಲಿ ಬೆಂಕಿ ರೋಗಕ್ಕೆ ಯಾವ ಔಷಧ ಸಿಂಪಡಿಸಬೇಕು?", textEn: "What spray is recommended for blast in Ragi?" },
    { textKn: "ಭತ್ತದಲ್ಲಿ ಕಂದು ಜಿಗಿಹುಳು ಬಾಧೆಗೆ ಪರಿಹಾರವೇನು?", textEn: "Remedy for Brown Plant Hopper in paddy?" },
    { textKn: "ಕಬ್ಬಿನಲ್ಲಿ ಸುಳಿ ಕೊರೆಯುವ ಹುಳು ನಿರ್ವಹಣೆ ಹೇಗೆ?", textEn: "How to manage early shoot borer in sugarcane?" },
    { textKn: "ಮಂಡ್ಯ ಮಂಡಿಯಲ್ಲಿ ಭತ್ತದ ಇಂದಿನ ಬೆಲೆ ಎಷ್ಟು?", textEn: "What is today's paddy price in Mandya mandi?" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col">
      <Navbar />

      <PageShell
        eyebrow={t("nav_voice", "Kannada Voice Assistant")}
        title={language === "kn" ? "ಕನ್ನಡ ಧ್ವನಿ ಕೃಷಿ ಸಹಾಯಕ" : "Voice Farming Assistant"}
        description={
          language === "kn"
            ? "ಮೈಕ್ರೊಫೋನ್ ಬಟನ್ ಒತ್ತಿ, ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಯನ್ನು ಕನ್ನಡದಲ್ಲೇ ನೇರವಾಗಿ ಮಾತನಾಡಿ ಕೇಳಿ."
            : "Tap the microphone and speak your farming questions naturally in Kannada or English."
        }
      >
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Main Voice Interaction Card */}
          <Card className="overflow-hidden rounded-3xl border-2 border-green-200 bg-white p-6 sm:p-8 text-center shadow-xl">
            <div className="flex justify-center mb-6">
              <div className="relative">
                {isListening && (
                  <>
                    <span className="absolute -inset-4 rounded-full bg-red-400/30 animate-ping" />
                    <span className="absolute -inset-2 rounded-full bg-red-300/40 animate-pulse" />
                  </>
                )}
                {isSpeaking && (
                  <>
                    <span className="absolute -inset-4 rounded-full bg-green-400/30 animate-ping" />
                    <span className="absolute -inset-2 rounded-full bg-emerald-300/40 animate-pulse" />
                  </>
                )}

                <button
                  type="button"
                  onClick={toggleListening}
                  className={`relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full text-white shadow-2xl transition-all cursor-pointer ${
                    isListening
                      ? "bg-red-600 scale-105"
                      : "bg-linear-to-tr from-green-600 to-emerald-500 hover:scale-105 active:scale-95"
                  }`}
                  aria-label="Toggle Microphone"
                >
                  {isListening ? (
                    <Mic className="h-10 w-10 sm:h-12 sm:w-12 animate-pulse" />
                  ) : (
                    <Mic className="h-10 w-10 sm:h-12 sm:w-12" />
                  )}
                </button>
              </div>
            </div>

            {/* Status Label */}
            <div>
              {isListening && (
                <Badge className="bg-red-100 text-red-800 border-red-300 text-xs px-3 py-1 font-bold animate-pulse">
                  <Radio className="mr-1.5 h-3.5 w-3.5" />
                  {language === "kn" ? "ಧ್ವನಿಯನ್ನು ಆಲಿಸಲಾಗುತ್ತಿದೆ... ಮಾತನಾಡಿ" : "Listening... Speak now"}
                </Badge>
              )}
              {loading && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs px-3 py-1 font-bold">
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  {language === "kn" ? "ಕೃಷಿ ಪರಿಹಾರ ಹುಡುಕಲಾಗುತ್ತಿದೆ..." : "Retrieving official advisory..."}
                </Badge>
              )}
              {isSpeaking && (
                <div className="inline-flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 border-green-300 text-xs px-3 py-1 font-bold">
                    <Volume2 className="mr-1.5 h-3.5 w-3.5" />
                    {language === "kn" ? "ಉತ್ತರ ಹೇಳಲಾಗುತ್ತಿದೆ..." : "Speaking response..."}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={stopSpeaking} className="h-7 text-xs rounded-full">
                    <VolumeX className="h-3 w-3 mr-1" /> ನಿಲ್ಲಿಸಿ
                  </Button>
                </div>
              )}
              {!isListening && !loading && !isSpeaking && (
                <p className="text-sm font-bold text-gray-700">
                  {language === "kn" ? "ಮಾತನಾಡಲು ಮೈಕ್ರೊಫೋನ್ ಬಟನ್ ಒತ್ತಿ" : "Tap the button above and speak"}
                </p>
              )}
            </div>

            {/* Transcript Preview */}
            {transcript && (
              <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-left border border-slate-200">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  {language === "kn" ? "ನೀವು ಕೇಳಿದ ಪ್ರಶ್ನೆ:" : "Your spoken query:"}
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">"{transcript}"</p>
              </div>
            )}

            {/* Spoken Answer */}
            {aiAnswer && (
              <div className="mt-4 rounded-2xl bg-green-50/70 p-4 text-left border border-green-200 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-green-800 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-green-600" />
                    <span>{language === "kn" ? "ಎಐ ಕೃಷಿ ಉತ್ತರ:" : "AI Advisory Answer:"}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => speakText(aiAnswer)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-green-700 hover:text-green-900"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>{language === "kn" ? "ಮತ್ತೆ ಕೇಳಿ" : "Replay"}</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line font-medium">
                  {aiAnswer}
                </p>
              </div>
            )}
          </Card>

          {/* Sample Spoken Prompts */}
          <Card className="rounded-3xl border border-gray-200/90 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-green-600" />
              <span>{language === "kn" ? "ಹೀಗೆ ಕೇಳಿ ನೋಡಿ (ಉದಾಹರಣೆಗಳು):" : "Try saying:"}</span>
            </h3>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const text = language === "kn" ? p.textKn : p.textEn;
                    setTranscript(text);
                    askAssistant(text);
                  }}
                  className="rounded-2xl border border-green-100 bg-green-50/50 p-3 text-left text-xs font-semibold text-green-950 hover:bg-green-100/70 hover:border-green-300 transition-all cursor-pointer"
                >
                  "{language === "kn" ? p.textKn : p.textEn}"
                </button>
              ))}
            </div>
          </Card>
        </div>
      </PageShell>

      <Footer />
    </div>
  );
}
export default VoiceAssistantPage;
