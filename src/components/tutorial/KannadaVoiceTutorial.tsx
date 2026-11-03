import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface TutorialStep {
  id: string;
  targetId: string;
  stepNumKn: string;
  titleKn: string;
  titleEn: string;
  speechKn: string;
  summaryKn: string;
  iconName?: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "step-1",
    targetId: "tutorial-welcome",
    stepNumKn: "೧",
    titleKn: "ಮುಖ್ಯಪುಟ ಮತ್ತು ಮೆನು",
    titleEn: "Dashboard & Navigation",
    speechKn:
      "ಇದು ರೈತ ಸೇವಾದ ಮುಖ್ಯಪುಟ ಮತ್ತು ಮೇಲ್ಭಾಗದ ಮೆನು. ಇಲ್ಲಿಂದ ಬೆಳೆ ರೋಗ ಪತ್ತೆ, ಹವಾಮಾನ, ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಮತ್ತು ಕೃಷಿ ಸಲಹೆಗಳಂತಹ ಸೌಲಭ್ಯಗಳನ್ನು ಬಳಸಬಹುದು. ಈಗ ಒಂದೊಂದಾಗಿ ಪ್ರಮುಖ ಸೌಲಭ್ಯಗಳನ್ನು ನೋಡೋಣ.",
    summaryKn:
      "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಪ್ರದೇಶ, ಬೆಳೆಗಳ ಮಾಹಿತಿ ಮತ್ತು ಎಲ್ಲಾ ಕೃಷಿ ಸೌಲಭ್ಯಗಳ ತ್ವರಿತ ಲಿಂಕ್‌ಗಳಿವೆ.",
  },
  {
    id: "step-2",
    targetId: "tutorial-pest",
    stepNumKn: "೨",
    titleKn: "ಬೆಳೆ ರೋಗ ಪತ್ತೆ ಸ್ಕ್ಯಾನ್",
    titleEn: "Crop Disease Diagnosis",
    speechKn:
      "ನಿಮ್ಮ ಬೆಳೆಯ ಎಲೆಗಳಲ್ಲಿ ಕಲೆಗಳು ಅಥವಾ ಬೇರೆ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದರೆ, ಅದರ ಸ್ಪಷ್ಟವಾದ ಫೋಟೋ ತೆಗೆದು ಇಲ್ಲಿ ಅಪ್ಲೋಡ್ ಮಾಡಿ. ಆ್ಯಪ್ ಚಿತ್ರವನ್ನು ಪರಿಶೀಲಿಸಿ ಸಾಧ್ಯವಾದ ಸಮಸ್ಯೆ ಮತ್ತು ಸೂಕ್ತ ಮುಂದಿನ ಕ್ರಮಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ ನೀಡುತ್ತದೆ. ಫಲಿತಾಂಶವನ್ನು ಖಚಿತ ನಿರ್ಣಯವೆಂದು ಭಾವಿಸದೆ, ಅಗತ್ಯವಿದ್ದರೆ ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆಯನ್ನೂ ಪಡೆಯಿರಿ.",
    summaryKn:
      "ಬೆಳೆಯ ಎಲೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ತಕ್ಷಣ ರೋಗ ಪತ್ತೆ ಮತ್ತು ಸುರಕ್ಷಿತ ಪರಿಹಾರ ತಿಳಿಯಿರಿ.",
  },
  {
    id: "step-3",
    targetId: "tutorial-pest",
    stepNumKn: "೩",
    titleKn: "ಕೃಷಿ ಸಲಹೆ ಮತ್ತು ಕೀಟ ಎಚ್ಚರಿಕೆ",
    titleEn: "Pest Warnings & POP",
    speechKn:
      "ನಿಮ್ಮ ಬೆಳೆಗೆ ಸಂಬಂಧಿಸಿದ ಕೃಷಿ ಸಲಹೆಗಳು ಮತ್ತು ಕೀಟಗಳ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಇಲ್ಲಿ ನೋಡಬಹುದು. ಇವು ಬೆಂಗಳೂರು ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯ ಮತ್ತು ಐಸಿಎಆರ್ ಪ್ಯಾಕೇಜ್ ಆಫ್ ಪ್ರಾಕ್ಟೀಸಸ್ ಆಧಾರಿತವಾಗಿವೆ. ಸಲಹೆಯನ್ನು ಅನುಸರಿಸುವ ಮೊದಲು ಅದು ನಿಮ್ಮ ಬೆಳೆ ಮತ್ತು ಸ್ಥಳಕ್ಕೆ ಅನ್ವಯಿಸುತ್ತದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.",
    summaryKn:
      "UAS ಬೆಂಗಳೂರು & ICAR ಅಧಿಕೃತ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಸ್ಥಳೀಯ ಕೀಟ ಮುನ್ಸೂಚನೆಗಳು.",
  },
  {
    id: "step-4",
    targetId: "tutorial-weather",
    stepNumKn: "೪",
    titleKn: "ಹವಾಮಾನ ಮತ್ತು ಸಿಂಪಡಣೆ ಸಲಹೆ",
    titleEn: "Hyperlocal Weather & Spray",
    speechKn:
      "ಇಲ್ಲಿ ನಿಮ್ಮ ಪ್ರದೇಶದ ಹವಾಮಾನ ಮಾಹಿತಿಯನ್ನು ನೋಡಬಹುದು. ಮಳೆ ಬರುವ ಸಾಧ್ಯತೆ, ಗಾಳಿ ಮತ್ತು ತಾಪಮಾನವನ್ನು ಪರಿಶೀಲಿಸಿ ಕೃಷಿ ಕೆಲಸಗಳನ್ನು ಯೋಜಿಸಿ. ಔಷಧ ಸಿಂಪಡಿಸುವ ಮೊದಲು ಹವಾಮಾನ ಮತ್ತು ಔಷಧದ ಲೇಬಲ್ ಸೂಚನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    summaryKn:
      "ಮುಂದಿನ ೭ ದಿನಗಳ ಮಳೆ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಮಳೆಯ ಸಮಯದಲ್ಲಿ ಸಿಂಪಡಣೆ ಮುಂದೂಡುವ ಎಚ್ಚರಿಕೆ.",
  },
  {
    id: "step-5",
    targetId: "tutorial-market",
    stepNumKn: "೫",
    titleKn: "ಮಾರುಕಟ್ಟೆ ಮಂಡಿ ಬೆಲೆಗಳು",
    titleEn: "APMC Mandi Market Rates",
    speechKn:
      "ನೀವು ಮಾರಾಟ ಮಾಡಲು ಬಯಸುವ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ. ಲಭ್ಯವಿದ್ದರೆ ವಿವಿಧ ಮಾರುಕಟ್ಟೆಗಳ ಕನಿಷ್ಠ, ಗರಿಷ್ಠ ಮತ್ತು ಮಾದರಿ ಬೆಲೆಗಳನ್ನು ಇಲ್ಲಿ ನೋಡಬಹುದು. ಬೆಲೆಯ ವರದಿ ದಿನಾಂಕವನ್ನು ಪರಿಶೀಲಿಸಿ. ಇಲ್ಲಿ ಕಾಣುವ ಬೆಲೆ ನಿಮಗೆ ಖಚಿತವಾಗಿ ಸಿಗುವ ಮಾರಾಟ ಬೆಲೆ ಎಂದರ್ಥವಲ್ಲ.",
    summaryKn:
      "ಕರ್ನಾಟಕದ ವಿವಿಧ ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆಗಳ ಲೈವ್ ದರಗಳು ಮತ್ತು ದೈನಂದಿನ ಬೆಲೆ ಏರಿಳಿತ.",
  },
  {
    id: "step-6",
    targetId: "tutorial-assistant",
    stepNumKn: "೬",
    titleKn: "ಕನ್ನಡ ಧ್ವನಿ ಮತ್ತು ಎಐ ಸಹಾಯಕ",
    titleEn: "AI Farming Assistant & Voice",
    speechKn:
      "ನಿಮಗೆ ಕೃಷಿಗೆ ಸಂಬಂಧಿಸಿದ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಇದ್ದರೆ ಇಲ್ಲಿ ಕೇಳಬಹುದು. ಮೈಕ್ರೋಫೋನ್ ಬಟನ್ ಒತ್ತಿ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಕನ್ನಡದಲ್ಲಿ ಹೇಳಿ, ಅಥವಾ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ. ಉತ್ತರವನ್ನು ಕೇಳಬಹುದು ಮತ್ತು ಅರ್ಥವಾಗದಿದ್ದರೆ ಮತ್ತೆ ವಿವರಿಸಲು ಕೇಳಬಹುದು.",
    summaryKn:
      "ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣ, ಕಳೆ ನಿರ್ವಹಣೆ ಮತ್ತು ಬೆಳೆ ಸಮಸ್ಯೆಗಳಿಗೆ ಕನ್ನಡದಲ್ಲೇ ನೇರ ಉತ್ತರ.",
  },
  {
    id: "step-7",
    targetId: "tutorial-schemes",
    stepNumKn: "೭",
    titleKn: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು & ಲಿಂಕ್ ಸ್ಕ್ಯಾನರ್",
    titleEn: "Govt Schemes & Link Scanner",
    speechKn:
      "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಮಾಹಿತಿಯನ್ನು ಇಲ್ಲಿ ಪರಿಶೀಲಿಸಬಹುದು. ಅನುಮಾನಾಸ್ಪದ ಸಂದೇಶದಲ್ಲಿ ಬಂದ ಲಿಂಕ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸದೆ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ, ಬ್ಯಾಂಕ್ ವಿವರಗಳು ಅಥವಾ ಒಟಿಪಿಯನ್ನು ಹಂಚಿಕೊಳ್ಳಬೇಡಿ. ಈ ಲಿಂಕ್ ಸ್ಕ್ಯಾನರ್ ಎಚ್ಚರಿಕೆ ನೀಡುತ್ತದೆ ಆದರೆ ಪ್ರತಿಯೊಂದು ಲಿಂಕ್ ಸುರಕ್ಷಿತವೆಂದು ಸಂಪೂರ್ಣ ಖಾತರಿ ನೀಡಲು ಸಾಧ್ಯವಿಲ್ಲ.",
    summaryKn:
      "ಪಿಎಂ-ಕಿಸಾನ್, ಬೆಳೆ ವಿಮೆ ಮತ್ತು ವಾಟ್ಸಾಪ್ ನಕಲಿ ಲಿಂಕ್ ತಪಾಸಣೆ ಸೌಲಭ್ಯ.",
  },
  {
    id: "step-8",
    targetId: "tutorial-reels",
    stepNumKn: "೮",
    titleKn: "ಕೃಷಿ ಕಲಿಕಾ ವೀಡಿಯೊಗಳು (ರೀಲ್ಸ್)",
    titleEn: "Agri Reels — Practical Farming",
    speechKn:
      "ಇಲ್ಲಿ ಕೃಷಿಗೆ ಸಂಬಂಧಿಸಿದ ಕಲಿಕಾ ವೀಡಿಯೊಗಳನ್ನು ನೋಡಬಹುದು. ಸಾವಯವ ಕೃಷಿ, ಜೀವಾಮೃತ ತಯಾರಿಕೆ ಮತ್ತು ಉಪಕರಣ ಬಳಕೆಯಂತಹ ನಿಮ್ಮ ಕೆಲಸಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ವಿಷಯವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ, ಹಂತ ಹಂತವಾಗಿ ಕಲಿಯಿರಿ.",
    summaryKn:
      "ಪ್ರಗತಿಪರ ರೈತರ ನೈಜ ಪ್ರಾತ್ಯಕ್ಷಿಕೆಗಳು ಮತ್ತು ಸುಲಭ ವಿಧಾನಗಳ ಕಿರು ವೀಡಿಯೊಗಳು.",
  },
  {
    id: "step-9",
    targetId: "tutorial-schemes",
    stepNumKn: "೯",
    titleKn: "ಕೃಷಿ ಉಪಕರಣಗಳು & ಸಬ್ಸಿಡಿ",
    titleEn: "Machinery & Equipment Subsidies",
    speechKn:
      "ಕೃಷಿ ಉಪಕರಣಗಳ ಸಬ್ಸಿಡಿ ವಿವರಗಳು ಇಲ್ಲಿ ಲಭ್ಯವಿವೆ. ಟ್ರ್ಯಾಕ್ಟರ್, ಟಿಲ್ಲರ್ ಮತ್ತು ಡ್ರೋನ್‌ಗಳಿಗೆ ಶೇಕಡಾ ನಲವತ್ತರಿಂದ ಐವತ್ತರವರೆಗಿನ ಸಬ್ಸಿಡಿ ಪಡೆಯುವ ವಿಧಾನ ನೋಡಿ. ಮುಂಬರುವ ದಿನಗಳಲ್ಲಿ ನೇರ ಬಾಡಿಗೆ ಬುಕ್ಕಿಂಗ್ ಸೌಲಭ್ಯವೂ ಸೇರ್ಪಡೆಯಾಗಲಿದೆ.",
    summaryKn:
      "SMAM ಯಂತ್ರೋಪಕರಣ ಸಬ್ಸಿಡಿ ಮತ್ತು ಕಸ್ಟಮ್ ಹೈರಿಂಗ್ ಕೇಂದ್ರಗಳ ವಿವರಗಳು.",
  },
  {
    id: "step-10",
    targetId: "tutorial-help",
    stepNumKn: "೧೦",
    titleKn: "ಭಾಷೆ, ಪ್ರೊಫೈಲ್ ಮತ್ತು ಸಹಾಯವಾಣಿ",
    titleEn: "Language, Profile & Helpline",
    speechKn:
      "ನಿಮಗೆ ಬೇಕಾದ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಬಹುದು. ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಅಧಿಸೂಚನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಬಹುದು. ಯಾವುದೇ ತೊಂದರೆ ಇದ್ದರೆ ನಮ್ಮ ಉಚಿತ ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ ಅಥವಾ ನೇರ ಗ್ರಾಹಕ ಸೇವೆ ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ.",
    summaryKn:
      "ಭಾಷಾ ಬದಲಾವಣೆ, ರೈತರ ಪ್ರೊಫೈಲ್ ಮತ್ತು ೧೮೦೦-೧೮೦-೧೫೫೧ ಉಚಿತ ಸಹಾಯವಾಣಿ.",
  },
];

