import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  Check,
  CloudRain,
  Bug,
  TrendingUp,
  Landmark,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/context/language-context";
import {
  AgriculturalUpdateNotification,
  fetchAgriculturalUpdates,
  getDismissedNotificationIds,
  markAllNotificationsDismissed,
  markNotificationDismissed,
} from "@/lib/agricultural-notifications";

export function NotificationBell() {
  const { language } = useLanguage();
  const [updates, setUpdates] = useState<AgriculturalUpdateNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Record<string, number>>({});
  const [isOpen, setIsOpen] = useState(false);

  // Load updates on mount
  const refreshUpdates = useCallback(async () => {
    try {
      const all = await fetchAgriculturalUpdates();
      setUpdates(all);
      setDismissedIds(getDismissedNotificationIds());
    } catch {
      // Safe fallback
    }
  }, []);

  useEffect(() => {
    refreshUpdates();
  }, [refreshUpdates]);

  // Unread items are those whose ID is not in dismissedIds
  const unreadCount = updates.filter((u) => !dismissedIds[u.id]).length;

  const handleMarkAllRead = () => {
    const allIds = updates.map((u) => u.id);
    markAllNotificationsDismissed(allIds);
    setDismissedIds(getDismissedNotificationIds());
  };

  const handleItemClick = (id: string) => {
    markNotificationDismissed(id);
    setDismissedIds(getDismissedNotificationIds());
    setIsOpen(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "weather":
        return <CloudRain className="h-4 w-4 text-amber-500" />;
      case "pest":
        return <Bug className="h-4 w-4 text-rose-500" />;
      case "market":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "scheme":
      default:
        return <Landmark className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread agricultural updates`
              : "Agricultural updates notifications"
          }
          className="relative grid h-8 w-8 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50 hover:text-green-800 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-green-600 cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white shadow-xs animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 rounded-3xl p-2 shadow-2xl bg-white border border-gray-100 z-50 max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">
              {language === "kn"
                ? "ಕೃಷಿ ನವೀಕರಣಗಳು"
                : language === "hi"
                ? "कृषि अपडेट व अलर्ट"
                : "Agricultural Updates"}
            </h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-800 font-bold px-1.5 py-0">
                {unreadCount} new
              </Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-[11px] font-bold text-green-700 hover:text-green-900 transition-colors cursor-pointer"
            >
              {language === "kn"
                ? "ಓದಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ"
                : language === "hi"
                ? "सब पढ़ा हुआ मानें"
                : "Mark all read"}
            </button>
          )}
        </div>

        {/* Updates List */}
        <div className="divide-y divide-gray-50 py-1">
          {updates.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-500">
              <ShieldCheck className="mx-auto h-8 w-8 text-green-500 mb-1" />
              <p>
                {language === "kn"
                  ? "ಯಾವುದೇ ಹೊಸ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ."
                  : language === "hi"
                  ? "कोई नया अपडेट नहीं है।"
                  : "All agricultural advisories are up to date."}
              </p>
            </div>
          ) : (
            updates.map((item) => {
              const isUnread = !dismissedIds[item.id];
              const title =
                language === "kn"
                  ? item.titleKn
                  : language === "hi"
                  ? item.titleHi
                  : item.titleEn;

              const timeText =
                language === "kn"
                  ? item.relativeTimeKn
                  : language === "hi"
                  ? item.relativeTimeHi
                  : item.relativeTimeEn;

              return (
                <DropdownMenuItem key={item.id} asChild className="p-0 focus:bg-transparent">
                  <Link
                    to={item.internalUrl as any}
                    onClick={() => handleItemClick(item.id)}
                    className={`block w-full p-2.5 rounded-2xl transition-colors cursor-pointer ${
                      isUnread
                        ? "bg-green-50/70 hover:bg-green-100/60"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0 rounded-xl bg-white p-1.5 shadow-2xs border border-gray-100">
                        {getCategoryIcon(item.category)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[9px] font-extrabold uppercase tracking-wider ${
                              item.priority === "urgent" ? "text-red-600" : "text-green-700"
                            }`}
                          >
                            {item.priority === "urgent"
                              ? language === "kn"
                                ? "ಅತ್ಯಗತ್ಯ"
                                : "Urgent"
                              : language === "kn"
                              ? "ನವೀಕರಣ"
                              : "Update"}
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            {timeText}
                          </span>
                        </div>

                        <p className={`text-xs leading-snug line-clamp-2 mt-0.5 ${isUnread ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                          {title}
                        </p>

                        <div className="mt-1 flex items-center justify-between text-[10px] text-gray-500">
                          <span className="truncate">{item.source}</span>
                          <ChevronRight className="h-3 w-3 text-gray-400 shrink-0 ml-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              );
            })
          )}
        </div>

        {/* Footer */}
        <DropdownMenuSeparator />
        <div className="px-3 py-1.5 text-center">
          <Link
            to="/help"
            onClick={() => setIsOpen(false)}
            className="text-[11px] font-bold text-green-700 hover:underline"
          >
            {language === "kn"
              ? "ಕೃಷಿ ಸಹಾಯ ಮತ್ತು ಪರಿಶೀಲಿತ ಮಾಹಿತಿ ಮೂಲಗಳು"
              : language === "hi"
              ? "कृषि सहायता और सत्यापित स्रोत"
              : "Verified Agricultural Sources & Helpdesk"}
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationBell;
