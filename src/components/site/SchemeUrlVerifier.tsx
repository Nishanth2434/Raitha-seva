import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Search, ExternalLink, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/language-context";

/** Verified scheme registry — only these entries exist in our scheme portal. */
export const SCHEME_REGISTRY = [
  { name: "PM-KISAN Samman Nidhi", host: "pmkisan.gov.in", url: "https://pmkisan.gov.in/" },
  { name: "PM Fasal Bima Yojana (PMFBY)", host: "pmfby.gov.in", url: "https://pmfby.gov.in/" },
  { name: "myScheme National Portal", host: "www.myscheme.gov.in", url: "https://www.myscheme.gov.in/" },
  { name: "myScheme National Portal", host: "myscheme.gov.in", url: "https://www.myscheme.gov.in/" },
  { name: "Kisan Credit Card (KCC)", host: "kisancreditcard.gov.in", url: "https://kisancreditcard.gov.in/" },
  { name: "SMAM — Agri Mechanization", host: "agrimachinery.nic.in", url: "https://agrimachinery.nic.in/" },
  { name: "Soil Health Card", host: "soilhealth.dac.gov.in", url: "https://soilhealth.dac.gov.in/" },
  { name: "e-NAM National Agriculture Market", host: "enam.gov.in", url: "https://enam.gov.in/" },
  { name: "Kisan Rin Portal", host: "krp.dacnet.nic.in", url: "https://krp.dacnet.nic.in/" },
  { name: "Agriculture Infrastructure Fund", host: "agriinfra.dac.gov.in", url: "https://agriinfra.dac.gov.in/" },
  { name: "Karnataka Raitamitra Portal", host: "raitamitra.karnataka.gov.in", url: "https://raitamitra.karnataka.gov.in/" },
  { name: "FRUITS Karnataka (FID)", host: "fruits.karnataka.gov.in", url: "https://fruits.karnataka.gov.in/" },
] as const;

type Result =
  | { status: "verified"; scheme: string; url: string; host: string }
  | { status: "error"; errors: string[]; host?: string };

