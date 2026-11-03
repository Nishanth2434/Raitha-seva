import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Phone,
  MapPin,
  Home,
  Edit,
  LogOut,
  CheckCircle2,
  User as UserIcon,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PageShell } from "@/components/site/PageShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My Profile | Raitha Seva AI" },
      {
        name: "description",
        content: "Manage your farmer profile and account settings on Raitha Seva AI.",
      },
      { property: "og:title", content: "My Profile | Raitha Seva AI" },
      { property: "og:description", content: "Manage your farmer profile." },
    ],
  }),
  component: ProfilePage,
});

interface DjangoProfile {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  phone?: string;
  village?: string;
  state?: string;
  district?: string;
  avatar_url?: string;
}

function ProfilePage() {
  const { user } = Route.useRouteContext() as { user: DjangoProfile };
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    village: "",
    district: "",
    avatar_url: "",
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as DjangoProfile;
    },
    initialData: user,
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        village: profile.village ?? "",
        district: profile.district ?? profile.state ?? "",
        avatar_url: profile.avatar_url ?? "",
      });
    }
  }, [profile]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    setProfileSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profileForm.full_name,
        phone: profileForm.phone,
        village: profileForm.village,
        district: profileForm.district,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setProfileSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile updated successfully!");
    setEditProfileOpen(false);
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <PageShell
        eyebrow="Farmer Account"
        title="My Profile"
        description="Manage your personal details, contact information, and farm location."
      >
        <div className="mx-auto max-w-3xl space-y-8">
          <Card className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-6">
              <div className="flex items-center gap-4">
                <div className="relative grid h-20 w-20 place-items-center rounded-2xl bg-green-100 text-green-700 font-extrabold text-2xl overflow-hidden shadow-sm">
                  {profileForm.avatar_url ? (
                    <img
                      src={profileForm.avatar_url}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (profileForm.full_name?.[0] || profile?.email?.[0] || "F").toUpperCase()
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      {profileForm.full_name || profile?.username || "Farmer Profile"}
                    </h2>
                    <Badge className="rounded-full border-0 text-xs bg-green-100 text-green-800">
                      Farmer
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{profile?.email}</p>
                </div>
              </div>

              <Button
                onClick={() => setEditProfileOpen(true)}
                variant="outline"
                className="rounded-2xl border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50/60 p-4 border border-gray-100">
                <Phone className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Phone
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {profileForm.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-gray-50/60 p-4 border border-gray-100">
                <Home className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Village
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {profileForm.village || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-gray-50/60 p-4 border border-gray-100">
                <MapPin className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    District
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {profileForm.district || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-gray-50/60 p-4 border border-gray-100">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Account Status
                  </p>
                  <p className="text-sm font-semibold text-green-700">Verified Farmer</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="rounded-2xl text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </Card>
        </div>
      </PageShell>

      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="max-w-md rounded-3xl border-gray-100 bg-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-gray-900">Edit Profile</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Update your personal details for personalized advisories.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Full Name</Label>
              <Input
                placeholder="Your full name"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                className="h-11 rounded-2xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Phone Number</Label>
              <Input
                placeholder="e.g. +91 9876543210"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="h-11 rounded-2xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Village</Label>
                <Input
                  placeholder="e.g. Khed"
                  value={profileForm.village}
                  onChange={(e) => setProfileForm({ ...profileForm, village: e.target.value })}
                  className="h-11 rounded-2xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">District / State</Label>
                <Input
                  placeholder="e.g. Nashik, MH"
                  value={profileForm.district}
                  onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                  className="h-11 rounded-2xl"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={profileSaving}
              className="mt-2 h-11 w-full rounded-2xl bg-green-600 font-bold text-white shadow-lg shadow-green-200 hover:bg-green-700"
            >
              {profileSaving ? "Saving Changes..." : "Save Profile"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
