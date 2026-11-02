import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Tractor,
  Clock,
  MapPin,
  IndianRupee,
  ShieldAlert,
  Phone,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PageShell } from "@/components/site/PageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/language-context";
import { toast } from "sonner";
import { CUSTOMER_CARE_CONFIG } from "@/lib/customer-care";

export const Route = createFileRoute("/equipment")({
  head: () => ({
    meta: [
      { title: "ಕೃಷಿ ಉಪಕರಣ ಬಾಡಿಗೆ | Raitha Seva Equipment Rental" },
      {
        name: "description",
        content:
          "ಕೃಷಿ ಯಂತ್ರೋಪಕರಣಗಳ ಬಾಡಿಗೆ ಸೇವೆ. ಟ್ರ್ಯಾಕ್ಟರ್, ಹಾರ್ವೆಸ್ಟರ್, ಪವರ್ ಟಿಲ್ಲರ್ ಮತ್ತು ಡ್ರೋನ್ ಬಾಡಿಗೆ (ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ).",
      },
    ],
  }),
  component: EquipmentPage,
});

const DEMO_EQUIPMENT = [
  {
    id: "eq-1",
    nameKn: "ಮಹೀಂದ್ರಾ 575 DI ಟ್ರ್ಯಾಕ್ಟರ್ (45 HP)",
    nameEn: "Mahindra 575 DI Tractor (45 HP)",
    provider: "ಮಂಡ್ಯ ರೈತ ಸಹಕಾರ ಸಂಘ / RSK Mandya",
    location: "V.C. Farm, Mandya",
    rate: "₹750 / ಗಂಟೆಗೆ (Hour)",
    status: "ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯ (Phase 2)",
    icon: Tractor,
  },
  {
    id: "eq-2",
    nameKn: "ಭತ್ತದ ಕಟಾವು ಯಂತ್ರ (Paddy Combine Harvester)",
    nameEn: "Paddy Combine Harvester (Track Type)",
    provider: "ಕಾವೇರಿ ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ ಕೇಂದ್ರ",
    location: "Maddur, Mandya District",
    rate: "₹2,200 / ಗಂಟೆಗೆ (Hour)",
    status: "ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯ (Phase 2)",
    icon: Tractor,
  },
  {
    id: "eq-3",
    nameKn: "ಕೃಷಿ ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ ಡ್ರೋನ್ (10L Drone Sprayer)",
    nameEn: "Agri Spray Drone (10L Capacity)",
    provider: "ಅಗ್ರಿನೋವಾ ಕೃಷಿ ಡ್ರೋನ್ ಸೇವೆಗಳು",
    location: "Pandavapura, Mandya",
    rate: "₹450 / ಎಕರೆಗೆ (Acre)",
    status: "ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯ (Phase 2)",
    icon: Sparkles,
  },
];

