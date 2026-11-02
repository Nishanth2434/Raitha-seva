"""
Agricultural Safety & Pesticide Dosage Safeguards Layer for Raitha Seva AI.
Implements non-negotiable agronomic verification rules before presenting recommendations to farmers.
References: Central Insecticides Board & Registration Committee (CIBRC), DPPQS, ICAR guidelines.
"""

import re
from typing import Dict, Any, List, Optional

# Authorized KVK and Department of Agriculture Emergency Contacts for Karnataka
OFFICIAL_ESCALATION_CONTACTS = {
    "mandya": {
        "kvk_name": "ICAR - Krishi Vigyan Kendra, V.C. Farm, Mandya",
        "phone": "08232-277456 / +91-8232277456",
        "email": "kvkmandya@gmail.com",
        "rsk_helpline": "Kisan Call Centre (Toll-Free): 1800-180-1551",
        "address": "ZARS Campus, V.C. Farm, Mandya, Karnataka - 571405"
    },
    "karnataka_general": {
        "kvk_name": "Karnataka State Department of Agriculture (KSDA)",
        "phone": "1800-180-1551 (Kisan Call Centre 24x7)",
        "portal": "https://raitamitra.karnataka.gov.in",
        "emergency": "Contact nearest Raitha Samparka Kendra (RSK) Agricultural Officer."
    }
}

# High-risk banned or restricted chemicals in Karnataka / India (ref: CIBRC notification)
BANNED_OR_RESTRICTED_CHEMICALS = [
    "monocrotophos",
    "paraquat",
    "carbofuran 50%",
    "endosulfan",
    "phorate",
    "methyl parathion",
    "ddt",
    "chlorpyrifos 50% + cypermethrin 5%" # restricted in certain horticultural zones
]

def get_safety_disclaimer(language: str = "en") -> str:
    """Returns official agricultural advice disclaimer in requested language."""
    if language == "kn":
        return "⚠️ ಕೃಷಿ ಸಲಹಾ ಮುನ್ನೆಚ್ಚರಿಕೆ: ಸಿಂಪಡಣೆಯನ್ನು ಮಳೆ ಬರುವ ಮುನ್ನ ಅಥವಾ ಜೋರು ಗಾಳಿ ಇರುವಾಗ ಮಾಡಬೇಡಿ. ಮುಖಗವಸು ಮತ್ತು ಕೈಗವಸು ಧರಿಸಿ. ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ 1800-180-1551 ಗೆ ಕರೆ ಮಾಡಿ."
    elif language == "hi":
        return "⚠️ कृषि परामर्श वैधानिक सूचना: कीटनाशक छिड़काव से पहले मास्क और दस्ताने पहनें। अधिक जानकारी के लिए किसान कॉल सेंटर 1800-180-1551 पर संपर्क करें।"
    return "⚠️ Agricultural Advisory Disclaimer: Spray only in calm weather wearing protective gear. For emergency guidance call Kisan Call Centre 1800-180-1551."

def check_chemical_safety(query_or_response: str, language: str = "en") -> Dict[str, Any]:
    """
    Scans text for banned chemicals, unverified lethal dosages, or hazardous off-label advice.
    Returns localized warnings based on language ('kn', 'hi', 'en').
    """
    text_lower = query_or_response.lower()

    # 1. Banned Chemical Detection
    for banned in BANNED_OR_RESTRICTED_CHEMICALS:
        if banned in text_lower:
            warning_en = f"WARNING: {banned.capitalize()} is restricted/banned under DPPQS regulations due to severe environmental and human toxicity."
            warning_kn = f"ಎಚ್ಚರಿಕೆ: {banned} ಕೀಟನಾಶಕವನ್ನು ಸರ್ಕಾರದ ನಿಯಮಾವಳಿಗಳ ಪ್ರಕಾರ ನಿಷೇಧಿಸಲಾಗಿದೆ / ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ಇದನ್ನು ಬಳಸಬೇಡಿ."
            warning_hi = f"चेतावनी: सरकारी नियमों के तहत {banned} कीटनाशक प्रतिबंधित/वर्जित है। इसका उपयोग न करें।"
            active_warning = warning_kn if language == "kn" else warning_hi if language == "hi" else warning_en

            return {
                "safe": False,
                "violation_type": "BANNED_CHEMICAL",
                "chemical": banned,
                "warning_en": warning_en,
                "warning_kn": warning_kn,
                "warning_hi": warning_hi,
                "warning_message": active_warning,
                "action": "BLOCK"
            }

    # 2. Dangerous Over-dosage Detection (e.g. > 10 ml/liter or > 5 kg/acre)
    high_dose_pattern = r'(\d+(\.\d+)?)\s*(ml|g|gm|grams|milliliters)\s*(per|\/)\s*(liter|litre)'
    matches = re.findall(high_dose_pattern, text_lower)
    for match in matches:
        qty = float(match[0])
        unit = match[2]
        if (unit in ["ml", "milliliters"] and qty > 8.0) or (unit in ["g", "gm", "grams"] and qty > 10.0):
            warning_en = f"CRITICAL SAFETY WARNING: Reported dosage ({qty} {unit}/liter) exceeds safe agronomic limits and could cause phytotoxicity or crop burning."
            warning_kn = f"ಅಪಾಯಕಾರಿ ಎಚ್ಚರಿಕೆ: ಈ ಪ್ರಮಾಣ ({qty} {unit}/ಲೀಟರ್) ಅತಿಯಾಗಿದ್ದು ಬೆಳೆ ಸುಟ್ಟುಹೋಗುವ ಸಂಭವವಿದೆ. ದಯವಿಟ್ಟು ಕೃಷಿ ಅಧಿಕಾರಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ."
            warning_hi = f"गंभीर सुरक्षा चेतावनी: बताई गई मात्रा ({qty} {unit}/लीटर) सुरक्षित सीमा से अधिक है, जिससे फसल जलने का खतरा है।"
            active_warning = warning_kn if language == "kn" else warning_hi if language == "hi" else warning_en

            return {
                "safe": False,
                "violation_type": "HAZARDOUS_DOSAGE",
                "quantity": f"{qty} {unit}/liter",
                "warning_en": warning_en,
                "warning_kn": warning_kn,
                "warning_hi": warning_hi,
                "warning_message": active_warning,
                "action": "FLAG_AND_REVISE"
            }

    return {"safe": True, "action": "ALLOW", "warning_message": ""}

