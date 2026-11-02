import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/context/language-context";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { validateRedirectUrl } from "@/lib/auth-guard";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = validateRedirectUrl(location.pathname + (location.searchStr || ""));
      toast.error(
        language === "kn"
          ? "ದಯವಿಟ್ಟು ಈ ಸೌಲಭ್ಯವನ್ನು ಬಳಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ."
          : language === "hi"
          ? "कृपया इस सुविधा का उपयोग करने के लिए साइन इन करें।"
          : "Please sign in to access this feature."
      );
      navigate({
        to: "/login",
        search: { redirect: currentPath } as any,
        replace: true,
      });
    }
  }, [user, loading, navigate, location, language]);

  if (loading) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-green-50 border border-green-200 shadow-sm animate-pulse">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
        <p className="mt-4 text-sm font-semibold text-gray-700">
          {language === "kn"
            ? "ಖಾತೆ ದೃಢೀಕರಣ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..."
            : language === "hi"
            ? "प्रमाणीकरण की पुष्टि हो रही है..."
            : "Verifying authentication session..."}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {language === "kn"
            ? "ಸುರಕ್ಷಿತ ಕೃಷಿ ಸೇವೆಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ"
            : "Loading secure farming services"}
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export default AuthGuard;