export const WELCOME_SPEECH_KN =
  "ನಮಸ್ಕಾರ ರೈತರೇ! ರೈತ ಸೇವಾಗೆ ನಿಮಗೆ ಸ್ವಾಗತ. ಈ ಆ್ಯಪ್ನಲ್ಲಿ ನಿಮ್ಮ ಬೆಳೆಗಳ ಸಮಸ್ಯೆಗಳನ್ನು ತಿಳಿದುಕೊಳ್ಳಬಹುದು, ಹವಾಮಾನವನ್ನು ಪರಿಶೀಲಿಸಬಹುದು, ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ನೋಡಬಹುದು ಮತ್ತು ಕೃಷಿಗೆ ಸಂಬಂಧಿಸಿದ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಬಹುದು. ಬನ್ನಿ, ಈ ಆ್ಯಪ್ ಬಳಸುವುದು ಹೇಗೆ ಎಂದು ಒಂದೊಂದಾಗಿ ಕಲಿಯೋಣ.";

export const COMPLETION_SPEECH_KN =
  "ಅಭಿನಂದನೆಗಳು! ರೈತ ಸೇವಾದ ಮುಖ್ಯ ಸೌಲಭ್ಯಗಳನ್ನು ಹೇಗೆ ಬಳಸುವುದು ಎಂದು ನೀವು ಕಲಿತಿದ್ದೀರಿ. ಈಗ ನಿಮಗೆ ಬೇಕಾದ ಕೃಷಿ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಲು ಆ್ಯಪ್ ಬಳಸಬಹುದು. ಮತ್ತೆ ಸಹಾಯ ಬೇಕಾದರೆ ಈ ಪಾಠವನ್ನು ಪುನಃ ಕೇಳಬಹುದು. ಕೃಷಿ ಕಾರ್ಯಗಳಿಗೆ ಶುಭವಾಗಲಿ!";

