import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Landmark,
  Shield,
  Tractor,
  FileText,
  IndianRupee,
  ExternalLink,
  Search,
  CheckCircle2,
  Phone,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PageShell } from "@/components/site/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SchemeUrlVerifier } from "@/components/site/SchemeUrlVerifier";
import { useLanguage } from "@/context/language-context";
import { CUSTOMER_CARE_CONFIG } from "@/lib/customer-care";

export const Route = createFileRoute("/schemes")({
  head: () => ({
    meta: [
      { title: "Government Schemes, Subsidies & Loans | Raitha Seva AI" },
      {
        name: "description",
        content:
          "Verified Central and Karnataka agricultural schemes, 40-50% machinery subsidies, 4% KCC crop loans, and scam-detection link scanner.",
      },
    ],
  }),
  component: SchemesPage,
});

interface SchemeItem {
  id: string;
  category: "income" | "insurance" | "subsidy" | "credit" | "karnataka";
  categoryLabelKn: string;
  categoryLabelEn: string;
  titleKn: string;
  titleEn: string;
  benefitKn: string;
  benefitEn: string;
  descKn: string;
  descEn: string;
  authorityKn: string;
  authorityEn: string;
  portalUrl: string;
  portalDisplay: string;
  badgeKn: string;
  badgeEn: string;
  color: string;
  icon: any;
}

