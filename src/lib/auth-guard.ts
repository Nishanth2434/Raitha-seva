import { redirect } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

/**
 * Validates a redirect URL to prevent open redirect vulnerabilities.
 * Ensures the target is a relative internal path starting with '/'
 * and does not point to external domains or protocol-relative schemes.
 */
export function validateRedirectUrl(target?: string | null): string {
  if (!target || typeof target !== "string") {
    return "/";
  }

  const clean = target.trim();

  // Prevent protocol-relative URLs (e.g. //attacker.com) or external schemes
  if (
    clean.startsWith("/") &&
    !clean.startsWith("//") &&
    !clean.includes("://") &&
    !clean.toLowerCase().startsWith("javascript:")
  ) {
    // Avoid redirect loops back to login
    if (clean === "/login" || clean.startsWith("/login?")) {
      return "/";
    }
    return clean;
  }

  return "/";
}

/**
 * TanStack Router beforeLoad auth guard.
 * Checks for an active Supabase session before loading a protected route.
 * Redirects unauthenticated visitors to /login with the return URL preserved.
 */
export async function requireAuth({
  location,
}: {
  location: { pathname: string; search?: Record<string, unknown>; searchStr?: string };
}) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      const searchSuffix = location.searchStr || "";
      const targetPath = validateRedirectUrl(location.pathname + searchSuffix);

      throw redirect({
        to: "/login",
        search: { redirect: targetPath },
      });
    }

    return { session, user: session.user };
  } catch (err) {
    // If it's already a TanStack redirect, rethrow it
    if (err && typeof err === "object" && "to" in err) {
      throw err;
    }
    // Fallback redirect on error
    throw redirect({
      to: "/login",
      search: { redirect: validateRedirectUrl(location.pathname) },
    });
  }
}
