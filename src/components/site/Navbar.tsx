import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState } from "react";
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
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname === "/dashboard";

  async function signOut() {
    logout();
    navigate({ to: "/login", replace: true });
  }

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  const links = [
    { to: "/dashboard", label: t("nav_dashboard", "Dashboard"), icon: LayoutDashboard },
    { to: "/assistant", label: t("nav_assistant", "AI Assistant"), icon: Sparkles },
    { to: "/weather", label: t("nav_weather", "Weather"), icon: CloudSun },
    { to: "/pest-alerts", label: t("nav_pest", "Pest Alerts"), icon: Bug },
    { to: "/market-prices", label: t("nav_market", "Market Prices"), icon: TrendingUp },
    { to: "/schemes", label: t("nav_schemes", "Schemes & Loans"), icon: Landmark },
    { to: "/voice-assistant", label: t("nav_voice", "Voice AI"), icon: Mic },
    { to: "/help", label: t("nav_help", "Help & Care"), icon: HelpCircle },
  ];

  const isLinkActive = (to: string) => {
    if (to === "/dashboard") return location.pathname === "/" || location.pathname === "/dashboard";
    if (to === "/pest-alerts") return location.pathname === "/pest-alerts" || location.pathname === "/pest";
    if (to === "/market-prices") return location.pathname === "/market-prices" || location.pathname === "/market";
    if (to === "/schemes") return location.pathname === "/schemes";
    if (to === "/help") return location.pathname === "/help" || location.pathname === "/onboarding" || location.pathname === "/saathi";
    return location.pathname === to;
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
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
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border bg-white text-gray-700 shadow-2xs hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors xl:hidden cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 text-green-600" />
              </button>
            )}

            <Link to="/dashboard" className="flex min-w-0 items-center gap-2">
              <img src="/logo.png" alt="Raitha Seva" className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 object-contain" />
              <span className="truncate text-base sm:text-lg font-extrabold tracking-tight">
                Raitha<span className="text-green-600">Seva</span> AI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-1 xl:flex">
            {links.map((l) => {
              const active = isLinkActive(l.to);
              const IconComp = l.icon;
              return (
                <Link
                  key={l.to}
                  to={l.to as any}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-green-600 text-white shadow-xs font-bold"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-800"
                  }`}
                >
                  <IconComp className="h-3.5 w-3.5 shrink-0" />
                  <span>{l.label}</span>
                </Link>
              );
            })}

            {/* Language Selector Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-1 rounded-full border-gray-200 gap-1.5 px-3 h-8"
                >
                  <Globe className="h-3.5 w-3.5 text-green-600" />
                  <span className="font-bold text-xs">{currentLangObj?.nativeName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 rounded-2xl p-1.5 shadow-xl">
                {languages.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => setLanguage(l.code as LanguageCode)}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer flex items-center justify-between ${
                      language === l.code ? "bg-green-50 text-green-700 font-bold" : "text-gray-700"
                    }`}
                  >
                    <span>{l.nativeName}</span>
                    <span className="text-xs text-gray-400">{l.code.toUpperCase()}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile or Sign in */}
            {user ? (
              <div className="ml-1 flex items-center gap-1.5">
                <Button asChild variant="outline" size="sm" className="rounded-full h-8 px-3">
                  <Link to="/profile">
                    <UserIcon className="mr-1 h-3.5 w-3.5" />
                    <span>{t("nav_profile", "Profile")}</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0" onClick={signOut}>
                  <LogOut className="h-3.5 w-3.5 text-gray-500 hover:text-rose-600" />
                </Button>
              </div>
            ) : (
              <Button asChild size="sm" className="ml-1 rounded-full bg-green-600 font-bold text-white shadow-xs hover:bg-green-700 h-8 px-4">
                <Link to="/login">{t("nav_signin", "Sign in")}</Link>
              </Button>
            )}
          </div>

          {/* Mobile Right Controls: Language & Hamburger */}
          <div className="flex items-center gap-1.5 xl:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-gray-200 gap-1 px-2.5 h-8"
                >
                  <Globe className="h-3.5 w-3.5 text-green-600" />
                  <span className="font-bold text-xs">{currentLangObj?.nativeName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 rounded-2xl p-1.5 shadow-xl">
                {languages.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => setLanguage(l.code as LanguageCode)}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer flex items-center justify-between ${
                      language === l.code ? "bg-green-50 text-green-700 font-bold" : "text-gray-700"
                    }`}
                  >
                    <span>{l.nativeName}</span>
                    <span className="text-xs text-gray-400">{l.code.toUpperCase()}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-white text-gray-700"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Collapsible Mobile Drawer */}
        {open && (
          <div className="border-t border-border bg-background px-4 pb-5 pt-3 xl:hidden animate-fade-down shadow-xl">
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {links.map((l) => {
                const active = isLinkActive(l.to);
                const IconComp = l.icon;
                return (
                  <Link
                    key={l.to}
                    to={l.to as any}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                      active
                        ? "bg-green-600 text-white shadow-xs"
                        : "text-gray-700 hover:bg-green-50 hover:text-green-800"
                    }`}
                  >
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"}`}>
                      <IconComp className="h-4 w-4" />
                    </span>
                    <span>{l.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 border-t border-gray-100 pt-3">
              {user ? (
                <div className="flex items-center justify-between gap-2">
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-800"
                  >
                    <UserIcon className="h-4 w-4 text-green-600" />
                    <span>{t("nav_profile", "Profile")}</span>
                  </Link>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={signOut}>
                    <LogOut className="h-3.5 w-3.5 mr-1 text-rose-500" />
                    <span>{t("nav_signout", "Sign out")}</span>
                  </Button>
                </div>
              ) : (
                <Button asChild className="w-full rounded-2xl bg-green-600 text-white font-bold text-xs">
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
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200/80 bg-white/95 px-2 py-1.5 backdrop-blur-md xl:hidden">
        <div className="grid grid-cols-5 items-center justify-around gap-1">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center py-1 text-[10px] font-bold ${
              isLinkActive("/dashboard") ? "text-green-600" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <LayoutDashboard className="h-4 w-4 mb-0.5" />
            <span className="truncate max-w-[60px]">{t("nav_dashboard", "Dashboard")}</span>
          </Link>

          <Link
            to="/assistant"
            className={`flex flex-col items-center py-1 text-[10px] font-bold ${
              isLinkActive("/assistant") ? "text-green-600" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Sparkles className="h-4 w-4 mb-0.5" />
            <span className="truncate max-w-[60px]">{t("nav_assistant", "Assistant")}</span>
          </Link>

          <Link
            to="/weather"
            className={`flex flex-col items-center py-1 text-[10px] font-bold ${
              isLinkActive("/weather") ? "text-green-600" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <CloudSun className="h-4 w-4 mb-0.5" />
            <span className="truncate max-w-[60px]">{t("nav_weather", "Weather")}</span>
          </Link>

          <Link
            to="/pest-alerts"
            className={`flex flex-col items-center py-1 text-[10px] font-bold ${
              isLinkActive("/pest-alerts") ? "text-green-600" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Bug className="h-4 w-4 mb-0.5" />
            <span className="truncate max-w-[60px]">{t("nav_pest", "Pest")}</span>
          </Link>

          <Link
            to="/help"
            className={`flex flex-col items-center py-1 text-[10px] font-bold ${
              isLinkActive("/help") ? "text-green-600" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <HelpCircle className="h-4 w-4 mb-0.5" />
            <span className="truncate max-w-[60px]">{t("nav_help", "Help")}</span>
          </Link>
        </div>
      </div>
    </>
  );
}
export default Navbar;