function verify(raw: string, isKn: boolean): Result {
  const errors: string[] = [];
  const value = raw.trim();

  if (!value) {
    return {
      status: "error",
      errors: [
        isKn
          ? "ಪರಿಶೀಲಿಸಲು ದಯವಿಟ್ಟು ಯೋಜನೆ ಅಥವಾ ಸಬ್ಸಿಡಿ ವೆಬ್‌ಸೈಟ್ URL ಅನ್ನು ನಮೂದಿಸಿ."
          : "Please paste a scheme or subsidy URL to verify.",
      ],
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(value.includes("://") ? value : `https://${value}`);
  } catch {
    return {
      status: "error",
      errors: [
        isKn
          ? "ಅಮಾನ್ಯ URL ವಿಳಾಸ — ವೆಬ್ ವಿಳಾಸವನ್ನು ಸರಿಯಾಗಿ ನಮೂದಿಸಿ."
          : "Invalid URL format — it could not be parsed as a web address.",
      ],
    };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    errors.push(
      isKn
        ? `ಅಮಾನ್ಯ ಪ್ರೋಟೋಕಾಲ್ "${parsed.protocol}" — ಕೇವಲ http/https ಲಿಂಕ್‌ಗಳನ್ನು ಸ್ವೀಕರಿಸಲಾಗುತ್ತದೆ.`
        : `Unsupported protocol "${parsed.protocol}" — only http/https links are accepted.`
    );
  }
  if (parsed.protocol === "http:") {
    errors.push(
      isKn
        ? "ಅಸುರಕ್ಷಿತ ಲಿಂಕ್ (http). ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗಳು ಯಾವಾಗಲೂ ಸುರಕ್ಷಿತ https ಬಳಸುತ್ತವೆ."
        : "Insecure link (http). Official scheme portals always use https."
    );
  }

  const host = parsed.hostname.toLowerCase();
  const match = SCHEME_REGISTRY.find((s) => s.host === host);

  if (!match) {
    errors.push(
      isKn
        ? `ಡೊಮೇನ್ "${host}" ರೈತ ಸೇವಾ ಅಧಿಕೃತ ಪರಿಶೀಲಿಸಿದ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಪಟ್ಟಿಯಲ್ಲಿಲ್ಲ.`
        : `Domain "${host}" is not present in the Raitha Seva verified scheme portal registry.`
    );
    if (!host.endsWith(".gov.in") && !host.endsWith(".nic.in")) {
      errors.push(
        isKn
          ? "ಇದು ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಡೊಮೇನ್ ಅಲ್ಲ (.gov.in / .nic.in ಇಲ್ಲ) — ಇದು ನಕಲಿ ಅಥವಾ ವಂಚನೆಯ ಪುಟವಾಗಿರಬಹುದು!"
          : "Not an official government domain (.gov.in / .nic.in) — high risk of a fraudulent scheme page."
      );
    }
  }

  if (errors.length > 0) return { status: "error", errors, host };
  return { status: "verified", scheme: match!.name, url: parsed.toString(), host };
}

export function SchemeUrlVerifier() {
  const { language } = useLanguage();
  const isKn = language === "kn";
  const [value, setValue] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setResult(null);
    window.setTimeout(() => {
      setResult(verify(value, isKn));
      setChecking(false);
    }, 400);
  };

  return (
    <Card className="rounded-3xl border border-green-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-green-600" />
        <h3 className="text-base font-bold text-gray-900">
          {isKn ? "ಸರ್ಕಾರಿ ಯೋಜನೆ & ಸಬ್ಸಿಡಿ ಲಿಂಕ್ ಸ್ಕ್ಯಾನರ್" : "Verify a Scheme & Subsidy Link"}
        </h3>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {isKn
          ? "ಯಾವುದೇ ಸರ್ಕಾರಿ ಯೋಜನೆ, ಸಬ್ಸಿಡಿ ಅಥವಾ ಸಾಲದ ವೆಬ್‌ಸೈಟ್ ಲಿಂಕ್ ಅನ್ನು ನಮೂದಿಸಿ. ಅದು ಅಧಿಕೃತ ಸರ್ಕಾರದ ವೆಬ್‌ಸೈಟೋ ಅಥವಾ ನಕಲಿಯೋ ಎಂದು ಪರೀಕ್ಷಿಸಿ."
          : "Paste any scheme, loan, or subsidy URL. We verify it against our official registry before letting you open it."}
      </p>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Input
          type="text"
          inputMode="url"
          maxLength={300}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setResult(null);
          }}
          placeholder={isKn ? "ಉದಾಹರಣೆಗೆ: https://pmkisan.gov.in/" : "https://pmkisan.gov.in/"}
          aria-label={isKn ? "ಯೋಜನೆ ಲಿಂಕ್" : "Scheme URL"}
          className="rounded-2xl"
        />
        <Button type="submit" disabled={checking} className="rounded-2xl sm:w-44 bg-green-600 hover:bg-green-700 text-white font-bold text-xs">
          {checking ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-1.5 h-4 w-4" />
          )}
          {checking
            ? isKn
              ? "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..."
              : "Checking…"
            : isKn
              ? "ಲಿಂಕ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ"
              : "Verify Link"}
        </Button>
      </form>

      {result?.status === "verified" && (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 animate-fade-up">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-0 bg-green-600 text-[10px] font-bold uppercase text-white">
              {isKn ? "ಅಧಿಕೃತ ಪೋರ್ಟಲ್ · Verified" : "Verified Official Portal"}
            </Badge>
            <span className="text-sm font-semibold text-green-900">{result.scheme}</span>
          </div>
          <p className="mt-1 text-xs text-green-800">
            {isKn
              ? `${result.host} ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಕೃಷಿ ಯೋಜನೆಗಳ ಪೋರ್ಟಲ್ ಪಟ್ಟಿಯಲ್ಲಿದೆ.`
              : `${result.host} is listed in the official government scheme registry.`}
          </p>
          <Button asChild size="sm" className="mt-3 rounded-2xl bg-green-700 hover:bg-green-800 text-white font-bold text-xs">
            <a href={result.url} target="_blank" rel="noopener noreferrer">
              <span>{isKn ? "ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್ ತೆರೆಯಿರಿ" : "Open Official Scheme Page"}</span>
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      )}

      {result?.status === "error" && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 animate-fade-up">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-600" />
            <Badge className="border-0 bg-red-600 text-[10px] font-bold uppercase text-white">
              {isKn ? "ಅಧಿಕೃತವಲ್ಲ / ಅನುಮಾನಾಸ್ಪದ" : "Not Verified / Blocked"}
            </Badge>
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-red-800">
            {result.errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] font-semibold text-red-700">
            {isKn
              ? "ರೈತರ ಸುರಕ್ಷತೆಗಾಗಿ ಈ ಲಿಂಕ್ ತೆರೆಯುವುದನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ಕೇವಲ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗಳನ್ನು ಮಾತ್ರ ತೆರೆಯಲು ಅನುಮತಿಸಲಾಗಿದೆ."
              : "Opening is blocked for your safety. Only links from our verified government registry can be opened."}
          </p>
        </div>
      )}

      <p className="mt-3 text-[10px] text-gray-400">
        {isKn
          ? "ಅಧಿಕೃತ ನೋಂದಣಿ ಪೋರ್ಟಲ್‌ಗಳು: pmkisan.gov.in · pmfby.gov.in · myscheme.gov.in · agrimachinery.nic.in · raitamitra.karnataka.gov.in · fruits.karnataka.gov.in"
          : "Verified Registry: pmkisan.gov.in · pmfby.gov.in · myscheme.gov.in · agrimachinery.nic.in · raitamitra.karnataka.gov.in · fruits.karnataka.gov.in"}
      </p>
    </Card>
  );
}
