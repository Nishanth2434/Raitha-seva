import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/language-context";

export interface PageShellProps {
  eyebrow?: string;
  title: string;
  description?: string;
  showBackButton?: boolean;
  backTo?: string;
  backLabel?: string;
  children: ReactNode;
}

export function PageShell({
  eyebrow,
  title,
  description,
  showBackButton = true,
  backTo = "/",
  backLabel,
  children,
}: PageShellProps) {
  const { t } = useLanguage();

  const handleBack = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.history.length > 1 && (window.history.state?.idx ?? 0) > 0) {
      e.preventDefault();
      window.history.back();
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="animate-fade-up">
        {showBackButton && (
          <div className="mb-4">
            <Link
              to={backTo as any}
              onClick={handleBack}
              className="group inline-flex items-center gap-2 rounded-full border border-gray-200/90 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-xs transition-all hover:border-green-300 hover:bg-green-50/80 hover:text-green-700 active:scale-95 sm:text-sm cursor-pointer"
              aria-label={backLabel || t("nav_back", "Back to Home")}
            >
              <ArrowLeft className="h-4 w-4 text-green-600 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>{backLabel || t("nav_back", "Back to Home")}</span>
            </Link>
          </div>
        )}

        {eyebrow && (
          <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>
        )}
      </header>
      <div className="mt-8">{children}</div>
    </main>
  );
}