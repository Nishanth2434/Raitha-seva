import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Globe,
  ArrowLeft,
  LayoutDashboard,
  Sparkles,
  CloudSun,
  Bug,
  TrendingUp,
  Mic,
  HelpCircle,
  Landmark,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, languages, LanguageCode } from "@/context/language-context";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname === "/dashboard";

  async function signOut() {
    logout();
    navigate({ to: "/login", replace: true });
  }

  // Close mobile drawer on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  // Primary navigation items visible directly on desktop
  const primaryLinks = [
    { to: "/dashboard", label: t("nav_home", "Home"), icon: LayoutDashboard },
    { to: "/assistant", label: t("nav_ai", "AI"), icon: Sparkles },
    { to: "/weather", label: t("nav_weather_short", "Weather"), icon: CloudSun },
    { to: "/pest-alerts", label: t("nav_pests", "Pests"), icon: Bug },
    { to: "/market-prices", label: t("nav_prices", "Prices"), icon: TrendingUp },
  ];

  // Secondary items placed into the "More" dropdown on desktop
  const secondaryLinks = [
    { to: "/schemes", label: t("nav_schemes_short", "Schemes"), icon: Landmark },
    { to: "/voice-assistant", label: t("nav_voice_short", "Voice"), icon: Mic },
    { to: "/help", label: t("nav_help_short", "Help"), icon: HelpCircle },
  ];

  // Complete list for mobile menu
  const allLinks = [...primaryLinks, ...secondaryLinks];

  const isLinkActive = (to: string) => {
    if (to === "/dashboard") return location.pathname === "/" || location.pathname === "/dashboard";
    if (to === "/pest-alerts") return location.pathname === "/pest-alerts" || location.pathname === "/pest";
    if (to === "/market-prices") return location.pathname === "/market-prices" || location.pathname === "/market";
    if (to === "/schemes") return location.pathname === "/schemes";
    if (to === "/help") return location.pathname === "/help" || location.pathname === "/onboarding" || location.pathname === "/saathi";
    return location.pathname === to;
  };

  const isMoreActive = secondaryLinks.some((l) => isLinkActive(l.to));

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-md">
        <nav className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6">
          {/* Logo & Complete Brand Name on One Line */}
          <div className="flex shrink-0 items-center gap-2">
            {!isHome && (
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && window.history.length > 1 && (window.history.state?.idx ?? 0) > 0) {
                    window.history.back();
                  } else {
                    navigate({ to: "/dashboard" as any });
                  }
                }}
                aria-label={t("back", "Back")}
                title={t("nav_back", "Back to Home")}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border bg-white text-gray-700 shadow-2xs hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors lg:hidden cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 text-green-600" />
              </button>
            )}

            <Link
              to="/dashboard"
              className="flex shrink-0 items-center gap-2 whitespace-nowrap focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-green-600 rounded-lg p-0.5"
            >
              <img
                src="/logo.png"
                alt="Raitha Seva Logo"
                className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 object-contain"
              />
              <span className="text-base sm:text-lg font-black tracking-tight text-gray-900 whitespace-nowrap select-none">
                Raitha<span className="text-green-600">Seva</span> AI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links (Visible on lg and xl screens) */}
          <div className="hidden items-center gap-1 lg:flex xl:gap-1.5">
            {primaryLinks.map((l) => {
              const active = isLinkActive(l.to);
              const IconComp = l.icon;
              return (
                <Link
                  key={l.to}
                  to={l.to as any}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-green-600 ${
                    active
                      ? "bg-green-600 text-white shadow-xs font-bold"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-800"
                  }`}
                >
                  <IconComp className="h-3.5 w-3.5 shrink-0" />
                  <span className="whitespace-nowrap">{l.label}</span>
                </Link>
              );
            })}

            {/* "More" Dropdown Menu for Secondary Items (Schemes, Voice, Help) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-green-600 ${
                    isMoreActive
                      ? "bg-green-100 text-green-900 font-bold border border-green-300"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-800"
                  }`}
                  aria-label={t("nav_more", "More navigation items")}
                >
                  <span className="whitespace-nowrap">{t("nav_more", "More")}</span>
                  <ChevronDown className="h-3 w-3 shrink-0 opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-2xl p-1.5 shadow-xl bg-white border border-gray-100">
                {secondaryLinks.map((l) => {
                  const active = isLinkActive(l.to);
                  const IconComp = l.icon;
                  return (
                    <DropdownMenuItem key={l.to} asChild>
                      <Link
                        to={l.to as any}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                          active
                            ? "bg-green-50 text-green-700 font-bold"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <IconComp className={`h-4 w-4 shrink-0 ${active ? "text-green-600" : "text-gray-500"}`} />
                        <span className="whitespace-nowrap">{l.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Subtle Divider */}
            <div className="h-4 w-px bg-gray-200 mx-1" aria-hidden="true" />

            {/* Compact Language Selector (Code Only: EN / KN / HI) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-gray-200 gap-1 px-2.5 h-8 text-xs font-bold text-gray-700 hover:border-green-300 hover:bg-green-50 hover:text-green-800 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-green-600"
                  aria-label={`Current language: ${currentLangObj?.name}. Click to change language.`}
                  title="Select language"
                >
                  <Globe className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  <span className="uppercase">{language}</span>
                  <ChevronDown className="h-2.5 w-2.5 opacity-60 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 rounded-2xl p-1.5 shadow-xl bg-white border border-gray-100">
                {languages.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => setLanguage(l.code as LanguageCode)}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer flex items-center justify-between ${
                      language === l.code ? "bg-green-50 text-green-700 font-bold" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{l.nativeName}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400">{l.code}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile & Logout (Desktop) */}
            {user ? (
              <div className="flex items-center gap-1 ml-0.5">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className={`rounded-full h-8 px-3 text-xs whitespace-nowrap border-gray-200 focus-visible:ring-2 focus-visible:ring-green-600 ${
                    location.pathname === "/profile" ? "bg-green-50 border-green-300 text-green-800 font-bold" : ""
                  }`}
                >
                  <Link to="/profile">
                    <UserIcon className="mr-1 h-3.5 w-3.5 text-green-700 shrink-0" />
                    <span className="whitespace-nowrap">{t("nav_profile", "Profile")}</span>
                  </Link>
                </Button>

                {/* Accessible Icon-Only Logout Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full h-8 w-8 p-0 text-gray-500 hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
                  onClick={signOut}
                  aria-label={t("nav_signout", "Sign out")}
                  title={t("nav_signout", "Sign out")}
                >
                  <LogOut className="h-3.5 w-3.5 shrink-0" />
                  <span className="sr-only">{t("nav_signout", "Sign out")}</span>
                </Button>
              </div>
            ) : (
              <Button
                asChild
                size="sm"
                className="rounded-full bg-green-600 font-bold text-white shadow-xs hover:bg-green-700 h-8 px-3.5 text-xs whitespace-nowrap ml-0.5 focus-visible:ring-2 focus-visible:ring-green-600"
              >
                <Link to="/login">{t("nav_signin", "Sign in")}</Link>
              </Button>
            )}
          </div>

          {/* Mobile Right Controls: Compact Language & Hamburger (Visible on < lg) */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-gray-200 gap-1 px-2.5 h-8 text-xs font-bold text-gray-700"
                  aria-label={`Current language: ${currentLangObj?.name}`}
                  title="Select language"
                >
                  <Globe className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  <span className="uppercase">{language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 rounded-2xl p-1.5 shadow-xl bg-white border border-gray-100">
                {languages.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => setLanguage(l.code as LanguageCode)}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer flex items-center justify-between ${
                      language === l.code ? "bg-green-50 text-green-700 font-bold" : "text-gray-700"
                    }`}
                  >
                    <span>{l.nativeName}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400">{l.code}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              type="button"
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-white text-gray-700 hover:bg-green-50 hover:text-green-800 transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-green-600"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Collapsible Mobile Menu Drawer (< lg) */}
        {open && (
          <div
            ref={mobileMenuRef}
            className="border-t border-border bg-white/98 backdrop-blur-md px-4 pb-6 pt-3 lg:hidden animate-fade-down shadow-xl"
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {allLinks.map((l) => {
                const active = isLinkActive(l.to);
                const IconComp = l.icon;
                return (
                  <Link
                    key={l.to}
                    to={l.to as any}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 rounded-2xl p-2.5 text-xs font-bold transition-all min-h-[48px] ${
                      active
                        ? "bg-green-600 text-white shadow-xs"
                        : "bg-gray-50 text-gray-800 hover:bg-green-50 hover:text-green-800 border border-gray-100"
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
                        active ? "bg-white/20 text-white" : "bg-white text-green-700 shadow-2xs border border-gray-100"
                      }`}
                    >
                      <IconComp className="h-4 w-4" />
                    </span>
                    <span className="truncate">{l.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Profile & Logout Actions */}
            <div className="mt-4 border-t border-gray-100 pt-3">
              {user ? (
                <div className="flex items-center justify-between gap-2">
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-800 min-h-[44px] hover:bg-gray-200 transition-colors"
                  >
                    <UserIcon className="h-4 w-4 text-green-600" />
                    <span>{t("nav_profile", "Profile")}</span>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs min-h-[44px] border-rose-200 text-rose-700 hover:bg-rose-50"
                    onClick={() => {
                      setOpen(false);
                      signOut();
                    }}
                  >
                    <LogOut className="h-3.5 w-3.5 mr-1.5 text-rose-500" />
                    <span>{t("nav_signout", "Sign out")}</span>
                  </Button>
                </div>
              ) : (
                <Button asChild className="w-full rounded-2xl bg-green-600 text-white font-bold text-xs min-h-[44px]">
                  <Link to="/login" onClick={() => setOpen(false)}>
                    {t("nav_signin", "Sign in")}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Quick Bar for farmers on handheld devices */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200/80 bg-white/95 px-2 py-1.5 backdrop-blur-md lg:hidden">
        <div className="grid grid-cols-5 items-center justify-around gap-1">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center py-1 text-[10px] font-bold ${
              isLinkActive("/dashboard") ? "text-green-600" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <LayoutDashboard className="h-4 w-4 mb-0.5" />
            <span className="truncate max-w-[60px]">{t("nav_home", "Home")}</span>
          </Link>

          <Link
            to="/assistant"
            className={`flex flex-col items-center py-1 text-[10px] font-bold ${
              isLinkActive("/assistant") ? "text-green-600" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Sparkles className="h-4 w-4 mb-0.5" />
            <span className="truncate max-w-[60px]">{t("nav_ai", "AI")}</span>
          </Link>

          <Link
            to="/weather"
            className={`flex flex-col items-center py-1 text-[10px] font-bold ${
              isLinkActive("/weather") ? "text-green-600" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <CloudSun className="h-4 w-4 mb-0.5" />
            <span className="truncate max-w-[60px]">{t("nav_weather_short", "Weather")}</span>
          </Link>

          <Link
            to="/pest-alerts"
            className={`flex flex-col items-center py-1 text-[10px] font-bold ${
              isLinkActive("/pest-alerts") ? "text-green-600" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Bug className="h-4 w-4 mb-0.5" />
            <span className="truncate max-w-[60px]">{t("nav_pests", "Pests")}</span>
          </Link>

          <Link
            to="/help"
            className={`flex flex-col items-center py-1 text-[10px] font-bold ${
              isLinkActive("/help") ? "text-green-600" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <HelpCircle className="h-4 w-4 mb-0.5" />
            <span className="truncate max-w-[60px]">{t("nav_help_short", "Help")}</span>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Navbar;