const SCHEMES_DATA: SchemeItem[] = [
  {
    id: "pmkisan",
    category: "income",
    categoryLabelKn: "ನೇರ ಆದಾಯ ಬೆಂಬಲ",
    categoryLabelEn: "Income Support",
    titleKn: "ಪಿಎಂ-ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ (PM-KISAN)",
    titleEn: "PM-KISAN Samman Nidhi",
    benefitKn: "ವರ್ಷಕ್ಕೆ ₹6,000 — ₹2,000 ನ 3 ಕಂತುಗಳು ನೇರ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ (DBT)",
    benefitEn: "₹6,000/year in 3 installments of ₹2,000 via direct DBT transfer",
    descKn:
      "ಎಲ್ಲಾ ಅರ್ಹ ಭೂಹಿಡಿತ ಹೊಂದಿರುವ ರೈತ ಕುಟುಂಬಗಳಿಗೆ ಭಾರತ ಸರ್ಕಾರದ ವತಿಯಿಂದ ಆರ್ಥಿಕ ನೆರವು. ಪ್ರತಿ 4 ತಿಂಗಳಿಗೊಮ್ಮೆ ಖಾತೆಗೆ ಹಣ ಜಮೆಯಾಗುತ್ತದೆ. e-KYC ಪೂರ್ಣಗೊಳಿಸಿ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ.",
    descEn:
      "Central sector income support scheme for all landholding farmer families across India. Disbursed directly into Aadhaar-linked bank accounts every four months.",
    authorityKn: "ಕೃಷಿ ಮತ್ತು ರೈತರ ಕಲ್ಯಾಣ ಸಚಿವಾಲಯ, ಭಾರತ ಸರ್ಕಾರ",
    authorityEn: "Ministry of Agriculture & Farmers Welfare, GoI",
    portalUrl: "https://pmkisan.gov.in/",
    portalDisplay: "pmkisan.gov.in",
    badgeKn: "ಸಕ್ರಿಯ ಯೋಜನೆ",
    badgeEn: "Active Scheme",
    color: "border-blue-200 bg-blue-50/40 text-blue-800",
    icon: IndianRupee,
  },
  {
    id: "pmfby",
    category: "insurance",
    categoryLabelKn: "ಬೆಳೆ ವಿಮೆ",
    categoryLabelEn: "Crop Insurance",
    titleKn: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬೀಮಾ ಯೋಜನೆ (PMFBY)",
    titleEn: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    benefitKn: "ಕೇವಲ 2% (ಖಾರಿಫ್), 1.5% (ರಬಿ), 5% (ವಾಣಿಜ್ಯ/ತೋಟಗಾರಿಕೆ) ಪ್ರೀಮಿಯಂ",
    benefitEn: "Lowest farmer premium: 2% (Kharif), 1.5% (Rabi), 5% (Commercial/Horticulture)",
    descKn:
      "ಬಿತ್ತನೆಯಿಂದ ಹಿಡಿದು ಕೊಯ್ಲಿನ ನಂತರದ ಅವಧಿವರೆಗೆ ಅಕಾಲಿಕ ಮಳೆ, ಬರ, ಕೀಟ ಬಾಧೆಯಿಂದ ಉಂಟಾಗುವ ಬೆಳೆ ನಷ್ಟಕ್ಕೆ ಸಂಪೂರ್ಣ ವಿಮಾ ರಕ್ಷಣೆ. ಉಪಗ್ರಹ ತಂತ್ರಜ್ಞಾನದ ಮೂಲಕ ತ್ವರಿತ ಪರಿಹಾರ.",
    descEn:
      "Comprehensive yield risk and localized calamity insurance covering sowing prevention, mid-season adversity, and post-harvest losses with drone-satellite assessment.",
    authorityKn: "ಕೃಷಿ ಇಲಾಖೆ ಮತ್ತು ಸಾಮಾನ್ಯ ವಿಮಾ ಕಂಪನಿಗಳು",
    authorityEn: "Department of Agriculture & General Insurance Partners",
    portalUrl: "https://pmfby.gov.in/",
    portalDisplay: "pmfby.gov.in",
    badgeKn: "ಬೆಳೆ ವಿಮೆ",
    badgeEn: "Crop Insurance",
    color: "border-emerald-200 bg-emerald-50/40 text-emerald-800",
    icon: Shield,
  },
  {
    id: "smam",
    category: "subsidy",
    categoryLabelKn: "ಯಂತ್ರೋಪಕರಣ ಸಬ್ಸಿಡಿ",
    categoryLabelEn: "Machinery Subsidy",
    titleKn: "SMAM — ಕೃಷಿ ಯಾಂತ್ರೀಕರಣ ಯೋಜನೆ",
    titleEn: "SMAM — Sub-Mission on Agricultural Mechanization",
    benefitKn: "ಟ್ರ್ಯಾಕ್ಟರ್, ಪವರ್ ಟಿಲ್ಲರ್, ಡ್ರೋನ್, ಸಿಂಪಡಕಗಳ ಮೇಲೆ 40% ರಿಂದ 50% ಸಬ್ಸಿಡಿ",
    benefitEn: "40% to 50% capital subsidy on tractors, power tillers, sprayers & agri drones",
    descKn:
      "ರೈತರಿಗೆ ಕೃಷಿ ಉಪಕರಣಗಳನ್ನು ಕೈಗೆಟುಕುವ ದರದಲ್ಲಿ ಒದಗಿಸಲು ಕೇಂದ್ರ ಹಾಗೂ ರಾಜ್ಯ ಸರ್ಕಾರದ ಜಂಟಿ ಸಬ್ಸಿಡಿ. SC/ST ಮತ್ತು ಮಹಿಳಾ ರೈತರಿಗೆ 50%, ಇತರ ರೈತರಿಗೆ 40% ಸಹಾಯಧನ.",
    descEn:
      "Promotes farm mechanization among small and marginal farmers. 50% financial assistance for SC/ST, women, and marginal farmers; 40% for other categories.",
    authorityKn: "ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ ವಿಭಾಗ, ಕೃಷಿ ಸಚಿವಾಲಯ",
    authorityEn: "Mechanization & Technology Division, MoA&FW",
    portalUrl: "https://agrimachinery.nic.in/",
    portalDisplay: "agrimachinery.nic.in",
    badgeKn: "ಸಬ್ಸಿಡಿ ಯೋಜನೆ",
    badgeEn: "Subsidy Scheme",
    color: "border-orange-200 bg-orange-50/40 text-orange-800",
    icon: Tractor,
  },
  {
    id: "kcc",
    category: "credit",
    categoryLabelKn: "ಕಡಿಮೆ ಬಡ್ಡಿ ಕೃಷಿ ಸಾಲ",
    categoryLabelEn: "Low-Interest Credit",
    titleKn: "ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ (KCC) ಬೆಳೆ ಸಾಲ",
    titleEn: "Kisan Credit Card (KCC) Crop Loan",
    benefitKn: "₹5 ಲಕ್ಷದವರೆಗೆ ಕೇವಲ 4% ರಿಯಾಯಿತಿ ಬಡ್ಡಿದರದಲ್ಲಿ (ಸಮಯಕ್ಕೆ ಮರುಪಾವತಿಸಿದರೆ)",
    benefitEn: "Crop loans up to ₹5 Lakh at subsidized 4% interest rate with prompt repayment",
    descKn:
      "ಬೆಳೆ ಕೃಷಿ ವೆಚ್ಚ, ಗೊಬ್ಬರ, ಕೀಟನಾಶಕ ಮತ್ತು ಕೊಯ್ಲು ವೆಚ್ಚಗಳಿಗೆ ತಕ್ಷಣದ ನಗದು ಸಾಲ. ₹2 ಲಕ್ಷದವರೆಗೆ ಯಾವುದೇ ಆಸ್ತಿ ಅಡಮಾನವಿಲ್ಲದೆ (Collateral-Free) ಸಾಲ ಸೌಲಭ್ಯ.",
    descEn:
      "Revolving cash credit limit for crop production, maintenance, and marketing. Collateral-free up to ₹2 Lakh under simplified digital e-KCC portal.",
    authorityKn: "ನಬಾರ್ಡ್ ಮತ್ತು ಎಲ್ಲಾ ವಾಣಿಜ್ಯ / ಗ್ರಾಮೀಣ ಬ್ಯಾಂಕ್‌ಗಳು",
    authorityEn: "NABARD & Scheduled Commercial / RRB Banks",
    portalUrl: "https://kisancreditcard.gov.in/",
    portalDisplay: "kisancreditcard.gov.in",
    badgeKn: "ಕೃಷಿ ಸಾಲ",
    badgeEn: "Credit Scheme",
    color: "border-violet-200 bg-violet-50/40 text-violet-800",
    icon: FileText,
  },
  {
    id: "fruits",
    category: "karnataka",
    categoryLabelKn: "ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೋರ್ಟಲ್‌ಗಳು",
    categoryLabelEn: "Karnataka State Portals",
    titleKn: "ಕರ್ನಾಟಕ FRUITS ಪೋರ್ಟಲ್ (Farmer FID)",
    titleEn: "Karnataka FRUITS Portal (FID Registration)",
    benefitKn: "ಒಂದೇ FID ಸಂಖ್ಯೆಯೊಂದಿಗೆ ಎಲ್ಲಾ ಕರ್ನಾಟಕ ಸರ್ಕಾರಿ ಕೃಷಿ ಸೌಲಭ್ಯಗಳು",
    benefitEn: "Single Farmer Identification Number (FID) for all Karnataka agricultural benefits",
    descKn:
      "ಕರ್ನಾಟಕ ಕಂದಾಯ ಮತ್ತು ಕೃಷಿ ಇಲಾಖೆಯ ಏಕೀಕೃತ ರೈತ ಮಾಹಿತಿ ವ್ಯವಸ್ಥೆ. ಭೂದಾಖಲೆ (RTC), ಬೆಳೆ ಸಮೀಕ್ಷೆ, ಬರ ಪರಿಹಾರ ಮತ್ತು ಬಿತ್ತನೆ ಬೀಜ ಸಬ್ಸಿಡಿಗಳು ನೇರವಾಗಿ ದೊರೆಯುತ್ತವೆ.",
    descEn:
      "Unified online database linking Karnataka land records (Bhoomi RTC) with crop surveys and direct benefit disbursement without repetitive paperwork.",
    authorityKn: "ಕೃಷಿ ಮತ್ತು ಕಂದಾಯ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ",
    authorityEn: "Department of Agriculture, Government of Karnataka",
    portalUrl: "https://fruits.karnataka.gov.in/",
    portalDisplay: "fruits.karnataka.gov.in",
    badgeKn: "ಕರ್ನಾಟಕ ಅಧಿಕೃತ",
    badgeEn: "Karnataka Official",
    color: "border-teal-200 bg-teal-50/40 text-teal-800",
    icon: Landmark,
  },
  {
    id: "krishibhagya",
    category: "karnataka",
    categoryLabelKn: "ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೋರ್ಟಲ್‌ಗಳು",
    categoryLabelEn: "Karnataka State Portals",
    titleKn: "ಕೃಷಿ ಭಾಗ್ಯ ಯೋಜನೆ — ಕರ್ನಾಟಕ",
    titleEn: "Krishi Bhagya Scheme — Karnataka",
    benefitKn: "ಕೃಷಿ ಹೊಂಡ, ಡೀಸೆಲ್ ಪಂಪ್‌ಸೆಟ್, ಪಾಲಿಥೀನ್ ಹೊದಿಕೆಗೆ 80% ರಿಂದ 90% ಸಬ್ಸಿಡಿ",
    benefitEn: "80% to 90% subsidy for farm ponds, polythene lining, diesel pumps & micro-irrigation",
    descKn:
      "ಮಳೆಾಶ್ರಯ ಕೃಷಿ ಪ್ರದೇಶಗಳಲ್ಲಿ ನೀರು ಸಂರಕ್ಷಣೆ ಮತ್ತು ಕೃಷಿ ಹೊಂಡ ನಿರ್ಮಾಣಕ್ಕೆ ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಪ್ರಮುಖ ಯೋಜನೆ. ಒಣಭೂಮಿ ರೈತರಿಗೆ ಹನಿ ನೀರಾವರಿ ಘಟಕ ಅಳವಡಿಕೆಗೆ ಭಾರಿ ರಿಯಾಯಿತಿ.",
    descEn:
      "Flagship initiative for rainfed farming zones to construct on-farm rainwater harvesting ponds, shade nets, and high-efficiency micro-irrigation equipment.",
    authorityKn: "ಜಲಾನಯನ ಅಭಿವೃದ್ಧಿ ಇಲಾಖೆ, ಕರ್ನಾಟಕ",
    authorityEn: "Watershed Development Department, Karnataka",
    portalUrl: "https://raitamitra.karnataka.gov.in/",
    portalDisplay: "raitamitra.karnataka.gov.in",
    badgeKn: "ರಾಜ್ಯ ಸಬ್ಸಿಡಿ",
    badgeEn: "State Subsidy",
    color: "border-cyan-200 bg-cyan-50/40 text-cyan-800",
    icon: Tractor,
  },
  {
    id: "soilhealth",
    category: "subsidy",
    categoryLabelKn: "ಯಂತ್ರೋಪಕರಣ & ಮಣ್ಣು",
    categoryLabelEn: "Soil & Testing",
    titleKn: "ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಯೋಜನೆ (Soil Health Card)",
    titleEn: "Soil Health Card Scheme",
    benefitKn: "ಉಚಿತ ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮತ್ತು ರಸಗೊಬ್ಬರ ಬಳಕೆಯ ವೈಜ್ಞಾನಿಕ ಶಿಫಾರಸು",
    benefitEn: "Free soil nutrient testing & balanced NPK / micronutrient dosage cards",
    descKn:
      "ಪ್ರತಿ 3 ವರ್ಷಕ್ಕೊಮ್ಮೆ ರೈತರ ಜಮೀನಿನ 12 ಪ್ರಮುಖ ಮಣ್ಣಿನ ಪೋಷಕಾಂಶಗಳ ಪರೀಕ್ಷೆ. ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಹೆಚ್ಚಿಸಲು ಮತ್ತು ಗೊಬ್ಬರದ ದುಂದುವೆಚ್ಚ ತಗ್ಗಿಸಲು ತಜ್ಞರ ಮಾರ್ಗದರ್ಶನ.",
    descEn:
      "Nationwide program analyzing 12 macro and micronutrients to give farmers customized fertilizer recommendations, preventing over-fertilization.",
    authorityKn: "ರಾಷ್ಟ್ರೀಯ ಕೃಷಿ ವಿಸ್ತರಣೆ ಮತ್ತು ಮಣ್ಣು ಪರೀಕ್ಷಾಲಯಗಳು",
    authorityEn: "National Soil Health Mission & District Laboratories",
    portalUrl: "https://soilhealth.dac.gov.in/",
    portalDisplay: "soilhealth.dac.gov.in",
    badgeKn: "ಉಚಿತ ತಪಾಸಣೆ",
    badgeEn: "Free Testing",
    color: "border-amber-200 bg-amber-50/40 text-amber-800",
    icon: Sparkles,
  },
  {
    id: "pmksy",
    category: "subsidy",
    categoryLabelKn: "ಯಂತ್ರೋಪಕರಣ & ನೀರಾವರಿ",
    categoryLabelEn: "Irrigation Subsidy",
    titleKn: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಕೃಷಿ ಸಿಂಚಾಯಿ ಯೋಜನೆ (PMKSY - ಹನಿ ನೀರಾವರಿ)",
    titleEn: "PM Krishi Sinchayee Yojana (Per Drop More Crop)",
    benefitKn: "ಹನಿ ನೀರಾವರಿ ಮತ್ತು ತುಂತುರು ನೀರಾವರಿ ಘಟಕಗಳಿಗೆ 90% ವರೆಗೆ ಸಬ್ಸಿಡಿ",
    benefitEn: "Up to 90% financial assistance for Drip and Sprinkler micro-irrigation systems",
    descKn:
      "ಪ್ರತಿ ಹನಿ ನೀರಿಗೆ ಅಧಿಕ ಇಳುವರಿ ಪಡೆಯಲು ಸೂಕ್ಷ್ಮ ನೀರಾವರಿ ತಂತ್ರಜ್ಞಾನ. ಕರ್ನಾಟಕದಲ್ಲಿ ಸಣ್ಣ ಮತ್ತು ಅತಿ ಸಣ್ಣ ರೈತರಿಗೆ ಗರಿಷ್ಠ ಶೇಕಡಾ 90 ರಿಯಾಯಿತಿ ದೊರೆಯುತ್ತದೆ.",
    descEn:
      "Promotes micro-irrigation through drip and sprinkler sets. Small and marginal farmers in Karnataka receive up to 90% capital grant.",
    authorityKn: "ತೋಟಗಾರಿಕೆ & ಕೃಷಿ ಇಲಾಖೆ",
    authorityEn: "Department of Horticulture & Agriculture",
    portalUrl: "https://raitamitra.karnataka.gov.in/",
    portalDisplay: "raitamitra.karnataka.gov.in",
    badgeKn: "ನೀರಾವರಿ ಸಬ್ಸಿಡಿ",
    badgeEn: "Micro-Irrigation",
    color: "border-sky-200 bg-sky-50/40 text-sky-800",
    icon: Shield,
  },
];