export function EquipmentPage() {
  const { language, t } = useLanguage();
  const [notified, setNotified] = useState(false);

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    setNotified(true);
    toast.success(
      language === "kn"
        ? "ಧನ್ಯವಾದಗಳು! ಉಪಕರಣ ಬುಕಿಂಗ್ ಆರಂಭವಾದಾಗ ನಿಮಗೆ SMS ಸಂದೇಶ ಕಳುಹಿಸಲಾಗುವುದು."
        : "Thank you! You will be notified when equipment booking is active."
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col">
      <Navbar />

      <PageShell
        eyebrow={t("nav_equipment", "Farm Equipment")}
        title={language === "kn" ? "ಕೃಷಿ ಉಪಕರಣಗಳ ಬಾಡಿಗೆ ಸೇವೆ" : "Farm Machinery & Equipment Rental"}
        description={
          language === "kn"
            ? "ಸ್ಥಳೀಯ ಕಸ್ಟಮ್ ಹೈರಿಂಗ್ ಕೇಂದ್ರಗಳು (CHC) ಮತ್ತು ರೈತರಿಂದ ಟ್ರ್ಯಾಕ್ಟರ್, ಕಟಾವು ಯಂತ್ರಗಳ ಬಾಡಿಗೆ ಸೇವೆ."
            : "Affordable machinery rental from Custom Hiring Centres (CHC) across Karnataka."
        }
      >
        <div className="space-y-6">
          {/* Honest Coming Soon Status Banner */}
          <div className="rounded-3xl border-2 border-amber-300 bg-linear-to-r from-amber-50 via-white to-amber-50 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-gray-900">
                      {language === "kn" ? "ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ (Coming Soon)" : "Phase 2 Feature — Coming Soon"}
                    </h3>
                    <Badge variant="outline" className="border-amber-400 bg-amber-100/60 text-amber-800 text-[10px] font-bold">
                      ಅಭಿವೃದ್ಧಿ ಹಂತದಲ್ಲಿದೆ
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-gray-600 max-w-xl">
                    {language === "kn"
                      ? "ರೈತರಿಗೆ ನೈಜ ಬಾಡಿಗೆ ಸೌಲಭ್ಯ ನೀಡಲು ಕರ್ನಾಟಕ ಕೃಷಿ ಇಲಾಖೆಯ ಕಸ್ಟಮ್ ಹೈರಿಂಗ್ ಕೇಂದ್ರಗಳ (CHC) ಜೊತೆ ಸಾಫ್ಟ್‌ವೇರ್ ಸಂಯೋಜನೆ ಮಾಡಲಾಗುತ್ತಿದೆ. ಕೆಳಗೆ ನೀಡಲಾಗಿರುವ ಪಟ್ಟಿ ಮಾದರಿ ಮಾಹಿತಿಯಾಗಿದೆ."
                      : "Integration with Karnataka Agriculture Department CHCs is in progress. The listings below are demo representations of the upcoming network."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                <a
                  href={CUSTOMER_CARE_CONFIG.telLink}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-green-700"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>{language === "kn" ? "ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗೆ ಕರೆ ಮಾಡಿ" : "Call Helpline"}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Demo Listings */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_EQUIPMENT.map((eq) => {
              const IconComp = eq.icon;
              return (
                <Card key={eq.id} className="rounded-3xl border border-gray-200/90 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                      <IconComp className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[10px] font-semibold border-amber-200">
                      <Clock className="mr-1 h-3 w-3" /> {eq.status}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {language === "kn" ? eq.nameKn : eq.nameEn}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">{eq.provider}</p>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 border-t border-gray-100 pt-3">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      <span>{eq.location}</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-bold text-green-800">
                      <IndianRupee className="h-3.5 w-3.5 text-green-600" />
                      <span>{eq.rate}</span>
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    disabled
                    className="w-full rounded-2xl border-dashed border-gray-300 text-xs text-gray-400 font-semibold"
                  >
                    {language === "kn" ? "ಬುಕಿಂಗ್ ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯ" : "Booking Opening Soon"}
                  </Button>
                </Card>
              );
            })}
          </div>

          {/* Notify Me Box */}
          <Card className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm max-w-xl mx-auto text-center space-y-3">
            <h4 className="text-sm font-bold text-gray-900">
              {language === "kn" ? "ಉಪಕರಣ ಬುಕಿಂಗ್ ಆರಂಭವಾದಾಗ ತಿಳಿಯಲು ಬಯಸುವಿರಾ?" : "Want to be notified when booking opens?"}
            </h4>
            <p className="text-xs text-gray-500">
              {language === "kn"
                ? "ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ, ಸೇವೆ ಸಕ್ರಿಯವಾದ ತಕ್ಷಣ ಮೊದಲ ಆದ್ಯತೆ ಪಡೆಯಿರಿ."
                : "Enter your phone number to get early priority access."}
            </p>

            {notified ? (
              <div className="rounded-xl bg-green-50 p-3 text-xs font-bold text-green-800 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>{language === "kn" ? "ಧನ್ಯವಾದಗಳು! ನೋಂದಾಯಿಸಲಾಗಿದೆ." : "Subscribed successfully!"}</span>
              </div>
            ) : (
              <form onSubmit={handleNotifyMe} className="flex gap-2 max-w-md mx-auto">
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-xs text-gray-900 focus:outline-none focus:border-green-500"
                />
                <Button type="submit" className="rounded-2xl bg-green-600 text-xs font-bold px-5 text-white hover:bg-green-700">
                  {language === "kn" ? "ತಿಳಿಸಿ" : "Notify Me"}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </PageShell>

      <Footer />
    </div>
  );
}
export default EquipmentPage;
