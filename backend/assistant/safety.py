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

def check_chemical_safety(query_or_response: str) -> Dict[str, Any]:
    """
    Scans text for banned chemicals, unverified lethal dosages, or hazardous off-label advice.
    """
    text_lower = query_or_response.lower()

    # 1. Banned Chemical Detection
    for banned in BANNED_OR_RESTRICTED_CHEMICALS:
        if banned in text_lower:
            return {
                "safe": False,
                "violation_type": "BANNED_CHEMICAL",
                "chemical": banned,
                "warning_en": f"WARNING: {banned.capitalize()} is restricted/banned under DPPQS regulations due to severe environmental and human toxicity.",
                "warning_kn": f"ಎಚ್ಚರಿಕೆ: {banned} ಕೀಟನಾಶಕವನ್ನು ಸರ್ಕಾರದ ನಿಯಮಾವಳಿಗಳ ಪ್ರಕಾರ ನಿಷೇಧಿಸಲಾಗಿದೆ / ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ಇದನ್ನು ಬಳಸಬೇಡಿ.",
                "action": "BLOCK"
            }

    # 2. Dangerous Over-dosage Detection (e.g. > 10 ml/liter or > 5 kg/acre)
    high_dose_pattern = r'(\d+(\.\d+)?)\s*(ml|g|gm|grams|milliliters)\s*(per|\/)\s*(liter|litre)'
    matches = re.findall(high_dose_pattern, text_lower)
    for match in matches:
        qty = float(match[0])
        unit = match[2]
        if (unit in ["ml", "milliliters"] and qty > 8.0) or (unit in ["g", "gm", "grams"] and qty > 10.0):
            return {
                "safe": False,
                "violation_type": "HAZARDOUS_DOSAGE",
                "quantity": f"{qty} {unit}/liter",
                "warning_en": f"CRITICAL SAFETY WARNING: Reported dosage ({qty} {unit}/liter) exceeds safe agronomic limits and could cause phytotoxicity or crop burning.",
                "warning_kn": f"ಅಪಾಯಕಾರಿ ಎಚ್ಚರಿಕೆ: ಈ ಪ್ರಮಾಣ ({qty} {unit}/ಲೀಟರ್) ಅತಿಯಾಗಿದ್ದು ಬೆಳೆ ಸುಟ್ಟುಹೋಗುವ ಸಂಭವವಿದೆ. ದಯವಿಟ್ಟು ಕೃಷಿ ಅಧಿಕಾರಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ.",
                "action": "FLAG_AND_REVISE"
            }

    return {"safe": True, "action": "ALLOW"}

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
        "disclaimer_kn": "ಸೂಚನೆ: ಸಿಂಪಡಣೆಯನ್ನು ಮಳೆ ಬರುವ ಮುನ್ನ ಅಥವಾ ಜೋರು ಗಾಳಿ ಇರುವಾಗ ಮಾಡಬೇಡಿ. ಸಿಂಪಡಿಸುವಾಗ ಮುಖಗವಸು ಮತ್ತು ಕೈಗವಸುಗಳನ್ನು ಧರಿಸಿ."
    }

if __name__ == "__main__":
    test_clean = check_chemical_safety("Spray Cartap hydrochloride 50% SP @ 2g/liter of water")
    print("Safe spray test:", test_clean)
    test_banned = check_chemical_safety("Spray monocrotophos @ 2 ml/liter")
    print("Banned chemical test:", test_banned)
    test_overdose = check_chemical_safety("Mix Delegate @ 25 ml/liter of water")
    print("Overdose test:", test_overdose)
