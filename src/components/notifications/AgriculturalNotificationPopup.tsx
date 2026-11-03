import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CloudRain,
  Bug,
  TrendingUp,
  Landmark,
  AlertTriangle,
  X,
  ExternalLink,
  ChevronRight,
  Clock,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/language-context";
import {
  AgriculturalUpdateNotification,
  fetchAgriculturalUpdates,
  getQueueableNotifications,
  markNotificationDismissed,
  incrementSessionPopupCount,
} from "@/lib/agricultural-notifications";

const ROUTINE_AUTO_DISMISS_MS = 7500;

export function AgriculturalNotificationPopup() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [queue, setQueue] = useState<AgriculturalUpdateNotification[]>([]);
  const [current, setCurrent] = useState<AgriculturalUpdateNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load updates on mount and initialize queue
  useEffect(() => {
    let isMounted = true;
    let firstTimer: ReturnType<typeof setTimeout> | undefined;

    fetchAgriculturalUpdates()
      .then((all) => {
        if (!isMounted) return;
        const candidateQueue = getQueueableNotifications(all);
        if (candidateQueue.length > 0) {
          setQueue(candidateQueue);
          // Show first after a short introductory delay (1.5s) so page is ready
          firstTimer = setTimeout(() => {
            if (isMounted && candidateQueue.length > 0) {
              const [first, ...rest] = candidateQueue;
              if (first) {
                setCurrent(first);
                setQueue(rest);
                setIsVisible(true);
                incrementSessionPopupCount();
              }
            }
          }, 1500);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
      if (firstTimer) clearTimeout(firstTimer);
    };
  }, []);

  // Handle dismiss and show next in queue
  const handleDismiss = useCallback(
    (id?: string) => {
      const targetId = id || current?.id;
      if (targetId) {
        markNotificationDismissed(targetId);
      }

      setIsVisible(false);

      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);

      // Advance to next notification in queue after transition
      const nextTimer = setTimeout(() => {
        if (queue.length > 0) {
          const [next, ...rest] = queue;
          if (next) {
            setCurrent(next);
            setQueue(rest);
            setIsVisible(true);
            setProgress(100);
            incrementSessionPopupCount();
          } else {
            setCurrent(null);
          }
        } else {
          setCurrent(null);
        }
      }, 800);

      return () => clearTimeout(nextTimer);
    },
    [current?.id, queue]
  );

  // Handle keyboard Escape to dismiss
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isVisible) {
        handleDismiss();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, handleDismiss]);

  // Handle auto-dismiss for routine notifications
  useEffect(() => {
    if (!isVisible || !current) return;

    if (current.priority === "urgent") {
      // Urgent alerts remain visible until dismissed by the user
      return;
    }

    if (isPaused) {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    const startTime = Date.now();
    const endTime = startTime + ROUTINE_AUTO_DISMISS_MS;

    progressTimerRef.current = setInterval(() => {
      const remaining = endTime - Date.now();
      const pct = Math.max(0, (remaining / ROUTINE_AUTO_DISMISS_MS) * 100);
      setProgress(pct);
    }, 100);

    dismissTimerRef.current = setTimeout(() => {
      handleDismiss();
    }, ROUTINE_AUTO_DISMISS_MS);

    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isVisible, current, isPaused, handleDismiss]);

  if (!current || !isVisible) {
    return null;
  }

  // Localized text resolution
  const title =
    language === "kn"
      ? current.titleKn
      : language === "hi"
      ? current.titleHi
      : current.titleEn;

  const desc =
    language === "kn"
      ? current.descriptionKn
      : language === "hi"
      ? current.descriptionHi
      : current.descriptionEn;

  const timeLabel =
    language === "kn"
      ? current.relativeTimeKn
      : language === "hi"
      ? current.relativeTimeHi
      : current.relativeTimeEn;

  const categoryLabel = {
    pest: language === "kn" ? "ಕೀಟ ರೋಗ ಎಚ್ಚರಿಕೆ" : language === "hi" ? "कीट रोग परामर्श" : "Pest Advisory",
    weather: language === "kn" ? "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ" : language === "hi" ? "मौसम चेतावनी" : "Weather Alert",
    market: language === "kn" ? "ಮಂಡಿ ಬೆಲೆ ನವೀಕರಣ" : language === "hi" ? "मंडी भाव अपडेट" : "Market Prices",
    scheme: language === "kn" ? "ಸರ್ಕಾರಿ ಯೋಜನೆ" : language === "hi" ? "सरकारी योजना" : "Official Scheme",
  }[current.category];

  const priorityLabel =
    current.priority === "urgent"
      ? language === "kn"
        ? "ಅತ್ಯಗತ್ಯ ಎಚ್ಚರಿಕೆ"
        : language === "hi"
        ? "अति आवश्यक"
        : "Urgent Alert"
      : language === "kn"
      ? "ನವೀಕರಣ"
      : language === "hi"
      ? "अपडेट"
      : "Update";

  const actionText =
    language === "kn"
      ? "ವಿವರ ವೀಕ್ಷಿಸಿ"
      : language === "hi"
      ? "विवरण देखें"
      : "View Advisory";

  const isUrgent = current.priority === "urgent";

  return (
    <aside
      role="status"
      aria-live={isUrgent ? "assertive" : "polite"}
      aria-atomic="true"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed z-50 transition-all duration-300 ease-out 
        bottom-20 left-3 right-3 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-md
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
    >
      <div
        className={`relative overflow-hidden rounded-3xl border bg-white shadow-2xl transition-all duration-200
          ${
            isUrgent
              ? "border-red-300 ring-2 ring-red-400/20 shadow-red-100"
              : "border-emerald-200 ring-2 ring-emerald-400/10 shadow-emerald-50"
          }`}
      >
        {/* Progress bar indicator for routine auto-hiding popups */}
        {!isUrgent && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
            <div
              className="h-full bg-emerald-500 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="p-4 sm:p-4.5">
          {/* Header row: Category, Priority Badge, Close button */}
          <div className="flex items-center justify-between gap-2 pb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Category Icon */}
              <span
                className={`grid h-7 w-7 place-items-center rounded-xl text-white shadow-2xs ${
                  current.category === "weather"
                    ? "bg-amber-500"
                    : current.category === "pest"
                    ? "bg-rose-600"
                    : current.category === "market"
                    ? "bg-green-600"
                    : "bg-blue-600"
                }`}
              >
                {current.category === "weather" ? (
                  <CloudRain className="h-4 w-4" />
                ) : current.category === "pest" ? (
                  <Bug className="h-4 w-4" />
                ) : current.category === "market" ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <Landmark className="h-4 w-4" />
                )}
              </span>

              <span className="text-xs font-bold text-gray-800">{categoryLabel}</span>

              {/* Priority Pill */}
              <Badge
                variant="outline"
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isUrgent
                    ? "border-red-300 bg-red-50 text-red-700 animate-pulse"
                    : "border-emerald-300 bg-emerald-50 text-emerald-700"
                }`}
              >
                {isUrgent && <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-red-600" />}
                {priorityLabel}
              </Badge>
            </div>

            {/* Accessible Close Button */}
            <button
              type="button"
              onClick={() => handleDismiss()}
              aria-label={language === "kn" ? "ಮುಚ್ಚಿ" : "Dismiss notification"}
              className="grid h-7 w-7 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Title and Short Description */}
          <div className="mt-1 space-y-1">
            <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-snug tracking-tight">
              {title}
            </h4>
            {desc && (
              <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed line-clamp-2">
                {desc}
              </p>
            )}
          </div>

          {/* Footer Metadata: Institution Source, Date & Action Button */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-gray-500 truncate" title={current.source}>
                {current.source}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <Clock className="h-3 w-3" />
                <span>{timeLabel}</span>
              </div>
            </div>

            {/* Action Button */}
            <Button
              asChild
              size="sm"
              className={`rounded-xl px-3 py-1.5 text-xs font-bold shadow-2xs whitespace-nowrap cursor-pointer ${
                isUrgent
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-700 hover:bg-green-800 text-white"
              }`}
              onClick={() => handleDismiss()}
            >
              <Link to={current.internalUrl as any}>
                <span>{actionText}</span>
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default AgriculturalNotificationPopup;
