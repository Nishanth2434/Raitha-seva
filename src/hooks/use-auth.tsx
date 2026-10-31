import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type AppRole = "admin" | "owner" | "farmer";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  phone?: string;
  village?: string;
  state?: string;
  district?: string;
  avatar_url?: string;
  is_owner: boolean;
  is_admin: boolean;
  owner_status: "none" | "pending" | "approved" | "rejected";
}

/** Returns the redirect path for a given role after login. */
export function getRedirectPath(role: AppRole | null): string {
  switch (role) {
    case "owner":
      return "/owner/dashboard";
    case "admin":
    case "farmer":
    default:
      return "/";
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      }

      if (data) {
        setProfile(data as UserProfile);
        if (data.is_admin) {
          setRole("admin");
        } else if (data.is_owner) {
          setRole("owner");
        } else {
          setRole("farmer");
        }
      } else {
        // Fallback profile if row is being created by trigger
        const fallback: UserProfile = {
          id: userId,
          username: userEmail?.split("@")[0] || "farmer",
          email: userEmail || "",
          is_owner: false,
          is_admin: false,
          owner_status: "none",
        };
        setProfile(fallback);
        setRole("farmer");
      }
    } catch (err) {
      console.error("fetchProfile exception:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email).finally(() => {
          if (isMounted) setLoading(false);
        });
      } else {
        setUser(null);
        setProfile(null);
        setRole(null);
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setRole(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email);
    }
  };

  return {
    user: profile,
    authUser: user,
    profile,
    role,
    loading,
    logout,
    refreshProfile,
  };
}