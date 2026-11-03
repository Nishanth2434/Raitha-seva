import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Leaf, Loader2, ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle, Mail, ShieldCheck, RotateCw, Check, Globe } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/context/language-context";
import { CUSTOMER_CARE_CONFIG } from "@/lib/customer-care";

import { validateRedirectUrl } from "@/lib/auth-guard";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const target = search["redirect"];
    if (typeof target === "string" && target.length > 0) {
      return { redirect: target };
    }
    return {};
  },
  head: () => ({
    meta: [
      { title: "Sign in | KrishiMitra AI" },
      {
        name: "description",
        content: "Sign in or create your KrishiMitra AI farmer account using Email or Google.",
      },
      { property: "og:title", content: "Sign in | KrishiMitra AI" },
      { property: "og:description", content: "Sign in or create a free KrishiMitra AI account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const redirectTarget = validateRedirectUrl(search?.redirect);
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (typeof window !== "undefined" && sessionStorage.getItem("raitha_seva_is_new_signup") === "true") {
        navigate({ to: "/onboarding", replace: true });
      } else {
        navigate({ to: redirectTarget as any, replace: true });
      }
    }
  }, [user, navigate, redirectTarget]);

  useEffect(() => {
    if (search?.redirect && !user) {
      toast.info(
        language === "kn"
          ? "ದಯವಿಟ್ಟು ಈ ವೈಶಿಷ್ಟ್ಯವನ್ನು ಪ್ರವೇಶಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ."
          : "Please sign in to access this feature."
      );
    }
  }, [search?.redirect, language, user]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error || !data.user) {
      toast.error(error?.message || "Invalid credentials. Please try again.");
      return;
    }

    if (typeof window !== "undefined") {
      sessionStorage.removeItem("raitha_seva_is_new_signup");
    }

    toast.success(
      language === "kn"
        ? "ಸ್ವಾಗತ! ಯಶಸ್ವಿಯಾಗಿ ಲಾಗಿನ್ ಆಗಿದ್ದೀರಿ."
        : "Welcome back!"
    );
    navigate({ to: redirectTarget as any, replace: true });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please check your password verification.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: email.split("@")[0],
          preferred_language: language,
        },
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message || "Registration failed. Please try again.");
      return;
    }

    if (data.user) {
      // Ensure profile exists in public.profiles table
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        username: email.split("@")[0],
        preferred_language: language,
        is_admin: false,
      });

      // Auto login if session was not returned
      if (!data.session) {
        await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }
    }

    // Set first-time signup flag and redirect to Raitha Seva Saathi welcome onboarding
    if (typeof window !== "undefined") {
      sessionStorage.setItem("raitha_seva_is_new_signup", "true");
    }

    toast.success("ಖಾತೆ ಯಶಸ್ವಿಯಾಗಿ ರಚನೆಯಾಗಿದೆ! ರೈತ ಸೇವಾ ಸಾಥಿಗೆ ಸ್ವಾಗತ!");
    navigate({ to: "/onboarding", replace: true });
  }

  // ─── Main Login / Sign-Up View ──────────────────────────────────────────────
  return (
    <main className="grid min-h-screen place-items-center bg-white px-4 py-12">
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-4">
          <Link
            to="/"
            onClick={(e) => {
              if (typeof window !== "undefined" && window.history.length > 1 && (window.history.state?.idx ?? 0) > 0) {
                e.preventDefault();
                window.history.back();
              }
            }}
            className="group inline-flex items-center gap-2 rounded-full border border-gray-200/90 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-xs transition-all hover:border-green-300 hover:bg-green-50/80 hover:text-green-700 active:scale-95 sm:text-sm cursor-pointer"
            aria-label={t("nav_back", "Back to Home")}
          >
            <ArrowLeft className="h-4 w-4 text-green-600 transition-transform duration-200 group-hover:-translate-x-1" />
            <span>{t("nav_back", "Back to Home")}</span>
          </Link>
        </div>

        <div className="mb-6 flex flex-col items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="KrishiMitra AI" className="h-24 w-24 sm:h-32 sm:w-32 object-contain" />
            <span className="text-2xl font-extrabold tracking-tight text-gray-900">
              Krishi<span className="text-green-600">Mitra</span> AI
            </span>
          </Link>
          <p className="mt-2 text-xs text-gray-500">Smart Farming Companion for Indian Farmers</p>
        </div>

        <Card className="rounded-3xl border border-gray-100 bg-white p-2 shadow-xl shadow-gray-100">
          <CardHeader className="text-center pb-3">
            {search?.redirect && (
              <div className="mb-3 flex items-center justify-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 p-2.5 text-xs font-bold text-amber-900 animate-fade-down shadow-2xs">
                <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  {language === "kn"
                    ? "ದಯವಿಟ್ಟು ಈ ವೈಶಿಷ್ಟ್ಯವನ್ನು ಪ್ರವೇಶಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ."
                    : "Please sign in to access this feature."}
                </span>
              </div>
            )}
            <CardTitle className="text-2xl font-bold text-gray-900">
              {language === "kn" ? "ಸ್ವಾಗತ (Welcome)" : "Welcome"}
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              {language === "kn"
                ? "ಹವಾಮಾನ, ಕೀಟ ಬಾಧೆ ಎಚ್ಚರಿಕೆ ಮತ್ತು ಮಂಡಿ ಬೆಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಲು ಲಾಗಿನ್ ಅಥವಾ ಸೈನ್ ಅಪ್ ಮಾಡಿ."
                : "Sign in to access weather advisories, pest alerts, and mandi market prices."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Language Selection: English or Kannada */}
            <div className="rounded-2xl border border-green-200 bg-linear-to-r from-green-50/90 to-emerald-50/90 p-3 shadow-xs">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-extrabold text-gray-800">
                  <Globe className="h-4 w-4 text-green-700" />
                  {language === "kn" ? "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ:" : "Choose your language:"}
                </span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">
                  {language === "kn" ? "ಕನ್ನಡ ಸಕ್ರಿಯ" : "English Active"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage("kn")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer ${
                    language === "kn"
                      ? "bg-green-600 text-white shadow-md shadow-green-200"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                  aria-pressed={language === "kn"}
                >
                  {language === "kn" && <Check className="h-3.5 w-3.5" />}
                  <span>ಕನ್ನಡ (Kannada)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer ${
                    language === "en"
                      ? "bg-green-600 text-white shadow-md shadow-green-200"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                  aria-pressed={language === "en"}
                >
                  {language === "en" && <Check className="h-3.5 w-3.5" />}
                  <span>English</span>
                </button>
              </div>
            </div>

            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-gray-100 p-1">
                <TabsTrigger value="signin" className="rounded-xl text-xs font-semibold">
                  {language === "kn" ? "ಲಾಗಿನ್ (Sign in)" : "Sign in"}
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-xl text-xs font-semibold">
                  {language === "kn" ? "ಖಾತೆ ರಚಿಸಿ (Sign up)" : "Create account"}
                </TabsTrigger>
              </TabsList>

              {/* Sign In Form */}
              <TabsContent value="signin">
                <form onSubmit={signIn} className="space-y-4 pt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="e1" className="text-xs font-semibold text-gray-700">
                      {language === "kn" ? "ಇಮೇಲ್ ಅಥವಾ ಬಳಕೆದಾರ ಹೆಸರು" : "Email or Username"}
                    </Label>
                    <Input
                      id="e1"
                      type="text"
                      required
                      placeholder={language === "kn" ? "farmer@example.com ಅಥವಾ ಹೆಸರು" : "farmer@example.com or username"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 rounded-2xl border-gray-200 bg-white text-sm shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="p1" className="text-xs font-semibold text-gray-700">
                      {language === "kn" ? "ಪಾಸ್‌ವರ್ಡ್ (Password)" : "Password"}
                    </Label>
                    <div className="relative">
                      <Input
                        id="p1"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 rounded-2xl border-gray-200 bg-white pr-10 text-sm shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 w-full rounded-2xl bg-green-600 font-bold text-white shadow-lg shadow-green-200 hover:bg-green-700"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {language === "kn" ? "ಲಾಗಿನ್ ಮಾಡಿ (Sign In)" : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Form */}
              <TabsContent value="signup">
                <form onSubmit={signUp} className="space-y-4 pt-3">
                  {/* In-form language preference picker */}
                  <div className="space-y-1.5 rounded-2xl border border-gray-100 bg-gray-50/80 p-2.5">
                    <Label className="text-xs font-bold text-gray-800 flex items-center justify-between">
                      <span>{language === "kn" ? "ಆದ್ಯತೆಯ ಭಾಷೆ (Language)" : "Preferred Language"}</span>
                      <span className="text-[10px] text-green-700 font-semibold">
                        {language === "kn" ? "ಕನ್ನಡ ಅಥವಾ English" : "Kannada or English"}
                      </span>
                    </Label>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setLanguage("kn")}
                        className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer ${
                          language === "kn"
                            ? "bg-green-600 text-white shadow-sm ring-2 ring-green-600"
                            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {language === "kn" && <Check className="h-3.5 w-3.5" />}
                        <span>ಕನ್ನಡ (Kannada)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage("en")}
                        className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer ${
                          language === "en"
                            ? "bg-green-600 text-white shadow-sm ring-2 ring-green-600"
                            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {language === "en" && <Check className="h-3.5 w-3.5" />}
                        <span>English</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="n2" className="text-xs font-semibold text-gray-700">
                      {language === "kn" ? "ಪೂರ್ಣ ಹೆಸರು (Full Name)" : "Full Name"}
                    </Label>
                    <Input
                      id="n2"
                      required
                      placeholder={language === "kn" ? "ರಮೇಶ್ ಪಾಟೀಲ್" : "Ramesh Patil"}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-11 rounded-2xl border-gray-200 bg-white text-sm shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="e2" className="text-xs font-semibold text-gray-700">
                      {language === "kn" ? "ಇಮೇಲ್ ವಿಳಾಸ (Email)" : "Email Address"}
                    </Label>
                    <Input
                      id="e2"
                      type="email"
                      required
                      placeholder="farmer@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 rounded-2xl border-gray-200 bg-white text-sm shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="p2" className="text-xs font-semibold text-gray-700">
                      {language === "kn" ? "ಪಾಸ್‌ವರ್ಡ್ (ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳು)" : "Password (min 8 characters)"}
                    </Label>
                    <div className="relative">
                      <Input
                        id="p2"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 rounded-2xl border-gray-200 bg-white pr-10 text-sm shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cp2" className="text-xs font-semibold text-gray-700">
                      {language === "kn" ? "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ" : "Confirm Password"}
                    </Label>
                    <div className="relative">
                      <Input
                        id="cp2"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        minLength={8}
                        placeholder={language === "kn" ? "ಪಾಸ್‌ವರ್ಡ್ ಪುನರಾವರ್ತಿಸಿ" : "Confirm your password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-11 rounded-2xl border-gray-200 bg-white pr-10 text-sm shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {confirmPassword.length > 0 && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs font-medium">
                        {password === confirmPassword ? (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {language === "kn" ? "ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಕೆಯಾಗಿದೆ" : "Passwords match"}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-500">
                            <XCircle className="h-3.5 w-3.5" />
                            {language === "kn" ? "ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ" : "Passwords do not match"}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || (confirmPassword.length > 0 && password !== confirmPassword)}
                    className="h-12 w-full rounded-2xl bg-green-600 font-bold text-white shadow-lg shadow-green-200 hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {language === "kn" ? "ಖಾತೆ ರಚಿಸಿ (Create Account)" : "Create Account"}
                  </Button>

                  <p className="text-center text-[10px] text-transparent">
                    {/* Placeholder to keep spacing */}
                    &nbsp;
                  </p>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50/70 p-3 text-center text-xs text-gray-700">
              <span className="text-gray-600">ಸೈನ್ ಅಪ್ ಅಥವಾ ಲಾಗಿನ್ ಮಾಡಲು ತೊಂದರೆ ಇದೆಯೇ? </span>
              <div className="mt-1 flex items-center justify-center gap-1.5 font-bold text-green-800">
                <span>📞 {CUSTOMER_CARE_CONFIG.labelKn}:</span>
                <a
                  href={CUSTOMER_CARE_CONFIG.telLink}
                  className="underline hover:text-green-950"
                  title="Call Customer Care"
                >
                  {CUSTOMER_CARE_CONFIG.formattedPhone}
                </a>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-gray-500">
              <Link
                to="/"
                className="inline-flex items-center text-gray-600 hover:text-green-600 font-medium"
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Return to Homepage
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