def validate_agricultural_advice(
    query: str,
    evidence_chunks: List[Dict[str, Any]],
    user_region: str = "Mandya"
) -> Dict[str, Any]:
    """
    Evaluates whether advice is sufficiently grounded in retrieved official research
    and injects official contact details when evidence is insufficient or question is high-risk.
    """
    region_key = "mandya" if "mandya" in user_region.lower() else "karnataka_general"
    escalation = OFFICIAL_ESCALATION_CONTACTS.get(region_key, OFFICIAL_ESCALATION_CONTACTS["mandya"])

    if not evidence_chunks:
        return {
            "grounded": False,
            "can_recommend_chemical": False,
            "disclaimer_en": "Official research-backed package of practices for this specific query is currently unverified in our repository. Please consult your local Raitha Samparka Kendra (RSK) or KVK.",
            "disclaimer_kn": "ಈ ಪ್ರಶ್ನೆಗೆ ಅಧಿಕೃತ ದಾಖಲೆಗಳು ನಮ್ಮ ಜ್ಞಾನ ಭಂಡಾರದಲ್ಲಿ ಇನ್ನೂ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಮೀಪದ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರ ಅಥವಾ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರವನ್ನು (ಕೆವಿಕೆ) ಸಂಪರ್ಕಿಸಿ.",
            "disclaimer_hi": "इस प्रश्न के लिए आधिकारिक पैकेज ऑफ प्रैक्टिसेज दस्तावेज अभी उपलब्ध नहीं हैं। कृपया नजदीकी कृषि विज्ञान केंद्र (KVK) या किसान कॉल सेंटर 1800-180-1551 से संपर्क करें।",
            "escalation": escalation
        }

    # Check chemical safety
    combined_text = " ".join([c.get("text", "") for c in evidence_chunks])
    chem_check = check_chemical_safety(combined_text)

    return {
        "grounded": True,
        "can_recommend_chemical": chem_check["safe"],
        "safety_check": chem_check,
        "escalation": escalation,
        "disclaimer_en": "Note: Spray only during calm weather (avoid high winds or imminent rain). Always wear protective gloves and a face mask.",
        "disclaimer_kn": "ಸೂಚನೆ: ಸಿಂಪಡಣೆಯನ್ನು ಮಳೆ ಬರುವ ಮುನ್ನ ಅಥವಾ ಜೋರು ಗಾಳಿ ಇರುವಾಗ ಮಾಡಬೇಡಿ. ಸಿಂಪಡಿಸುವಾಗ ಮುಖಗವಸು ಮತ್ತು ಕೈಗವಸುಗಳನ್ನು ಧರಿಸಿ.",
        "disclaimer_hi": "सूचना: छिड़काव केवल शांत मौसम में करें (तेज हवा या बारिश से बचें)। छिड़काव के दौरान मास्क और दस्ताने अवश्य पहनें।"
    }

if __name__ == "__main__":
    test_clean = check_chemical_safety("Spray Cartap hydrochloride 50% SP @ 2g/liter of water")
    print("Safe spray test:", test_clean)
    test_banned = check_chemical_safety("Spray monocrotophos @ 2 ml/liter")
    print("Banned chemical test:", test_banned)
    test_overdose = check_chemical_safety("Mix Delegate @ 25 ml/liter of water")
    print("Overdose test:", test_overdose)