interface KannadaVoiceTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  initialStepIndex?: number;
}

export function KannadaVoiceTutorial({
  isOpen,
  onClose,
  initialStepIndex = -1, // -1 means show the welcome permission prompt first
}: KannadaVoiceTutorialProps) {
  // -1: Welcome prompt, 0..9: steps, 10: Completion
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(initialStepIndex);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [recognitionSupported, setRecognitionSupported] = useState<boolean>(false);
  const [hasKnVoice, setHasKnVoice] = useState<boolean>(false);
  const [waveformBars, setWaveformBars] = useState<number[]>([40, 70, 30, 85, 50]);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check voice synthesis support and detect Kannada voice
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechSupported(false);
      return;
    }

    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const kn = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith("kn") ||
          v.name.toLowerCase().includes("kannada")
      );
      setHasKnVoice(!!kn);
    };

    checkVoices();
    window.speechSynthesis.onvoiceschanged = checkVoices;

    // Check SpeechRecognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setRecognitionSupported(!!SpeechRecognition);

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Waveform animation when speaking
  useEffect(() => {
    if (isSpeaking && !isPaused) {
      animationTimerRef.current = setInterval(() => {
        setWaveformBars([
          Math.floor(Math.random() * 60) + 20,
          Math.floor(Math.random() * 80) + 20,
          Math.floor(Math.random() * 50) + 20,
          Math.floor(Math.random() * 90) + 20,
          Math.floor(Math.random() * 70) + 20,
        ]);
      }, 150);
    } else {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
      setWaveformBars([20, 20, 20, 20, 20]);
    }

    return () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    };
  }, [isSpeaking, isPaused]);

  // Voice speech synthesis execution
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSpeaking(false);
      return;
    }

    // Cancel existing speech
    window.speechSynthesis.cancel();
    setIsPaused(false);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "kn-IN";
    utterance.rate = 0.92; // Slightly measured, respectful farmer pace
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const knVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().replace("_", "-") === "kn-in" ||
        v.lang.toLowerCase().startsWith("kn") ||
        v.name.toLowerCase().includes("kannada")
    );

    if (knVoice) {
      utterance.voice = knVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      // Ignore user cancellation error
      if (e.error !== "canceled" && e.error !== "interrupted") {
        setIsSpeaking(false);
        setIsPaused(false);
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Stop current speech
  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  // Pause / Resume speech
  const togglePauseResume = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      // If stopped, repeat current
      if (currentStepIndex === -1) {
        speak(WELCOME_SPEECH_KN);
      } else if (currentStepIndex >= 0 && currentStepIndex < TUTORIAL_STEPS.length) {
        const step = TUTORIAL_STEPS[currentStepIndex];
        if (step) speak(step.speechKn);
      } else if (currentStepIndex === TUTORIAL_STEPS.length) {
        speak(COMPLETION_SPEECH_KN);
      }
    }
  }, [isSpeaking, isPaused, currentStepIndex, speak]);

  // Repeat current step speech
  const repeatCurrentSpeech = useCallback(() => {
    if (currentStepIndex === -1) {
      speak(WELCOME_SPEECH_KN);
    } else if (currentStepIndex >= 0 && currentStepIndex < TUTORIAL_STEPS.length) {
      const step = TUTORIAL_STEPS[currentStepIndex];
      if (step) speak(step.speechKn);
    } else if (currentStepIndex === TUTORIAL_STEPS.length) {
      speak(COMPLETION_SPEECH_KN);
    }
  }, [currentStepIndex, speak]);

  // Next step handler
  const handleNext = useCallback(() => {
    stopSpeech();
    if (currentStepIndex < TUTORIAL_STEPS.length) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStepIndex, stopSpeech]);

  // Previous step handler
  const handleBack = useCallback(() => {
    stopSpeech();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    } else if (currentStepIndex === 0) {
      setCurrentStepIndex(-1);
    }
  }, [currentStepIndex, stopSpeech]);

  // Highlight DOM element corresponding to current step
  useEffect(() => {
    if (!isOpen) return;

    let targetEl: HTMLElement | null = null;

    if (currentStepIndex >= 0 && currentStepIndex < TUTORIAL_STEPS.length) {
      const step = TUTORIAL_STEPS[currentStepIndex];
      if (step) {
        targetEl = document.getElementById(step.targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
          targetEl.classList.add("tutorial-highlight-target");
        }
        speak(step.speechKn);
      }
    } else if (currentStepIndex === -1) {
      // Welcome popup
      speak(WELCOME_SPEECH_KN);
    } else if (currentStepIndex === TUTORIAL_STEPS.length) {
      // Completion screen
      speak(COMPLETION_SPEECH_KN);
      // Persist completion flag
      try {
        localStorage.setItem("raitha_seva_tutorial_completed", "true");
        sessionStorage.removeItem("raitha_seva_trigger_tutorial");
      } catch {
        // Storage safe fallback
      }
    }

    return () => {
      if (targetEl) {
        targetEl.classList.remove("tutorial-highlight-target");
      }
    };
  }, [currentStepIndex, isOpen, speak]);

  // Cleanup speech and highlight when modal closes
  const handleClose = useCallback(() => {
    stopSpeech();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    // Remove any remaining highlight from DOM
    document.querySelectorAll(".tutorial-highlight-target").forEach((el) => {
      el.classList.remove("tutorial-highlight-target");
    });
    try {
      sessionStorage.removeItem("raitha_seva_trigger_tutorial");
    } catch {
      // ignore
    }
    onClose();
  }, [stopSpeech, onClose]);

  // Setup Kannada Speech Recognition for voice navigation commands
  const toggleVoiceCommands = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.info("ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಆಜ್ಞೆ ಬೆಂಬಲವಿಲ್ಲ. ಕೆಳಗಿನ ಬಟನ್‌ಗಳನ್ನು ಬಳಸಿ.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "kn-IN";
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        toast.success("ಕನ್ನಡ ಧ್ವನಿ ಆಜ್ಞೆ ಸಕ್ರಿಯವಾಗಿದೆ. 'ಮುಂದೆ', 'ಹಿಂದೆ', 'ಮತ್ತೆ ಹೇಳಿ' ಅಥವಾ 'ನಿಲ್ಲಿಸಿ' ಎಂದು ಹೇಳಿ.");
      };

      recognition.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const transcriptText = event.results[lastResultIndex][0].transcript.trim().toLowerCase();

        // Match Kannada voice commands
        if (
          transcriptText.includes("ಮುಂದೆ") ||
          transcriptText.includes("ಮುಂದಿನದು") ||
          transcriptText.includes("ನೆಕ್ಸ್ಟ್") ||
          transcriptText.includes("next")
        ) {
          toast.success("ಧ್ವನಿ ಆಜ್ಞೆ: ಮುಂದೆ (Next)");
          handleNext();
        } else if (
          transcriptText.includes("ಹಿಂದೆ") ||
          transcriptText.includes("ಹಿಂದಿನದು") ||
          transcriptText.includes("ಬ್ಯಾಕ್") ||
          transcriptText.includes("back")
        ) {
          toast.success("ಧ್ವನಿ ಆಜ್ಞೆ: ಹಿಂದೆ (Back)");
          handleBack();
        } else if (
          transcriptText.includes("ಮತ್ತೆ ಹೇಳಿ") ||
          transcriptText.includes("ಮತ್ತೆ") ||
          transcriptText.includes("ಪುನಃ") ||
          transcriptText.includes("repeat")
        ) {
          toast.success("ಧ್ವನಿ ಆಜ್ಞೆ: ಮತ್ತೆ ಹೇಳಿ (Repeat)");
          repeatCurrentSpeech();
        } else if (
          transcriptText.includes("ನಿಲ್ಲಿಸಿ") ||
          transcriptText.includes("ನಿಲ್ಲಿಸು") ||
          transcriptText.includes("ಮುಗಿಸಿ") ||
          transcriptText.includes("ಪಾಠ ಮುಗಿಸು") ||
          transcriptText.includes("ಸ್ಟಾಪ್") ||
          transcriptText.includes("stop")
        ) {
          toast.success("ಧ್ವನಿ ಆಜ್ಞೆ: ನಿಲ್ಲಿಸಿ (Stop)");
          handleClose();
        } else if (
          transcriptText.includes("ಮುಂದುವರಿಸಿ") ||
          transcriptText.includes("ಪ್ರಾರಂಭಿಸು") ||
          transcriptText.includes("resume")
        ) {
          toast.success("ಧ್ವನಿ ಆಜ್ಞೆ: ಮುಂದುವರಿಸಿ (Resume)");
          togglePauseResume();
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      toast.error("ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ದೃಢೀಕರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.");
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handleBack();
      } else if (e.key === " " && currentStepIndex >= 0) {
        e.preventDefault();
        togglePauseResume();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose, handleNext, handleBack, togglePauseResume, currentStepIndex]);

  if (!isOpen) return null;

  const currentStep =
    currentStepIndex >= 0 && currentStepIndex < TUTORIAL_STEPS.length
      ? TUTORIAL_STEPS[currentStepIndex]
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* ─── 1. STEP -1: WELCOME & PERMISSION PROMPT ─── */}
      {currentStepIndex === -1 && (
        <div className="relative w-full max-w-lg rounded-3xl border-2 border-emerald-500/80 bg-slate-950 p-6 sm:p-8 text-white shadow-2xl shadow-emerald-950/60 transition-all">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 rounded-full p-2 text-gray-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="ಮುಚ್ಚಿ (Close)"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Assistant Avatar & Waveform */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-green-700 text-white shadow-lg shadow-emerald-500/30">
              <Sparkles className="h-7 w-7 animate-pulse" />
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                  ಕನ್ನಡ ಧ್ವನಿ ಸಹಾಯಕ
                </Badge>
                {isSpeaking && (
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Radio className="h-3 w-3 animate-pulse" /> ಮಾತನಾಡುತ್ತಿದ್ದಾರೆ...
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                ರೈತ ಸೇವಾ ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ
              </h2>
            </div>
          </div>

          {/* Animated Audio Equalizer Waveform */}
          <div className="my-4 flex items-center justify-center gap-1.5 h-8 bg-slate-900/80 rounded-xl px-4 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium mr-2">ಧ್ವನಿ:</span>
            {waveformBars.map((height, i) => (
              <span
                key={i}
                style={{ height: `${height}%` }}
                className="w-1.5 bg-linear-to-t from-emerald-600 to-emerald-400 rounded-full transition-all duration-150"
              />
            ))}
            <span className="text-xs text-emerald-400 font-bold ml-2">ಕನ್ನಡ (kn-IN)</span>
          </div>

          {/* Spoken Message Bubble */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 text-slate-200 text-sm sm:text-base leading-relaxed space-y-2">
            <p className="font-medium">
              “ನಮಸ್ಕಾರ ರೈತರೇ! ರೈತ ಸೇವಾಗೆ ನಿಮಗೆ ಸ್ವಾಗತ. ಈ ಆ್ಯಪ್ನಲ್ಲಿ ನಿಮ್ಮ ಬೆಳೆಗಳ ಸಮಸ್ಯೆಗಳನ್ನು ತಿಳಿದುಕೊಳ್ಳಬಹುದು, ಹವಾಮಾನವನ್ನು ಪರಿಶೀಲಿಸಬಹುದು, ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ನೋಡಬಹುದು ಮತ್ತು ಕೃಷಿಗೆ ಸಂಬಂಧಿಸಿದ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಬಹುದು.”
            </p>
            <p className="text-emerald-300 font-semibold text-xs sm:text-sm">
              ಬನ್ನಿ, ಈ ಆ್ಯಪ್ ಬಳಸುವುದು ಹೇಗೆ ಎಂದು ಧ್ವನಿಯ ಮೂಲಕ ಕಲಿಯೋಣವೇ?
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              onClick={() => {
                stopSpeech();
                setCurrentStepIndex(0);
              }}
              className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-700/40 h-12"
            >
              <Play className="mr-2 h-5 w-5 fill-white" />
              <span>ಹೌದು, ಪ್ರಾರಂಭಿಸಿ (Start Tutorial)</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleClose}
              className="rounded-2xl border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs sm:text-sm h-12"
            >
              <span>ನಂತರ ಕಲಿಯುವೆ (Skip)</span>
            </Button>
          </div>
        </div>
      )}

      {/* ─── 2. ACTIVE STEPS (0 TO 9) ─── */}
      {currentStep && (
        <div className="relative w-full max-w-2xl rounded-3xl border-2 border-emerald-500/90 bg-slate-950 p-5 sm:p-7 text-white shadow-2xl shadow-emerald-950/80 transition-all">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-sm shadow-md shadow-emerald-700/50">
                {currentStep.stepNumKn}
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  ಹಂತ {currentStepIndex + 1} / {TUTORIAL_STEPS.length}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {currentStep.titleKn}
                </h3>
              </div>
            </div>

            {/* Audio Waveform Indicator & Close */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1 h-6 bg-slate-900 rounded-lg px-2.5 border border-slate-800">
                {waveformBars.map((height, i) => (
                  <span
                    key={i}
                    style={{ height: `${height}%` }}
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-150"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-1.5 text-gray-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="ನಿಲ್ಲಿಸಿ ಮತ್ತು ನಿರ್ಗಮಿಸಿ (Exit)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full my-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{
                width: `${((currentStepIndex + 1) / TUTORIAL_STEPS.length) * 100}%`,
              }}
            />
          </div>

          {/* Spoken Speech Display Box with Large Kannada Text */}
          <div className="rounded-2xl bg-linear-to-br from-slate-900 to-slate-950 border border-slate-800 p-4 sm:p-5 text-slate-100 space-y-2">
            <p className="text-sm sm:text-base leading-relaxed font-medium">
              “{currentStep.speechKn}”
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
              <span>ಸಾರಾಂಶ: {currentStep.summaryKn}</span>
            </div>
          </div>

          {/* Voice Recognition Command Bar (Active Listening Indicator) */}
          {isListening && (
            <div className="mt-3 flex items-center justify-between bg-emerald-950/70 border border-emerald-500/50 rounded-xl px-3 py-1.5 text-xs text-emerald-300">
              <span className="flex items-center gap-2 font-bold animate-pulse">
                <Mic className="h-4 w-4 text-emerald-400" />
                <span>ಆಲಿಸಲಾಗುತ್ತಿದೆ... "ಮುಂದೆ", "ಹಿಂದೆ", "ಮತ್ತೆ ಹೇಳಿ" ಎಂದು ಹೇಳಿ</span>
              </span>
              <button
                type="button"
                onClick={toggleVoiceCommands}
                className="text-[10px] underline text-slate-300 hover:text-white"
              >
                ಆಫ್ ಮಾಡಿ
              </button>
            </div>
          )}

          {/* Bottom Controls Bar */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
            {/* Left Controls: Repeat & Voice Command Mic */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={repeatCurrentSpeech}
                className="rounded-xl border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold gap-1.5 h-10 px-3"
                title="ಮತ್ತೆ ಹೇಳಿ (Repeat Audio)"
              >
                <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                <span>ಮತ್ತೆ ಹೇಳಿ (Repeat)</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={togglePauseResume}
                className="rounded-xl border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold gap-1.5 h-10 px-3"
                title={isSpeaking && !isPaused ? "ವಿರಾಮ (Pause)" : "ಮುಂದುವರಿಸಿ (Resume)"}
              >
                {isSpeaking && !isPaused ? (
                  <>
                    <Pause className="h-3.5 w-3.5 text-sky-400" />
                    <span>ವಿರಾಮ</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
                    <span>ಕೇಳಿ</span>
                  </>
                )}
              </Button>

              {recognitionSupported && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleVoiceCommands}
                  className={`rounded-xl border-slate-700 text-xs font-bold gap-1.5 h-10 px-3 ${
                    isListening
                      ? "bg-emerald-600 text-white border-emerald-500 animate-pulse"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-300"
                  }`}
                  title="ಕನ್ನಡ ಧ್ವನಿ ಆಜ್ಞೆಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ"
                >
                  {isListening ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5 text-gray-400" />}
                  <span className="hidden sm:inline">ಧ್ವನಿ ಆಜ್ಞೆ</span>
                </Button>
              )}
            </div>

            {/* Right Controls: Back, Next & Exit */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={handleBack}
                disabled={currentStepIndex === 0}
                className="rounded-xl border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold gap-1 h-10 px-3 disabled:opacity-40"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>ಹಿಂದೆ (Back)</span>
              </Button>

              <Button
                size="sm"
                onClick={handleNext}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold gap-1.5 h-10 px-4 shadow-md shadow-emerald-700/40"
              >
                <span>
                  {currentStepIndex === TUTORIAL_STEPS.length - 1
                    ? "ಮುಗಿಸಿ (Finish)"
                    : "ಮುಂದೆ (Next)"}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. COMPLETION SCREEN ─── */}
      {currentStepIndex === TUTORIAL_STEPS.length && (
        <div className="relative w-full max-w-lg rounded-3xl border-2 border-emerald-500 bg-slate-950 p-6 sm:p-8 text-white shadow-2xl shadow-emerald-950/80 text-center transition-all">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-linear-to-br from-emerald-400 to-green-600 text-white shadow-xl shadow-emerald-500/30 mb-4">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1">
            ಕಲಿಕೆ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ!
          </Badge>

          <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
            ಅಭಿನಂದನೆಗಳು, ರೈತ ಮಿತ್ರರೇ!
          </h2>

          <div className="my-4 rounded-2xl bg-slate-900 border border-slate-800 p-4 text-slate-300 text-xs sm:text-sm leading-relaxed text-left">
            <p>
              “ರೈತ ಸೇವಾದ ಮುಖ್ಯ ಸೌಲಭ್ಯಗಳನ್ನು ಹೇಗೆ ಬಳಸುವುದು ಎಂದು ನೀವು ಯಶಸ್ವಿಯಾಗಿ ಕಲಿತಿದ್ದೀರಿ. ಈಗ ನಿಮಗೆ ಬೇಕಾದ ಕೃಷಿ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಲು ಆ್ಯಪ್ ಬಳಸಬಹುದು. ಮತ್ತೆ ಸಹಾಯ ಬೇಕಾದರೆ ಸಹಾಯ ಪುಟದಲ್ಲಿ ಈ ಪಾಠವನ್ನು ಪುನಃ ಕೇಳಬಹುದು.”
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              onClick={handleClose}
              className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-700/40 h-12"
            >
              <span>ಆ್ಯಪ್ ಬಳಸಲು ಪ್ರಾರಂಭಿಸಿ (Start App)</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                stopSpeech();
                setCurrentStepIndex(0);
              }}
              className="rounded-2xl border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs sm:text-sm h-12"
            >
              <RotateCcw className="mr-1.5 h-4 w-4 text-amber-400" />
              <span>ಮತ್ತೆ ಪಾಠ ಕೇಳಿ (Replay)</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