export function SchemesPage() {
  const { language, setLanguage, t } = useLanguage();
  const isKn = language === "kn";
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");

  const categories = [
    { id: "all", labelKn: "ಎಲ್ಲಾ ಯೋಜನೆಗಳು", labelEn: "All Schemes" },
    { id: "income", labelKn: "ಆದಾಯ ಬೆಂಬಲ (DBT)", labelEn: "Income Support" },
    { id: "insurance", labelKn: "ಬೆಳೆ ವಿಮೆ (PMFBY)", labelEn: "Crop Insurance" },
    { id: "subsidy", labelKn: "ಯಂತ್ರೋಪಕರಣ & ಸಬ್ಸಿಡಿ", labelEn: "Machinery & Subsidies" },
    { id: "credit", labelKn: "ಕಡಿಮೆ ಬಡ್ಡಿ ಸಾಲ (KCC)", labelEn: "Crop Loans & KCC" },
    { id: "karnataka", labelKn: "ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೋರ್ಟಲ್‌ಗಳು", labelEn: "Karnataka Portals" },
  ];

  const filteredSchemes = SCHEMES_DATA.filter((s) => {
    const matchCat = selectedCategory === "all" || s.category === selectedCategory;
    const q = searchFilter.toLowerCase();
    const matchSearch =
      !q ||
      s.titleKn.toLowerCase().includes(q) ||
      s.titleEn.toLowerCase().includes(q) ||
      s.benefitKn.toLowerCase().includes(q) ||
      s.benefitEn.toLowerCase().includes(q) ||
      s.portalDisplay.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col">
      <Navbar />

      <PageShell
        eyebrow={isKn ? "ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಕೃಷಿ ಸೌಲಭ್ಯಗಳು" : "Official Government Agricultural Portals"}
        title={
          isKn
            ? "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು, ಕೃಷಿ ಸಾಲ & ಸಬ್ಸಿಡಿಗಳು"
            : "Government Schemes, Subsidies & Crop Loans"
        }
        description={
          isKn
            ? "ಕೇಂದ್ರ ಹಾಗೂ ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಅಧಿಕೃತ ಕೃಷಿ ಸೌಲಭ್ಯಗಳು, ಸಬ್ಸಿಡಿ ದರಗಳು, ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಮತ್ತು ವಂಚನೆ ತಡೆಗಟ್ಟುವ ಅಧಿಕೃತ ಲಿಂಕ್ ಸ್ಕ್ಯಾನರ್."
            : "Verified central and state agricultural schemes, farm mechanization subsidies, 4% crop loans, and official anti-fraud URL scanner."
        }
      >
        <div className="space-y-6">
          {/* Top Bar: Language Quick Switcher & Official Hub Link */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-700">
                <Landmark className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                  {isKn ? "ಕೇಂದ್ರ ಮತ್ತು ಕರ್ನಾಟಕ ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗಳು" : "Central & Karnataka State Portals"}
                </h3>
                <p className="text-[11px] text-gray-500">
                  myScheme · PM-KISAN · PMFBY · KCC · Raitamitra · FRUITS
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setLanguage("kn")}
                  className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                    isKn ? "bg-white text-green-800 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  ಕನ್ನಡ
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                    !isKn ? "bg-white text-green-800 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  English
                </button>
              </div>

              <a
                href="https://www.myscheme.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
              >
                <span>myScheme Portal</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* ─── 1. VERIFY A SCHEME LINK (SCANNER) ─── */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-gray-700">
                {isKn ? "ಅಧಿಕೃತ ಲಿಂಕ್ ಪರಿಶೀಲನೆ & ವಂಚನೆ ತಡೆಗಟ್ಟುವಿಕೆ" : "Scheme URL Verifier & Anti-Fraud Scanner"}
              </h2>
            </div>
            <SchemeUrlVerifier />
          </section>

          {/* ─── 2. CATEGORY TABS & SEARCH ─── */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === c.id
                      ? "bg-green-600 text-white shadow-xs"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {isKn ? c.labelKn : c.labelEn}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder={isKn ? "ಯೋಜನೆ ಹುಡುಕಿ..." : "Search scheme or keyword..."}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="h-9 w-full rounded-full border border-gray-200 bg-white pl-8 pr-3 text-xs text-gray-800 placeholder-gray-400 focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          {/* ─── 3. SCHEMES GRID ─── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {filteredSchemes.map((s) => {
              const IconComp = s.icon;
              return (
                <Card
                  key={s.id}
                  className={`rounded-3xl border p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${s.color}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white shadow-xs text-gray-800">
                          <IconComp className="h-5 w-5" />
                        </span>
                        <div>
                          <Badge className="border-0 bg-white/90 text-gray-800 text-[10px] font-bold uppercase shadow-2xs">
                            {isKn ? s.badgeKn : s.badgeEn}
                          </Badge>
                          <h3 className="text-base font-extrabold text-gray-950 mt-1">
                            {isKn ? s.titleKn : s.titleEn}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white/80 p-3 border border-gray-100/80">
                      <p className="text-xs font-bold text-gray-900 leading-snug">
                        {isKn ? s.benefitKn : s.benefitEn}
                      </p>
                    </div>

                    <p className="text-xs leading-relaxed text-gray-700">
                      {isKn ? s.descKn : s.descEn}
                    </p>

                    <p className="text-[11px] text-gray-500 font-medium">
                      🏛️ {isKn ? s.authorityKn : s.authorityEn}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between">
                    <a
                      href={s.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-green-800 hover:text-green-950 hover:underline"
                    >
                      <span>{s.portalDisplay}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>

                    <Button asChild size="sm" className="rounded-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold">
                      <a href={s.portalUrl} target="_blank" rel="noopener noreferrer">
                        <span>{isKn ? "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ" : "Apply / Details"}</span>
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredSchemes.length === 0 && (
            <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center text-gray-500">
              <p className="text-sm font-semibold">
                {isKn ? "ಯಾವುದೇ ಯೋಜನೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ." : "No schemes matched your search criteria."}
              </p>
            </div>
          )}

          {/* ─── 4. EMERGENCY & EXTENSION HELPLINES ─── */}
          <Card className="rounded-3xl border-2 border-green-300 bg-linear-to-r from-green-50 via-white to-emerald-50 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <Badge variant="outline" className="border-green-400 bg-green-100/60 text-[10px] font-bold text-green-900">
                  {isKn ? "ಸರ್ಕಾರಿ ಸಹಾಯವಾಣಿ" : "Official Extension Helplines"}
                </Badge>
                <h4 className="text-base font-extrabold text-gray-900">
                  {isKn ? "ಯೋಜನೆ ಮತ್ತು ಸಾಲ ಅರ್ಜಿ ಸಲ್ಲಿಕೆ ಸಹಾಯಕ್ಕೆ ಕರೆ ಮಾಡಿ" : "Need help applying for agricultural schemes?"}
                </h4>
                <p className="text-xs text-gray-600 max-w-xl">
                  {isKn
                    ? "ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್: 1800-180-1551 (ಉಚಿತ ಕರೆ) · ICAR-KVK ಮಂಡ್ಯ: 08232-277456 · ಗ್ರಾಹಕ ಸೇವೆ: 6360997180"
                    : "Kisan Call Centre: 1800-180-1551 (Toll-Free) · ICAR-KVK Mandya: 08232-277456 · Support: 6360997180"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="tel:18001801551"
                  className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
                >
                  1800-180-1551
                </a>
                <Button asChild variant="outline" className="rounded-full text-xs font-bold border-gray-300">
                  <Link to="/help">
                    <span>{isKn ? "ಸಹಾಯ ಕೇಂದ್ರ" : "Help Center"}</span>
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </PageShell>

      <Footer />
    </div>
  );
}

export default SchemesPage;
