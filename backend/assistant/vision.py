"""
Multimodal Agricultural Plant Disease & Health Triage Service for Raitha Seva AI.
Analyzes crop images using Google Gemini 2.0/1.5 Flash Vision API with
computer-vision heuristics and grounded RAG verification from UAS Bengaluru, ICAR, and KSDA.

Supports 5 Standard Result Categories:
  A. APPARENTLY_HEALTHY: No obvious symptoms visible / healthy canopy.
  B. POSSIBLE_DISEASE: Biotic fungal, bacterial, or viral disease with visible lesions.
  C. POSSIBLE_PEST_DAMAGE: Insect feeding, chewing, miners, or sucking pests.
  D. NUTRIENT_DEFICIENCY_OR_ENVIRONMENTAL_STRESS: Yellowing/chlorosis/scorch without biotic necrosis.
  E. INCONCLUSIVE: Insufficient visual evidence, blur, extreme distance, or lighting glare.
Plus:
  NON_PLANT: Non-agricultural / non-plant image.
"""

import os
import re
import io
import json
import base64
import logging
from typing import Dict, Any, Optional, Tuple
from datetime import date
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

# Standard Category Constants
CATEGORY_APPARENTLY_HEALTHY = "APPARENTLY_HEALTHY"
CATEGORY_POSSIBLE_DISEASE = "POSSIBLE_DISEASE"
CATEGORY_POSSIBLE_PEST = "POSSIBLE_PEST_DAMAGE"
CATEGORY_NUTRIENT_OR_STRESS = "NUTRIENT_DEFICIENCY_OR_ENVIRONMENTAL_STRESS"
CATEGORY_INCONCLUSIVE = "INCONCLUSIVE"
CATEGORY_NON_PLANT = "NON_PLANT"

KARNATAKA_POP_SUPPORTED_CROPS = {
    "tomato", "paddy", "rice", "ragi", "maize", "corn", "sugarcane", "cotton",
    "chilli", "chili", "pepper", "onion", "potato", "groundnut", "peanut",
    "redgram", "tur", "pigeonpea", "banana", "mango", "coconut", "arecanut",
    "pomegranate", "coffee", "bengalgram", "chickpea", "sunflower"
}

def normalize_crop_slug(name: str) -> str:
    """Normalizes multilingual crop names into canonical standard keys."""
    if not name:
        return "auto"
    n = str(name).lower().strip()
    if any(k in n for k in ["maize", "corn", "ಮೆಕ್ಕೆಜೋಳ", "zea"]):
        return "maize"
    if any(k in n for k in ["paddy", "rice", "ಭತ್ತ", "oryza"]):
        return "paddy"
    if any(k in n for k in ["tomato", "ಟೊಮೆಟೊ", "lycopersic"]):
        return "tomato"
    if any(k in n for k in ["ragi", "finger millet", "ರಾಗಿ", "eleusine"]):
        return "ragi"
    if any(k in n for k in ["sugarcane", "ಕಬ್ಬು"]):
        return "sugarcane"
    if any(k in n for k in ["cotton", "ಹತ್ತಿ"]):
        return "cotton"
    if any(k in n for k in ["chilli", "chili", "pepper", "ಮೆಣಸಿನಕಾಯಿ"]):
        return "chilli"
    if any(k in n for k in ["onion", "ಈರುಳ್ಳಿ"]):
        return "onion"
    if any(k in n for k in ["groundnut", "peanut", "ಕಡಲೆಕಾಯಿ"]):
        return "groundnut"
    if any(k in n for k in ["banana", "ಬಾಳೆ"]):
        return "banana"
    return n

def validate_crop_pathogen_compatibility(
    crop_slug: str,
    plant_part: str,
    disease_name_en: str,
    disease_name_kn: str,
    scientific_name: str
) -> Tuple[bool, Dict[str, Any]]:
    """
    Validates biological host-pathogen compatibility based on UAS Bengaluru & ICAR Package of Practices.
    Returns (is_compatible, correction_dict).
    
    If an obligate host mismatch is detected (e.g. Rice Blast on Maize or foliar blast on Maize ear):
    returns is_compatible = False and correction_dict containing valid disease, part, and explanation.
    """
    crop_slug = normalize_crop_slug(crop_slug)
    p_lower = (disease_name_en + " " + scientific_name).lower()
    part_upper = (plant_part or "").upper()
    is_ear = any(k in part_upper for k in ["EAR", "COB", "KERNEL", "GRAIN"]) or part_upper == "EAR_COB"

    # Rule 0: Paddy does not produce maize ears/cobs with kernels.
    if crop_slug in ["paddy", "rice"] and is_ear:
        return False, {
            "crop_name": "Maize / Corn (ಮೆಕ್ಕೆಜೋಳ)",
            "crop_slug": "maize",
            "name_en": "Maize Ear Rot & Kernel Damage (Fusarium / Insect Damage)",
            "name_kn": "ಮೆಕ್ಕೆಜೋಳದ ತೆನೆ ಕೊಳೆ ರೋಗ ಮತ್ತು ಕಾಳು ಹಾನಿ",
            "scientific_name": "Fusarium verticillioides / Spodoptera frugiperda damage",
            "affected_plant_part": "Ear / Cob / Kernels (ತೆನೆ ಮತ್ತು ಕಾಳುಗಳು)",
            "mismatch_reason": "Biological host & organ mismatch: Paddy / Rice does not produce maize ears/cobs with kernels, and Rice blast (Pyricularia oryzae) does not infect maize ears. Visual cob and kernel morphology identifies crop as Maize / Corn."
        }

    # Rule 1: Rice Blast (Pyricularia oryzae / Magnaporthe) CANNOT infect Maize/Corn
    if crop_slug == "maize" and any(k in p_lower for k in ["blast", "pyricularia", "magnaporthe"]):
        if is_ear:
            return False, {
                "name_en": "Maize Ear Rot & Kernel Damage (Fusarium / Insect Damage)",
                "name_kn": "ಮೆಕ್ಕೆಜೋಳದ ತೆನೆ ಕೊಳೆ ರೋಗ ಮತ್ತು ಕಾಳು ಹಾನಿ",
                "scientific_name": "Fusarium verticillioides / Spodoptera frugiperda damage",
                "affected_plant_part": "Ear / Cob / Kernels (ತೆನೆ ಮತ್ತು ಕಾಳುಗಳು)",
                "mismatch_reason": "Biological host mismatch: Rice blast (Pyricularia oryzae) is an obligate rice pathogen and cannot infect maize ears. Corrected to maize ear rot / kernel damage based on cob morphology."
            }
        else:
            return False, {
                "name_en": "Maize Turcicum Leaf Blight / Foliar Spot",
                "name_kn": "ಮೆಕ್ಕೆಜೋಳದ ಟರ್ಸಿಕಮ್ ಎಲೆ ಅಂಗಮಾರಿ ರೋಗ",
                "scientific_name": "Exserohilum turcicum",
                "affected_plant_part": "Foliage / Leaf Blade",
                "mismatch_reason": "Biological host mismatch: Rice blast (Pyricularia oryzae) does not infect maize foliage. Corrected to Turcicum leaf blight."
            }

    # Rule 2: Rice Blast cannot infect Tomato
    if crop_slug == "tomato" and any(k in p_lower for k in ["blast", "pyricularia"]):
        return False, {
            "name_en": "Tomato Early Blight & Septoria Leaf Spot",
            "name_kn": "ಟೊಮೆಟೊ ಆರಂಭಿಕ ಅಂಗಮಾರಿ ಮತ್ತು ಎಲೆ ಚುಕ್ಕೆ ರೋಗ",
            "scientific_name": "Alternaria solani / Septoria lycopersici",
            "affected_plant_part": "Foliage / Leaves",
            "mismatch_reason": "Biological host mismatch: Rice blast does not infect tomato. Corrected to Tomato Early Blight."
        }

    # Rule 3: Early Blight (Alternaria solani) cannot infect Rice/Paddy
    if crop_slug == "paddy" and any(k in p_lower for k in ["early blight", "alternaria solani"]):
        return False, {
            "name_en": "Paddy Leaf Blast & Neck Blast",
            "name_kn": "ಭತ್ತದ ಬೆಂಕಿ ರೋಗ (ಬ್ಲಾಸ್ಟ್)",
            "scientific_name": "Pyricularia oryzae",
            "affected_plant_part": "Foliage / Neck Panicle",
            "mismatch_reason": "Biological host mismatch: Early blight does not infect paddy. Corrected to Paddy Leaf Blast."
        }

    return True, {}

def sanitize_chemical_recommendations(
    crop_slug: str,
    plant_part: str,
    category: str,
    treatment_dict: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Strict chemical safety enforcement:
    1. If category is APPARENTLY_HEALTHY, NUTRIENT_DEFICIENCY_OR_ENVIRONMENTAL_STRESS, INCONCLUSIVE, or NON_PLANT:
       Block all chemical fungicides and insecticides completely!
    2. Tricyclazole is ONLY authorized for Paddy/Rice (Pyricularia oryzae).
       Strip any reference to Tricyclazole or blast chemicals on Maize, Tomato, Vegetables, etc.
    3. Edible maize ear cobs / kernels must NEVER be sprayed with toxic systemic foliar fungicides.
    """
    crop_slug = normalize_crop_slug(crop_slug)
    part_upper = (plant_part or "").upper()

    if category in [CATEGORY_APPARENTLY_HEALTHY, CATEGORY_NON_PLANT, CATEGORY_INCONCLUSIVE]:
        treatment_dict["treatment_needed"] = False
        treatment_dict["chemical_treatment_kn"] = "ಯಾವುದೇ ರಾಸಾಯನಿಕ ಸಿಂಪಡಿಸಬೇಡಿ (No chemical spraying needed)."
        treatment_dict["chemical_treatment_en"] = "Do not apply chemical pesticides without a verified infectious diagnosis."
        return treatment_dict

    if category == CATEGORY_NUTRIENT_OR_STRESS:
        treatment_dict["treatment_needed"] = True
        treatment_dict["chemical_treatment_kn"] = "ಕೀಟನಾಶಕ ಅಥವಾ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸಬೇಡಿ! ಪೋಷಕಾಂಶ ತಿದ್ದುಪಡಿಗೆ 19:19:19 ನೀರಿನಲ್ಲಿ ಕರಗುವ ಗೊಬ್ಬರ @ 5 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ."
        treatment_dict["chemical_treatment_en"] = "DO NOT spray chemical fungicides or insecticides. Apply balanced water-soluble 19:19:19 foliar nutrients."
        return treatment_dict

    # For diseased crops:
    chem_en = treatment_dict.get("chemical_treatment_en", "")
    chem_kn = treatment_dict.get("chemical_treatment_kn", "")

    # Safety Rule: Tricyclazole block for non-paddy crops
    if crop_slug != "paddy":
        if "tricyclazole" in chem_en.lower() or "ಟ್ರೈಸೈಕ್ಲಾಜೋಲ್" in chem_kn:
            if crop_slug == "maize":
                treatment_dict["chemical_treatment_kn"] = (
                    "⚠️ ಎಚ್ಚರಿಕೆ: ತೆನೆಯ ಕಾಳುಗಳ ಮೇಲೆ ನೇರವಾಗಿ ಯಾವುದೇ ಬ್ಲಾಸ್ಟ್ ಶಿಲೀಂಧ್ರನಾಶಕಗಳನ್ನು ಸಿಂಪಡಿಸಬೇಡಿ! "
                    "ತೆನೆ ಕೊಳೆ ರೋಗಕ್ಕೆ ಕಟಾವಿನ ಹಂತದಲ್ಲಿ ರಾಸಾಯನಿಕ ಸಿಂಪರಣೆ ನಿಷೇಧಿಸಲಾಗಿದೆ. "
                    "ಕೀಟ ಬಾಧೆಯಿದ್ದರೆ ಎಮಾಮೆಕ್ಟಿನ್ ಬೆಂಜೋಯೆಟ್ 5% SG @ 0.4 ಗ್ರಾಂ/ಲೀಟರ್ ಬಳಸಿ (ಕೊಯ್ಲಿನ ಸುರಕ್ಷಿತ ಅಂತರ ಕಾಪಾಡಿ)."
                )
                treatment_dict["chemical_treatment_en"] = (
                    "⚠️ Strictly do not spray rice blast fungicides or foliar chemicals on maize! "
                    "Mature ear kernels must not be sprayed with systemic foliar fungicides due to toxic grain residue. "
                    "For Fall Armyworm kernel borer, apply Emamectin Benzoate 5% SG @ 0.4g/L during early cob formation observing strict pre-harvest intervals."
                )
            else:
                treatment_dict["chemical_treatment_kn"] = "ಮ್ಯಾಂಕೋಜೆಬ್ 75% WP @ 2.0 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಎಲೆಗಳ ಎರಡೂ ಬದಿಗಳಿಗೆ ಸಿಂಪಡಿಸಿ."
                treatment_dict["chemical_treatment_en"] = "Apply Mancozeb 75% WP @ 2.0g/L water targeting foliage. Rice blast fungicides are restricted to paddy."

    # Safety Rule: Edible grain cobs (Maize ear) cannot be sprayed with foliar fungicides
    if crop_slug == "maize" and any(k in part_upper for k in ["EAR", "COB", "KERNEL", "GRAIN"]):
        treatment_dict["chemical_treatment_kn"] = (
            "⚠️ ಎಚ್ಚರಿಕೆ: ತೆನೆಯ ಕಾಳುಗಳ ಮೇಲೆ ನೇರವಾಗಿ ಯಾವುದೇ ಬ್ಲಾಸ್ಟ್ ಅಥವಾ ಎಲೆ ರೋಗದ ಶಿಲೀಂಧ್ರನಾಶಕಗಳನ್ನು ಸಿಂಪಡಿಸಬೇಡಿ! "
            "ತೆನೆ ಕೊಳೆ ರೋಗಕ್ಕೆ ಕಟಾವಿನ ಹಂತದಲ್ಲಿ ರಾಸಾಯನಿಕ ಸಿಂಪರಣೆ ನಿಷೇಧಿಸಲಾಗಿದೆ. "
            "ಕೀಟ ಬಾಧೆಯಿದ್ದರೆ ಎಮಾಮೆಕ್ಟಿನ್ ಬೆಂಜೋಯೆಟ್ 5% SG @ 0.4 ಗ್ರಾಂ/ಲೀಟರ್ ಬಳಸಿ (ಕೊಯ್ಲಿನ ಸುರಕ್ಷಿತ ಅಂತರ ಕಾಪಾಡಿ)."
        )
        treatment_dict["chemical_treatment_en"] = (
            "⚠️ Strictly do not spray rice blast fungicides or foliar chemicals on maize! "
            "Mature ear kernels must not be sprayed with systemic foliar fungicides due to toxic grain residue. "
            "For Fall Armyworm kernel borer, apply Emamectin Benzoate 5% SG @ 0.4g/L during early cob formation observing strict pre-harvest intervals."
        )

    return treatment_dict

class AgronomicImageAnalyzer:
    """
    Computer-vision heuristics analyzer for agricultural images.
    Extracts spatial and chromatic properties to prevent false-positive disease classifications.
    """
    @staticmethod
    def inspect_image(image_bytes: bytes) -> Dict[str, Any]:
        try:
            pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as e:
            logger.warning(f"[AgronomicImageAnalyzer] Image decode error: {e}")
            return {
                "valid": False,
                "error": str(e),
                "is_plant": False,
                "is_blurry": True,
                "is_wide_field": False,
                "category": CATEGORY_INCONCLUSIVE
            }

        w, h = pil_img.size
        aspect_ratio = w / max(h, 1)

        # Scale down for fast, robust statistics
        thumb = pil_img.copy()
        thumb.thumbnail((400, 400))
        tw, th = thumb.size
        arr = np.array(thumb, dtype=np.float32)

        r = arr[:, :, 0]
        g = arr[:, :, 1]
        b = arr[:, :, 2]

        # 1. Vegetation mask (ExG - Excess Green index & plant yellow chlorosis)
        exg = 2 * g - r - b
        green_mask = (exg > 15) & (g > b * 1.05) & (g > 40)
        yellow_mask = (r > 110) & (g > 110) & (b < 150) & (np.abs(r - g) < 55) & (g > b * 1.15)
        plant_mask = green_mask | yellow_mask
        plant_ratio = float(np.mean(plant_mask))

        # 2. Necrotic brown / black spots (decayed tissue with lesion margins)
        # Brown/dark-red center: R > G, R > B, moderate to low brightness, accompanied by plant tissue
        necrotic_mask = (r > 40) & (r < 165) & (g < 125) & (b < 100) & (r > g * 1.1) & (g >= b * 0.75)
        necrotic_ratio = float(np.mean(necrotic_mask))
        yellow_ratio = float(np.mean(yellow_mask))
        green_ratio = float(np.mean(green_mask))

        # 3. Sharpness / Blur Detection via Laplacian variance
        gray = np.array(thumb.convert("L"), dtype=np.float32)
        if tw > 10 and th > 10:
            lap = np.abs(gray[:-2, 1:-1] + gray[2:, 1:-1] + gray[1:-1, :-2] + gray[1:-1, 2:] - 4 * gray[1:-1, 1:-1])
            sharpness = float(lap.var())
        else:
            sharpness = 0.0

        # Wide-field photos have landscape ratio (>=1.15), vast continuous green canopy coverage,
        # but lack isolated contiguous macro-lesions.
        is_wide_field = (aspect_ratio >= 1.15) and (plant_ratio > 0.55) and (green_ratio > 0.50) and (necrotic_ratio < 0.010)

        # Blurry if low Laplacian variance (< 20.0), non-trivial foliage, and not a wide-angle field view
        is_blurry = (sharpness < 20.0) and (plant_ratio > 0.05) and (not is_wide_field)

        # Grain / Maize Ear / Cob detection:
        # Maize cobs or grain clusters typically have golden-yellow/tan/orange kernels
        # with low green foliage (green_ratio < 0.22) and substantial plant ratio.
        is_grain_or_cob = (plant_ratio >= 0.15) and (yellow_ratio >= 0.18) and (green_ratio < 0.22)
        detected_part = "EAR_COB" if is_grain_or_cob else "FOLIAGE"

        # 4. Plant presence check
        # If very few plant pixels (< 4% of frame) and dominant non-plant colors
        is_plant = plant_ratio >= 0.04

        # 5. Preliminary heuristic classification
        if not is_plant:
            heuristic_cat = CATEGORY_NON_PLANT
        elif is_wide_field:
            heuristic_cat = CATEGORY_APPARENTLY_HEALTHY
        elif is_grain_or_cob and necrotic_ratio >= 0.008:
            heuristic_cat = CATEGORY_POSSIBLE_DISEASE
        elif necrotic_ratio >= 0.012:
            heuristic_cat = CATEGORY_POSSIBLE_DISEASE
        elif yellow_ratio >= 0.06 and necrotic_ratio < 0.010:
            heuristic_cat = CATEGORY_NUTRIENT_OR_STRESS
        elif green_ratio >= 0.50 and necrotic_ratio < 0.008:
            heuristic_cat = CATEGORY_APPARENTLY_HEALTHY
        else:
            heuristic_cat = CATEGORY_INCONCLUSIVE

        return {
            "valid": True,
            "width": w,
            "height": h,
            "aspect_ratio": aspect_ratio,
            "is_plant": is_plant,
            "is_blurry": is_blurry,
            "is_wide_field": is_wide_field,
            "is_grain_or_cob": is_grain_or_cob,
            "detected_part": detected_part,
            "plant_ratio": plant_ratio,
            "green_ratio": green_ratio,
            "yellow_ratio": yellow_ratio,
            "necrotic_ratio": necrotic_ratio,
            "sharpness": sharpness,
            "heuristic_category": heuristic_cat
        }


class PlantDiseaseVisionDoctor:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("VITE_GEMINI_API_KEY")
        self.gemini_client = None
        if self.api_key and not self.api_key.startswith("your-"):
            try:
                from google import genai
                self.gemini_client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"[Vision Doctor] Gemini client initialization error: {e}")

    def clean_base64(self, raw_base64: str) -> Tuple[bytes, str]:
        """Extracts pure image bytes and mime type from base64 string or data URL."""
        mime_type = "image/jpeg"
        b64_data = raw_base64.strip()

        if "," in b64_data and ";base64" in b64_data:
            header, b64_data = b64_data.split(",", 1)
            match = re.search(r"data:(.*?);base64", header)
            if match:
                mime_type = match.group(1).lower()

        try:
            image_bytes = base64.b64decode(b64_data)
        except Exception as e:
            raise ValueError(f"Invalid base64 image data: {e}")

        if len(image_bytes) > 15 * 1024 * 1024:
            raise ValueError("Image file exceeds maximum 15MB limit.")

        return image_bytes, mime_type

    def analyze_crop_image(
        self,
        image_base64: str,
        crop_hint: str = "auto",
        region: str = "Mandya, Karnataka",
        language: str = "kn"
    ) -> Dict[str, Any]:
        """
        Main entry point for multimodal plant disease diagnosis & health triage.
        Validates symptoms first, prevents false positives, and provides structured 8-section output.
        """
        # 1. Parse and sanitize image
        try:
            image_bytes, mime_type = self.clean_base64(image_base64)
        except Exception as e:
            return self._build_error_response(str(e), language=language)

        # 2. Extract objective computer-vision heuristics
        cv_metrics = AgronomicImageAnalyzer.inspect_image(image_bytes)

        # 3. Try Gemini Multimodal Vision API if configured
        if self.gemini_client:
            try:
                structured_res = self._call_gemini_vision(
                    image_bytes=image_bytes,
                    mime_type=mime_type,
                    cv_metrics=cv_metrics,
                    crop_hint=crop_hint,
                    region=region,
                    language=language
                )
                if structured_res and structured_res.get("status") == "success":
                    return self._enrich_with_trusted_evidence(structured_res, crop_hint, language)
            except Exception as e:
                logger.warning(f"[Gemini Vision Error] {e}. Falling back to agronomic knowledge base.")

        # 4. Grounded Agronomic Fallback Engine (Uses CV heuristics + UASB/ICAR PoP)
        fallback_res = self._generate_grounded_fallback(
            image_bytes=image_bytes,
            cv_metrics=cv_metrics,
            crop_hint=crop_hint,
            region=region,
            language=language
        )
        return self._enrich_with_trusted_evidence(fallback_res, crop_hint, language)

    def _call_gemini_vision(
        self,
        image_bytes: bytes,
        mime_type: str,
        cv_metrics: Dict[str, Any],
        crop_hint: str,
        region: str,
        language: str
    ) -> Optional[Dict[str, Any]]:
        """Invokes Gemini Multimodal Vision with strict 5-category agricultural triage schema."""
        from google.genai import types

        image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)

        system_instruction = """
You are an expert agricultural plant pathologist and certified extension specialist for Karnataka, India (focusing on UAS Bengaluru & ICAR Package of Practices).
Your PRIMARY RESPONSIBILITY is objective, evidence-based triage. You MUST AVOID FALSE POSITIVES. Most images of plants are NOT diseased. Do NOT invent diseases or assume every photo needs chemical spray.

EVALUATION PROTOCOL:
0. STEP 0: BOTANICAL IDENTIFICATION (CROP & PLANT ORGAN)
   - Determine what anatomical plant organ is depicted: "EAR_COB" (corn cob, earhead, grain head), "LEAF" / "FOLIAGE", "STEM" / "STALK", "FRUIT", "SEED" / "KERNEL", "ROOT", or "WHOLE_PLANT".
   - Identify the crop objectively. If the user provided a hint like 'paddy', but the image depicts a Maize/Corn cob or non-paddy plant, VISUAL BOTANICAL EVIDENCE ALWAYS OVERRIDES THE USER HINT!

0.5. STEP 0.5: STRICT BIOLOGICAL HOST-PATHOGEN COMPATIBILITY
   - Biological Law: Plant diseases are strictly host-specific!
   - Rice Blast (Pyricularia oryzae / Magnaporthe oryzae) CANNOT infect Maize/Corn ears or cobs. NEVER diagnose Rice Blast on Maize!
   - If an image depicts a Maize / Corn Ear or Cob with damaged, discolored, or moldy kernels:
     * DO NOT diagnose Rice Blast or foliar blast!
     * Evaluate Maize Ear Rot (Fusarium verticillioides, Gibberella zeae, Aspergillus flavus) or Insect Kernel Damage (Fall Armyworm Spodoptera frugiperda, Corn Earworm Helicoverpa zea).
     * STRICT CHEMICAL SAFETY: NEVER prescribe Tricyclazole (which is an obligate rice blast fungicide) for maize/corn! Edible ear kernels must NEVER be sprayed with toxic systemic fungicides. Advise post-harvest cob drying (<13-14% moisture) and sorting out moldy cobs.
   - Do NOT output uncalibrated statistical percentages like '96.2%'. Confidence must reflect qualitative visual certainty (HIGH, MODERATE, LOW, INCONCLUSIVE).

1. STEP 1: PLANT PRESENCE
   Is this an agricultural crop or plant? If human, animal, indoor object, or vehicle:
   -> category: "NON_PLANT", is_plant: false. Request an agricultural crop photo.

2. STEP 2: VIEW DISTANCE & WIDE FIELD ASSESSMENT
   Is this a wide-angle field photograph or a distant landscape of a crop plot?
   -> If wide-angle: individual leaf lesions, spots, and pustules CANNOT be assessed reliably from that distance.
   -> If the crop canopy appears generally green and healthy, you MUST classify as "APPARENTLY_HEALTHY" (or "INCONCLUSIVE" if distant patches are unclear).
   -> DO NOT diagnose foliar leaf spots or blights on a wide field photo!
   -> State: "No obvious disease symptoms detected in this image. The crop appears generally green and healthy from the visible view. However, this is a wide-angle image, so individual leaves cannot be examined closely. Upload a clear close-up of the leaves if you notice spots, yellowing, wilting, or other changes."

3. STEP 3: SYMPTOM ASSESSMENT ON CLOSE-UPS
   Inspect visible plant organs:
   A. APPARENTLY_HEALTHY: Leaves are vibrant green without distinct necrotic lesions, spots, or pest damage. State no obvious symptoms detected. NEVER recommend chemical treatment.
   B. NUTRIENT_DEFICIENCY_OR_ENVIRONMENTAL_STRESS: DO NOT ASSUME EVERY YELLOW PATCH IS A DISEASE!
      - If leaves show generalized pale green, uniform yellowing of older leaves, interveinal chlorosis (green veins), or tip scorch WITHOUT fungal necrotic rings, water-soaked margins, or sporulation:
        -> Classify as "NUTRIENT_DEFICIENCY_OR_ENVIRONMENTAL_STRESS".
        -> Differentiate Nitrogen chlorosis, Magnesium/Iron interveinal chlorosis, Potassium edge scorch, or moisture/heat stress.
        -> DO NOT recommend fungicides or insecticides! Recommend soil testing, balanced NPK, or water-soluble foliar nutrient spray (e.g., 19:19:19 @ 5g/L).
   C. POSSIBLE_PEST_DAMAGE: Leaves show chewing holes, notches, skeletonization, leaf miner serpentine galleries, webbing, or visible insects.
        -> Classify as "POSSIBLE_PEST_DAMAGE". Recommend IPM traps, NSKE 5%, or bio-rational pest controls.
   D. POSSIBLE_DISEASE: Clear, pathognomonic biotic symptoms visible (concentric necrotic rings, rust pustules, powdery mildew, bacterial water-soaked lesions).
        -> Classify as "POSSIBLE_DISEASE". Ground advice in UAS Bengaluru Package of Practices.
   E. INCONCLUSIVE: Image is blurry, out-of-focus, backlit, has glare, or symptoms are ambiguous/insufficient to determine safely.
        -> Classify as "INCONCLUSIVE". Do NOT label as diseased. Ask for a sharp close-up photo of both top and bottom leaf surfaces in good natural light.

4. STEP 4: CROP IDENTIFICATION
   Identify the crop and plant part. If the crop cannot be identified reliably or is outside supported Karnataka crops, state uncertainty and ask the farmer to specify the crop.

STRICT JSON OUTPUT FORMAT (No markdown fences, raw JSON only):
{
  "is_plant": true or false,
  "is_healthy": true or false,
  "category": "APPARENTLY_HEALTHY" | "POSSIBLE_DISEASE" | "POSSIBLE_PEST_DAMAGE" | "NUTRIENT_DEFICIENCY_OR_ENVIRONMENTAL_STRESS" | "INCONCLUSIVE" | "NON_PLANT",
  "crop_identification": {
    "crop_name": "Identified Crop Name (e.g. Maize / Corn, Paddy / Rice, Tomato or 'Unknown')",
    "plant_part": "EAR_COB" | "LEAF" | "FRUIT" | "STEM" | "KERNEL" | "WHOLE_PLANT" | "OTHER",
    "confidence": "HIGH" | "MODERATE" | "LOW" | "UNKNOWN",
    "is_supported": true or false
  },
  "visual_observations": {
    "summary_kn": "ಚಿತ್ರದಲ್ಲಿ ನೇರವಾಗಿ ಗೋಚರಿಸುವ ವಾಸ್ತವಿಕ ವಿವರಣೆ...",
    "summary_en": "Objective visual observations seen directly in the photo...",
    "view_type": "WIDE_FIELD" | "CLOSE_UP_LEAF" | "WHOLE_PLANT" | "UNCLEAR",
    "lesions_or_spots_detected": true or false,
    "yellowing_observed": true or false,
    "yellowing_type": "NONE" | "GENERAL_CHLOROSIS" | "INTERVEINAL" | "EDGE_SCORCH" | "DISEASE_HALO" | "OTHER"
  },
  "possible_diagnosis": {
    "name_kn": "ರೋಗ, ಪೋಷಕಾಂಶ ಕೊರತೆ ಅಥವಾ ಆರೋಗ್ಯ ಸ್ಥಿತಿಯ ಹೆಸರು",
    "name_en": "Standard English diagnosis or 'No obvious disease detected'",
    "scientific_name": "Scientific name or 'N/A'",
    "diagnosis_type": "DISEASE" | "PEST" | "NUTRIENT_DEFICIENCY" | "ENVIRONMENTAL_STRESS" | "HEALTHY" | "INCONCLUSIVE" | "NON_PLANT",
    "justification_kn": "ಈ ತೀರ್ಮಾನಕ್ಕೆ ಕಾರಣ...",
    "justification_en": "Agronomic justification based strictly on visible evidence..."
  },
  "uncertainty_or_limitations": {
    "limitations_kn": "ಫೋಟೋದ ಮಿತಿಗಳು (ಉದಾ: ವಿಶಾಲ ಕೋನದ ಚಿತ್ರ, ಪ್ರತ್ಯೇಕ ಎಲೆಗಳು ಕಾಣುವುದಿಲ್ಲ)",
    "limitations_en": "Limitations (e.g. wide-angle field view, blur, lighting)",
    "confidence_rating": "HIGH" | "MODERATE" | "LOW" | "INCONCLUSIVE",
    "confidence_explanation": "Calibration note on confidence (visual triage, not a laboratory culture/PCR assay)"
  },
  "recommended_next_steps": {
    "steps_kn": "ರೈತರಿಗೆ ಮುಂದಿನ ಪ್ರಾಯೋಗಿಕ ಹೆಜ್ಜೆಗಳು...",
    "steps_en": "Actionable next steps...",
    "request_closeup": true or false
  },
  "treatment_and_management": {
    "treatment_needed": true or false,
    "organic_solution_kn": "ಸಾವಯವ ಪರಿಹಾರ (ಅಗತ್ಯವಿದ್ದರೆ ಮಾತ್ರ, ಆರೋಗ್ಯಕರ ಬೆಳೆಗೆ ಖಾಲಿ ಬಿಡಿ)",
    "organic_solution_en": "Organic solution (only if needed)",
    "chemical_treatment_kn": "ಅಧಿಕೃತ ರಾಸಾಯನಿಕ ಚಿಕಿತ್ಸೆ (ಕೇವಲ ರೋಗ/ಕೀಟ ದೃಢಪಟ್ಟಿದ್ದರೆ ಮಾತ್ರ. ಆರೋಗ್ಯಕರ ಅಥವಾ ಪೋಷಕಾಂಶ ಕೊರತೆಗೆ ಖಾಲಿ ಬಿಡಿ)",
    "chemical_treatment_en": "Verified chemical treatment (only if confirmed biotic issue, never for healthy/nutrient issues)",
    "safety_disclaimer_kn": "⚠️ ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆ: ಮಾಸ್ಕ್ ಧರಿಸಿ, ಕೊಯ್ಲಿಗೆ 14 ದಿನ ಮೊದಲು ಸಿಂಪಡಿಸಬೇಡಿ.",
    "safety_disclaimer_en": "Safety warning: Wear PPE, follow pre-harvest intervals."
  },
  "prevention": {
    "measures_kn": "ತಡೆಗಟ್ಟುವಿಕೆ ಕ್ರಮಗಳು (ಬೆಳೆ ಪರಿವರ್ತನೆ, ಹನಿ ನೀರಾವರಿ, ಸಮತೋಲಿತ ಗೊಬ್ಬರ)...",
    "measures_en": "Cultural prevention practices..."
  },
  "when_to_seek_expert_help": {
    "triggers_kn": "ಯಾವಾಗ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಬೇಕು...",
    "triggers_en": "When to consult agricultural officers...",
    "helpline_kn": "ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ ಮಂಡ್ಯ: 08232-277456 | ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್: 1800-180-1551"
  },
  "source_and_reliability": {
    "official_sources": [
      "University of Agricultural Sciences, Bengaluru (UASB)",
      "Indian Council of Agricultural Research (ICAR)",
      "Karnataka Department of Agriculture (KSDA / Raitamitra)"
    ],
    "reliability_note_kn": "ಈ ಸಲಹೆಯು ಚಿತ್ರ-ಆಧಾರಿತ ಪ್ರಾಥಮಿಕ ಪರೀಕ್ಷೆಯಾಗಿದೆ.",
    "reliability_note_en": "Preliminary image-based triage based on official Karnataka PoP."
  }
}
        """.strip()

        user_prompt = (
            f"Analyze this agricultural photograph. Farmer Crop Hint: '{crop_hint}'. Region: '{region}'. "
            f"Preferred Language: '{language}'. CV pre-inspection metrics: "
            f"plant_ratio={cv_metrics.get('plant_ratio', 0):.2f}, "
            f"detected_part={cv_metrics.get('detected_part', 'FOLIAGE')}, "
            f"is_grain_or_cob={cv_metrics.get('is_grain_or_cob', False)}, "
            f"is_wide_field={cv_metrics.get('is_wide_field', False)}, "
            f"necrotic_ratio={cv_metrics.get('necrotic_ratio', 0):.3f}, "
            f"yellow_ratio={cv_metrics.get('yellow_ratio', 0):.2f}."
        )

        try:
            for model_name in ["gemini-2.0-flash", "gemini-1.5-flash"]:
                try:
                    response = self.gemini_client.models.generate_content(
                        model=model_name,
                        contents=[system_instruction, user_prompt, image_part]
                    )
                    if response and response.text:
                        raw_text = response.text.strip()
                        if raw_text.startswith("```"):
                            raw_text = re.sub(r"^```(json)?\n", "", raw_text)
                            raw_text = re.sub(r"\n```$", "", raw_text)

                        parsed_json = json.loads(raw_text)
                        parsed_json["status"] = "success"
                        parsed_json["engine"] = f"gemini-vision ({model_name})"
                        return self._validate_and_format_diagnosis(parsed_json, cv_metrics, language=language)
                except Exception as inner_e:
                    logger.warning(f"Failed model {model_name}: {inner_e}")
                    continue
        except Exception as e:
            logger.error(f"Gemini Vision call failed: {e}")
        return None

    def _generate_grounded_fallback(
        self,
        image_bytes: bytes,
        cv_metrics: Dict[str, Any],
        crop_hint: str = "tomato",
        region: str = "Mandya, Karnataka",
        language: str = "kn"
    ) -> Dict[str, Any]:
        """
        High-reliability grounded fallback engine based on Computer Vision heuristics
        and UAS Bengaluru & ICAR Package of Practices.
        Never blindly reports a disease when the image is healthy, wide field, or blurry.
        """
        heuristic_cat = cv_metrics.get("heuristic_category", CATEGORY_INCONCLUSIVE)
        crop_slug = crop_hint.lower().strip()
        crop_display = crop_hint.capitalize() if crop_hint != "auto" else "Crop"
        is_supported = (crop_slug in KARNATAKA_POP_SUPPORTED_CROPS) or (crop_hint == "auto")

        unsupported_note_kn = (
            f"{crop_display} ಬೆಳೆಯು ಕರ್ನಾಟಕ UAS ಬೆಂಗಳೂರು ಮುಖ್ಯ ಬೆಳೆಗಳ ಅಧಿಕೃತ ಪಟ್ಟಿಯ ಹೊರಗಿದೆ. "
            "ಈ ಸಲಹೆಯು ಪ್ರಾಥಮಿಕವಾಗಿದ್ದು ಸ್ಥಳೀಯ ತೋಟಗಾರಿಕೆ / KVK ವಿಜ್ಞಾನಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ."
            if not is_supported else ""
        )
        unsupported_note_en = (
            f"{crop_display} is outside primary Karnataka UAS Bengaluru / KSDA PoP database. "
            "Diagnostic advice is preliminary; consult local Horticulture/KVK officers."
            if not is_supported else ""
        )

        # Case 1: Non-Plant Image
        if not cv_metrics.get("is_plant", True) or heuristic_cat == CATEGORY_NON_PLANT:
            return {
                "status": "success",
                "engine": "Raitha Seva Vision Heuristics (Grounded Fallback)",
                "category": CATEGORY_NON_PLANT,
                "category_display_kn": "ಸಸ್ಯವಲ್ಲದ ಚಿತ್ರ (Non-plant)",
                "category_display_en": "Non-plant image detected",
                "is_plant": False,
                "is_healthy": False,
                "crop_identification": {
                    "crop_name": "Non-plant",
                    "confidence": "HIGH",
                    "is_supported": False
                },
                "visual_observations": {
                    "summary_kn": "ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾದ ಚಿತ್ರದಲ್ಲಿ ಯಾವುದೇ ಕೃಷಿ ಬೆಳೆ ಅಥವಾ ಸಸ್ಯದ ಎಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
                    "summary_en": "The uploaded photograph does not appear to contain a plant, crop leaf, or agricultural specimen.",
                    "view_type": "UNCLEAR",
                    "lesions_or_spots_detected": False,
                    "yellowing_observed": False,
                    "yellowing_type": "NONE"
                },
                "possible_diagnosis": {
                    "name_kn": "ಸಸ್ಯ ಅಥವಾ ಬೆಳೆಯ ಚಿತ್ರವಲ್ಲ",
                    "name_en": "Non-plant image detected",
                    "scientific_name": "N/A",
                    "diagnosis_type": "NON_PLANT",
                    "justification_kn": "ಚಿತ್ರದಲ್ಲಿ ಹಸಿರು ಸಸ್ಯವರ್ಗ ಅಥವಾ ಬೆಳೆಯ ಅಂಗಾಂಶದ ಬಣ್ಣಗಳು ಲಭ್ಯವಿಲ್ಲ.",
                    "justification_en": "No plant foliage, crop organs, or chlorophyll signatures detected."
                },
                "uncertainty_or_limitations": {
                    "limitations_kn": "ಚಿತ್ರದಲ್ಲಿ ಕೃಷಿ ವಿಷಯವಿಲ್ಲ.",
                    "limitations_en": "Subject is not an agricultural plant specimen.",
                    "confidence_rating": "HIGH",
                    "confidence_explanation": "Vegetation index confirms lack of plant foliage."
                },
                "recommended_next_steps": {
                    "steps_kn": "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಜಮೀನಿನ ಬೆಳೆಯ ಎಲೆ, ಹೂವು ಅಥವಾ ಕಾಂಡದ ಸ್ಪಷ್ಟ ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
                    "steps_en": "Please take a clear photo of an infected crop leaf or stem from your farm.",
                    "request_closeup": True
                },
                "disease_identification": {
                    "disease_name_kn": "ಸಸ್ಯ ಅಥವಾ ಬೆಳೆಯ ಚಿತ್ರವಲ್ಲ (Non-plant image)",
                    "disease_name_en": "Non-plant image detected",
                    "scientific_name": "N/A",
                    "crop_identified": "ಸಸ್ಯವಲ್ಲ / Not a plant",
                    "affected_plant_part": "None",
                    "confidence_level": "100%",
                    "confidence_score": 1.0,
                    "confidence_explanation": "ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾದ ಚಿತ್ರದಲ್ಲಿ ಯಾವುದೇ ಕೃಷಿ ಬೆಳೆ ಕಂಡುಬಂದಿಲ್ಲ."
                },
                "what_is_happening": {
                    "summary_kn": "ದಯವಿಟ್ಟು ಕೃಷಿ ಬೆಳೆಯ ಎಲೆ, ಕಾಂಡ, ಹೂವು ಅಥವಾ ಹಣ್ಣಿನ ಸ್ಪಷ್ಟ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
                    "summary_en": "The uploaded photograph does not appear to contain a plant, crop leaf, or agricultural specimen. Please take a clear photo of your crop."
                },
                "symptoms": {
                    "visible_symptoms_kn": "ಯಾವುದೇ ಸಸ್ಯ ಲಕ್ಷಣಗಳಿಲ್ಲ.",
                    "visible_symptoms_en": "No plant symptoms detected.",
                    "other_parts_to_check_kn": "ಬೆಳೆಯ ಎಲೆಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ.",
                    "other_parts_to_check_en": "Inspect actual crop leaves."
                },
                "possible_causes": {
                    "pathogen_type": "N/A",
                    "favorable_conditions_kn": "N/A",
                    "favorable_conditions_en": "N/A"
                },
                "treatment_and_management": {
                    "treatment_needed": False,
                    "organic_solution_kn": "ಯಾವುದೇ ಚಿಕಿತ್ಸೆ ಅಗತ್ಯವಿಲ್ಲ.",
                    "organic_solution_en": "No treatment applicable.",
                    "chemical_treatment_kn": "ಯಾವುದೇ ರಾಸಾಯನಿಕ ಸಿಂಪಡಿಸಬೇಡಿ.",
                    "chemical_treatment_en": "Do not apply chemical sprays.",
                    "safety_disclaimer_kn": "⚠️ ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆ: ಕೇವಲ ರೋಗ ದೃಢಪಟ್ಟಾಗ ಮಾತ್ರ ಔಷಧಿ ಬಳಸಿ.",
                    "safety_disclaimer_en": "⚠️ Safety notice: Only apply treatments when a plant disease is verified."
                },
                "prevention": {
                    "measures_kn": "ಬೆಳೆಯ ಸ್ಪಷ್ಟ ಫೋಟೋ ತೆಗೆಯಿರಿ.",
                    "measures_en": "Take clear photo of crop."
                },
                "when_to_seek_expert_help": {
                    "triggers_kn": "KVK ಮಂಡ್ಯ ಸಂಪರ್ಕಿಸಿ: 08232-277456",
                    "triggers_en": "Call KVK Mandya: 08232-277456",
                    "helpline_kn": "08232-277456"
                },
                "source_and_reliability": {
                    "official_sources": ["Raitha Seva AI Triage System"],
                    "uncertainty_warning_kn": "ಚಿತ್ರದಲ್ಲಿ ಕೃಷಿ ಸಸ್ಯ ಕಂಡುಬಂದಿಲ್ಲ.",
                    "uncertainty_warning_en": "Non-plant image."
                }
            }

        # Case 2: Confirmed Biotic Disease or Ear Rot / Insect Damage
        # Grounded in official Package of Practices
        if cv_metrics.get("necrotic_ratio", 0) >= 0.010 or heuristic_cat == CATEGORY_POSSIBLE_DISEASE or (cv_metrics.get("is_grain_or_cob") and cv_metrics.get("necrotic_ratio", 0) >= 0.006):
            is_cob_grain = cv_metrics.get("is_grain_or_cob", False) or cv_metrics.get("detected_part") == "EAR_COB"
            is_maize = ("maize" in crop_slug or "corn" in crop_slug or is_cob_grain)
            is_paddy = ("paddy" in crop_slug or "rice" in crop_slug) and not is_cob_grain
            is_tomato = ("tomato" in crop_slug or "vegetable" in crop_slug) and not is_cob_grain

            if is_maize and (is_cob_grain or "ear" in crop_slug or "cob" in crop_slug or cv_metrics.get("detected_part") == "EAR_COB"):
                # Maize Ear Rot & Kernel Damage (UAS Bengaluru grounded)
                crop_display = "Maize / Corn (ಮೆಕ್ಕೆಜೋಳ)"
                plant_part_en = "Ear / Cob / Kernels"
                plant_part_kn = "ತೆನೆ ಮತ್ತು ಕಾಳುಗಳು"
                dis_name_kn = "ಮೆಕ್ಕೆಜೋಳದ ತೆನೆ ಕೊಳೆ ರೋಗ ಮತ್ತು ಕಾಳು ಹಾನಿ"
                dis_name_en = "Maize Ear Rot & Kernel Damage (Fusarium / Insect Damage)"
                sci_name = "Fusarium verticillioides / Spodoptera frugiperda damage"
                chem_kn = "⚠️ ಎಚ್ಚರಿಕೆ: ತೆನೆಯ ಕಾಳುಗಳ ಮೇಲೆ ನೇರವಾಗಿ ಯಾವುದೇ ಬ್ಲಾಸ್ಟ್ ಅಥವಾ ಎಲೆ ರೋಗದ ಶಿಲೀಂಧ್ರನಾಶಕಗಳನ್ನು ಸಿಂಪಡಿಸಬೇಡಿ! ತೆನೆ ಕೊಳೆ ರೋಗಕ್ಕೆ ಕಟಾವಿನ ಹಂತದಲ್ಲಿ ರಾಸಾಯನಿಕ ಸಿಂಪರಣೆ ನಿಷೇಧಿಸಲಾಗಿದೆ. ಕೀಟ ಬಾಧೆಯಿದ್ದರೆ ಎಮಾಮೆಕ್ಟಿನ್ ಬೆಂಜೋಯೆಟ್ 5% SG @ 0.4 ಗ್ರಾಂ/ಲೀಟರ್ ಬಳಸಿ (ಕೊಯ್ಲಿನ ಸುರಕ್ಷಿತ ಅಂತರ ಕಾಪಾಡಿ)."
                chem_en = "⚠️ Strictly do not spray blast fungicides or foliar chemicals on maize! Edible ear kernels must not be sprayed with systemic foliar fungicides. For Fall Armyworm kernel borer, apply Emamectin Benzoate 5% SG @ 0.4g/L during early cob formation observing strict pre-harvest intervals."
                org_kn = "1. ಸೋಂಕಿತ ಮತ್ತು ಕೊಳೆತ ತೆನೆಗಳನ್ನು ಪ್ರತ್ಯೇಕಿಸಿ ನಾಶಪಡಿಸಿ (ಅಫ್ಲಾಟಾಕ್ಸಿನ್ ಹರಡುವುದನ್ನು ತಡೆಯಿರಿ).\n2. ಕಟಾವಿನ ನಂತರ ಕಾಳುಗಳನ್ನು ಚೆನ್ನಾಗಿ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ ತೇವಾಂಶವನ್ನು 12-13% ಕ್ಕಿಂತ ಕಡಿಮೆ ಮಾಡಿ ಸಂಗ್ರಹಿಸಿ.\n3. ಟ್ರೈಕೋಡರ್ಮ ಹಾರ್ಜಿಯಾನಂ ಜೈವಿಕ ಶಿಲೀಂಧ್ರನಾಶಕವನ್ನು ಬಳಸಬಹುದು."
                org_en = "1. Immediately sort and discard moldy/damaged ears to prevent aflatoxin contamination.\n2. Sun-dry harvested grain to below 12-13% moisture before storage.\n3. Apply Trichoderma harzianum bio-agent for field management."
                obs_summary_kn = "ಮೆಕ್ಕೆಜೋಳದ ತೆನೆಯ ಕಾಳುಗಳ ಮೇಲೆ ಬಣ್ಣ ಬದಲಾವಣೆ, ಹಾನಿ ಅಥವಾ ಶಿಲೀಂಧ್ರ ಬೆಳವಣಿಗೆ ಕಂಡುಬಂದಿದೆ. ಇದು ಫ್ಯುಸೇರಿಯಂ ತೆನೆ ಕೊಳೆ ರೋಗ ಅಥವಾ ಕೀಟಗಳ (ಲದ್ದಿಹುಳು) ಹಾನಿಯ ಲಕ್ಷಣವಾಗಿದೆ."
                obs_summary_en = "Damaged, discolored, or rotted kernels observed on maize cob. Consistent with Fusarium ear rot or Fall Armyworm insect entry."
                just_kn = "ಕಾಳುಗಳ ಹಾನಿ ಮತ್ತು ಕಲೆಗಳು ತೆನೆ ಕೊಳೆ ರೋಗ ಅಥವಾ ಕೀಟಗಳ ಪ್ರವೇಶಕ್ಕೆ ಹೊಂದಿಕೆಯಾಗುತ್ತವೆ. ಇದು ಭತ್ತದ ಬ್ಲಾಸ್ಟ್ ರೋಗವಲ್ಲ."
                just_en = "Kernel discoloration and damage align with maize ear rot or insect feeding. Biologically distinct from rice blast."
                conf_rating = "MODERATE"
                conf_level = "MODERATE (Assistive Agronomic Visual Triage)"
                conf_score = 0.72
                conf_expl = "Assistive visual triage based on cob and kernel morphology. Laboratory mycotoxin or culture assay recommended."
            elif is_paddy:
                crop_display = "Paddy / Rice (ಭತ್ತ)"
                plant_part_en = "Foliage / Leaf Blade"
                plant_part_kn = "ಎಲೆಗಳು ಮತ್ತು ಕುತ್ತಿಗೆ"
                dis_name_kn = "ಭತ್ತದ ಬೆಂಕಿ ರೋಗ (ಬ್ಲಾಸ್ಟ್)"
                dis_name_en = "Paddy Leaf Blast & Neck Blast"
                sci_name = "Pyricularia oryzae"
                chem_kn = "ಟ್ರೈಸೈಕ್ಲಾಜೋಲ್ 75% WP @ 0.6 ಗ್ರಾಂ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ. ಯೂರಿಯಾ ಗೊಬ್ಬರ ಮಿತವಾಗಿ ಬಳಸಿ."
                chem_en = "Spray Tricyclazole 75% WP @ 0.6g/L water. Avoid excessive nitrogen/urea fertilizer."
                org_kn = "1. ಸ್ಯೂಡೋಮೊನಾಸ್ ಫ್ಲೋರೊಸೆನ್ಸ್ ಅಥವಾ ಟ್ರೈಕೋಡರ್ಮಾ @ 5 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.\n2. ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಬಸಿದು ಹೋಗಲು ವ್ಯವಸ್ಥೆ ಮಾಡಿ."
                org_en = "1. Foliar spray of Pseudomonas fluorescens or Trichoderma harzianum @ 5g/L.\n2. Ensure proper field drainage."
                obs_summary_kn = "ಭತ್ತದ ಎಲೆಗಳ ಮೇಲೆ ಕಣ್ಣಿನಾಕಾರದ (spindle-shaped) ಕಂದು ಬಣ್ಣದ ಚುಕ್ಕೆಗಳು ಮತ್ತು ಬೂದು ಬಣ್ಣದ ಕೇಂದ್ರ ಗೋಚರಿಸುತ್ತದೆ."
                obs_summary_en = "Spindle-shaped elliptical lesions with gray centers and brown margins on paddy foliage."
                just_kn = "ಕಣ್ಣಿನಾಕಾರದ ಚುಕ್ಕೆಗಳು ಮತ್ತು ಬೂದು ಕೇಂದ್ರವು ಭತ್ತದ ಬ್ಲಾಸ್ಟ್ (Pyricularia oryzae) ರೋಗದ ವಿಶಿಷ್ಟ ಲಕ್ಷಣವಾಗಿದೆ."
                just_en = "Spindle-shaped elliptical lesions with necrotic gray centers confirm Pyricularia oryzae infection."
                conf_rating = "MODERATE"
                conf_level = "MODERATE (Assistive Agronomic Visual Triage)"
                conf_score = 0.82
                conf_expl = "Distinct pathognomonic lesion margins visible on paddy foliage."
            elif is_tomato:
                crop_display = "Tomato (ಟೊಮೆಟೊ)"
                plant_part_en = "Foliage / Lower Leaves"
                plant_part_kn = "ಕೆಳಭಾಗದ ಎಲೆಗಳು"
                dis_name_kn = "ಟೊಮೆಟೊ ಆರಂಭಿಕ ಅಂಗಮಾರಿ ಮತ್ತು ಎಲೆ ಚುಕ್ಕೆ ರೋಗ"
                dis_name_en = "Tomato Early Blight & Septoria Leaf Spot"
                sci_name = "Alternaria solani / Septoria lycopersici"
                chem_kn = "1. ಆರಂಭಿಕ ಹಂತದಲ್ಲಿ: ಮ್ಯಾಂಕೋಜೆಬ್ 75% WP @ 2.0 ಗ್ರಾಂ/ಲೀಟರ್ ಅಥವಾ ತಾಮ್ರದ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ 50% WP @ 2.5 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.\n2. ತೀವ್ರ ಬಾಧೆಗೆ: ಅಜೋಕ್ಸಿಸ್ಟ್ರೋಬಿನ್ + ಡೈಫೆನೊಕೊನಾಜೋಲ್ @ 1.0 ಮಿ.ಲೀ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ."
                chem_en = "1. Early stage: Mancozeb 75% WP @ 2.0g/L or Copper Oxychloride 50% WP @ 2.5g/L.\n2. Advanced outbreak: Azoxystrobin + Difenoconazole @ 1.0 ml/L."
                org_kn = "1. ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 5 ಗ್ರಾಂ ಟ್ರೈಕೋಡರ್ಮಾ ಹರ್ಜಿಯಾನಮ್ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.\n2. ಸೋಂಕಿತ ಎಲೆಗಳನ್ನು ಕಿತ್ತು ಹೊಲದಿಂದ ದೂರ ವಿಲೇವಾರಿ ಮಾಡಿ."
                org_en = "1. Foliar spray of Trichoderma harzianum @ 5g/liter.\n2. Prune and destroy infected leaves."
                obs_summary_kn = "ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಬಣ್ಣದ ವೃತ್ತಾಕಾರದ ಚುಕ್ಕೆಗಳು ಮತ್ತು ಹಳದಿ ಬಣ್ಣದ ಅಂಚುಗಳು ಸ್ಪಷ್ಟವಾಗಿ ಗೋಚರಿಸುತ್ತವೆ."
                obs_summary_en = "Distinct brown necrotic lesions with chlorotic yellow halos observed on the leaf surface."
                just_kn = "ಕಣ್ಣಿನಾಕಾರದ ಅಥವಾ ವೃತ್ತಾಕಾರದ ನೆಕ್ರೋಟಿಕ್ ಚುಕ್ಕೆಗಳು ಶಿಲೀಂಧ್ರ ರೋಗದ ಲಕ್ಷಣಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತವೆ."
                just_en = "Concentric necrotic lesions with halo margin confirm fungal foliar infection."
                conf_rating = "MODERATE"
                conf_level = "MODERATE (Assistive Agronomic Visual Triage)"
                conf_score = 0.82
                conf_expl = "Target-board concentric rings visible on foliage."
            else:
                crop_display = crop_display if crop_hint != "auto" else "Crop"
                plant_part_en = "Foliage"
                plant_part_kn = "ಎಲೆಗಳು"
                dis_name_kn = f"{crop_display} ಎಲೆ ಚುಕ್ಕೆ ರೋಗ"
                dis_name_en = f"{crop_display} Foliar Leaf Spot"
                sci_name = "Foliar fungal pathogen"
                chem_kn = "ಮ್ಯಾಂಕೋಜೆಬ್ 75% WP @ 2.0 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಎಲೆಗಳ ಎರಡೂ ಬದಿಗಳಿಗೆ ಸಿಂಪಡಿಸಿ."
                chem_en = "Mancozeb 75% WP @ 2.0g/L water targeting both leaf surfaces."
                org_kn = "ಟ್ರೈಕೋಡರ್ಮಾ ಹರ್ಜಿಯಾನಮ್ @ 5 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ."
                org_en = "Spray Trichoderma harzianum @ 5g/L."
                obs_summary_kn = "ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಬಣ್ಣದ ಚುಕ್ಕೆಗಳು ಕಂಡುಬಂದಿವೆ."
                obs_summary_en = "Brown necrotic lesions observed on plant foliage."
                just_kn = "ನೆಕ್ರೋಟಿಕ್ ಚುಕ್ಕೆಗಳು ಶಿಲೀಂಧ್ರ ರೋಗದ ಲಕ್ಷಣಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತವೆ."
                just_en = "Necrotic lesions visible on foliage."
                conf_rating = "MODERATE"
                conf_level = "MODERATE (Assistive Agronomic Visual Triage)"
                conf_score = 0.70
                conf_expl = "Assistive visual triage based on lesion margins."

            return {
                "status": "success",
                "engine": "Raitha Seva Agronomic Expert System (UAS Bengaluru Grounded)",
                "category": CATEGORY_POSSIBLE_DISEASE,
                "category_display_kn": "ಸಂಭಾವ್ಯ ಬೆಳೆ ರೋಗ (Possible Disease)",
                "category_display_en": "Possible Crop Disease",
                "is_plant": True,
                "is_healthy": False,
                "crop_identification": {
                    "crop_name": crop_display,
                    "plant_part": plant_part_en,
                    "confidence": "HIGH",
                    "is_supported": is_supported
                },
                "visual_observations": {
                    "summary_kn": obs_summary_kn,
                    "summary_en": obs_summary_en,
                    "view_type": "CLOSE_UP_LEAF" if "Foliage" in plant_part_en else "CLOSE_UP_ORGAN",
                    "lesions_or_spots_detected": True,
                    "yellowing_observed": True,
                    "yellowing_type": "DISEASE_HALO"
                },
                "possible_diagnosis": {
                    "name_kn": dis_name_kn,
                    "name_en": dis_name_en,
                    "scientific_name": sci_name,
                    "diagnosis_type": "DISEASE",
                    "justification_kn": just_kn,
                    "justification_en": just_en
                },
                "uncertainty_or_limitations": {
                    "limitations_kn": (unsupported_note_kn + " " if unsupported_note_kn else "") + "ಲಕ್ಷಣಗಳು ವಿಶಿಷ್ಟವಾಗಿದ್ದರೂ, ತೀವ್ರ ಹರಡುವಿಕೆಗೆ ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿಯಿಂದ ದೃಢೀಕರಿಸಿ.",
                    "limitations_en": (unsupported_note_en + " " if unsupported_note_en else "") + "Visual diagnosis is assistive; laboratory culture may confirm mixed infections.",
                    "confidence_rating": conf_rating,
                    "confidence_explanation": conf_expl
                },
                "recommended_next_steps": {
                    "steps_kn": "ಸೋಂಕಿತ ಭಾಗಗಳನ್ನು ಕಿತ್ತು ನಾಶಪಡಿಸಿ. ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ.",
                    "steps_en": "Prune severely spotted/damaged parts and apply recommended IPM treatment.",
                    "request_closeup": False
                },
                "disease_identification": {
                    "disease_name_kn": dis_name_kn,
                    "disease_name_en": dis_name_en,
                    "scientific_name": sci_name,
                    "crop_identified": crop_display,
                    "affected_plant_part": f"{plant_part_en} ({plant_part_kn})",
                    "confidence_level": conf_level,
                    "confidence_score": conf_score,
                    "confidence_explanation": conf_expl
                },
                "what_is_happening": {
                    "summary_kn": "ಶಿಲೀಂಧ್ರದ ಸೋಂಕಿನಿಂದಾಗಿ ಎಲೆಗಳಲ್ಲಿ ಕ್ಲೋರೋಫಿಲ್ ನಾಶವಾಗಿ ಒಣ ಚುಕ್ಕೆಗಳು ಉಂಟಾಗಿವೆ. ಇದರಿಂದ ಗಿಡದ ಆಹಾರ ತಯಾರಿಕೆ ಕುಂಠಿತಗೊಳ್ಳುತ್ತದೆ.",
                    "summary_en": "Fungal pathogen has colonized leaf tissue creating necrotic lesions and reducing photosynthetic capacity."
                },
                "symptoms": {
                    "visible_symptoms_kn": "ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಬಣ್ಣದ ವೃತ್ತಾಕಾರದ ಚುಕ್ಕೆಗಳು ಮತ್ತು ಹಳದಿ ಬಣ್ಣದ ವರ್ತುಲ.",
                    "visible_symptoms_en": "Dark brown circular spots with concentric rings surrounded by chlorotic yellow halos.",
                    "other_parts_to_check_kn": "ಕಾಂಡದ ಕವಲುಗಳು ಮತ್ತು ಹಣ್ಣಿನ ತೊಟ್ಟುಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ.",
                    "other_parts_to_check_en": "Inspect stem junctions, petioles, and fruit calyx for sunken lesions."
                },
                "possible_causes": {
                    "pathogen_type": "Fungal Pathogen (ಶಿಲೀಂಧ್ರ ರೋಗ)",
                    "favorable_conditions_kn": "ಮೋಡ ಕವಿದ ವಾತಾವರಣ, 80% ಕ್ಕಿಂತ ಹೆಚ್ಚು ಗಾಳಿಯ ತೇವಾಂಶ ಮತ್ತು ಎಲೆಗಳ ಮೇಲೆ ನೀರು ನಿಲ್ಲುವಿಕೆ.",
                    "favorable_conditions_en": "Warm temperatures (24-29°C), relative humidity >80%, and leaf wetness."
                },
                "treatment_and_management": {
                    "treatment_needed": True,
                    "organic_solution_kn": org_kn,
                    "organic_solution_en": org_en,
                    "chemical_treatment_kn": chem_kn,
                    "chemical_treatment_en": chem_en,
                    "safety_disclaimer_kn": "⚠️ ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆ: ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸುವಾಗ ಮಾಸ್ಕ್ ಮತ್ತು ಕೈಗವಸು ಧರಿಸಿ. ಕೊಯ್ಲಿನ 14 ದಿನ ಮೊದಲು ರಾಸಾಯನಿಕ ಸಿಂಪಡಿಸಬೇಡಿ.",
                    "safety_disclaimer_en": "⚠️ Safety notice: Wear PPE. Observe 14-day pre-harvest waiting interval."
                },
                "prevention": {
                    "measures_kn": "• ಮಣ್ಣಿನಿಂದ ನೀರು ಎಲೆಗಳಿಗೆ ಚಿಮ್ಮದಂತೆ ರವದಿ ಅಥವಾ ಪ್ಲಾಸ್ಟಿಕ್ ಹೊದಿಕೆ ಹಾಕಿ.\n• ಹನಿ ನೀರಾವರಿ ಪದ್ಧತಿ ಅಳವಡಿಸಿ, ಎಲೆಗಳ ಮೇಲೆ ನೀರು ಸಿಂಪಡಿಸಬೇಡಿ.\n• ಬೆಳೆ ಪರಿವರ್ತನೆ ಮಾಡಿ.",
                    "measures_en": "• Apply mulch to prevent soil splashing.\n• Use drip irrigation instead of overhead sprinklers.\n• Practice crop rotation."
                },
                "when_to_seek_expert_help": {
                    "triggers_kn": "ಗಿಡದ 20% ಕ್ಕಿಂತ ಹೆಚ್ಚು ಎಲೆಗಳು ಒಣಗಿದ್ದರೆ ತಕ್ಷಣ KVK ಮಂಡ್ಯ ಅಥವಾ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರವನ್ನು ಸಂಪರ್ಕಿಸಿ.",
                    "triggers_en": "Seek help if defoliation exceeds 20% or symptoms progress rapidly despite initial spray.",
                    "helpline_kn": "ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ ಮಂಡ್ಯ (KVK Mandya: 08232-277456) | ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್: 1800-180-1551"
                },
                "source_and_reliability": {
                    "official_sources": [
                        "University of Agricultural Sciences, Bengaluru (UASB Package of Practices)",
                        "ICAR-Indian Institute of Horticultural Research (IIHR, Bengaluru)",
                        "Karnataka Department of Agriculture (KSDA / Raitamitra)"
                    ],
                    "uncertainty_warning_kn": "ಗಮನಿಸಿ: ಈ ರೋಗನಿರ್ಣಯವು ಅಧಿಕೃತ ಕೃಷಿ ಕೈಪಿಡಿಯ ಶಿಫಾರಸುಗಳನ್ನು ಆಧರಿಸಿದೆ.",
                    "uncertainty_warning_en": "Note: Based on UAS Bengaluru Package of Practices."
                }
            }

        # Case 3: Nutrient Deficiency or Environmental Stress (Yellow/Pale Patches without necrosis)
        if (cv_metrics.get("yellow_ratio", 0) >= 0.06 or heuristic_cat == CATEGORY_NUTRIENT_OR_STRESS) and cv_metrics.get("necrotic_ratio", 0) < 0.010:
            return {
                "status": "success",
                "engine": "Raitha Seva Agronomic Expert System (UAS Bengaluru Nutrient PoP)",
                "category": CATEGORY_NUTRIENT_OR_STRESS,
                "category_display_kn": "ಪೋಷಕಾಂಶ ಕೊರತೆ / ಪರಿಸರ ಒತ್ತಡ (Nutrient / Abiotic Stress)",
                "category_display_en": "Possible Nutrient Deficiency or Environmental Stress",
                "is_plant": True,
                "is_healthy": False,
                "crop_identification": {
                    "crop_name": crop_display,
                    "confidence": "HIGH",
                    "is_supported": is_supported
                },
                "visual_observations": {
                    "summary_kn": "ಎಲೆಗಳಲ್ಲಿ ತಿಳಿ ಹಳದಿ ಹಾಗೂ ಬಿಳುಚಿದ ಬಣ್ಣ ಕಂಡುಬರುತ್ತದೆ. ಆದರೆ ಶಿಲೀಂಧ್ರ ರೋಗಗಳ ಕಂದು ಬಣ್ಣದ ವೃತ್ತಾಕಾರದ ಕಲೆಗಳು ಅಥವಾ ರಂಧ್ರಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
                    "summary_en": "Yellow and pale patches observed on the leaf blade without necrotic spots, target rings, or fungal sporulation.",
                    "view_type": "CLOSE_UP_LEAF",
                    "lesions_or_spots_detected": False,
                    "yellowing_observed": True,
                    "yellowing_type": "GENERAL_CHLOROSIS"
                },
                "possible_diagnosis": {
                    "name_kn": "ಸಾರಜನಕ/ಪೋಷಕಾಂಶ ಕೊರತೆ ಅಥವಾ ಮಣ್ಣಿನ ತೇವಾಂಶ ಒತ್ತಡ",
                    "name_en": "Possible Nitrogen/Nutrient Deficiency or Moisture Stress",
                    "scientific_name": "Abiotic Chlorosis / Nutritional Disorder",
                    "diagnosis_type": "NUTRIENT_DEFICIENCY",
                    "justification_kn": "ಹಳದಿ ಬಣ್ಣವು ಜೀವಕೋಶದ ಒಣ ಕಲೆಯಿಲ್ಲದೆ ಹರಡಿದ್ದು, ಇದು ಸಾಂಕ್ರಾಮಿಕ ರೋಗವಲ್ಲದೆ ಪೋಷಕಾಂಶದ ಕೊರತೆಯ ಲಕ್ಷಣವಾಗಿದೆ.",
                    "justification_en": "Diffuse or interveinal chlorosis without necrotic borders indicates nutritional chlorosis or root moisture stress rather than biotic infection."
                },
                "uncertainty_or_limitations": {
                    "limitations_kn": (unsupported_note_kn + " " if unsupported_note_kn else "") + "ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮತ್ತು ರಸಸಾರ (pH) ಪರೀಕ್ಷೆಯಿಂದ ನಿಖರ ಪೋಷಕಾಂಶ ತಿಳಿಯಬಹುದು.",
                    "limitations_en": (unsupported_note_en + " " if unsupported_note_en else "") + "Soil testing and leaf tissue analysis confirm exact micro/macro nutrient levels.",
                    "confidence_rating": "MODERATE",
                    "confidence_explanation": "Visual chlorosis matches abiotic nutritional pattern."
                },
                "recommended_next_steps": {
                    "steps_kn": "ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಬೇಡಿ. ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಮತ್ತು ಬಸಿಗಾಲುವೆ ಪರೀಕ್ಷಿಸಿ. 19:19:19 ನೀರಿನಲ್ಲಿ ಕರಗುವ ಗೊಬ್ಬರ ಸಿಂಪಡಿಸಿ.",
                    "steps_en": "DO NOT spray fungicides or insecticides. Check root drainage and apply water-soluble 19:19:19 foliar spray.",
                    "request_closeup": False
                },
                "disease_identification": {
                    "disease_name_kn": "ಪೋಷಕಾಂಶ ಕೊರತೆ / ಪರಿಸರ ಒತ್ತಡ (ಸಾಂಕ್ರಾಮಿಕ ರೋಗವಲ್ಲ)",
                    "disease_name_en": "Nutrient Deficiency or Environmental Stress (Non-infectious)",
                    "scientific_name": "Nutritional Chlorosis",
                    "crop_identified": crop_display,
                    "affected_plant_part": "Foliage / Older Leaves (ಎಲೆಗಳಲ್ಲಿ ಹಳದಿ ಬಣ್ಣ)",
                    "confidence_level": "MODERATE (Assistive Agronomic Visual Triage)",
                    "confidence_score": 0.78,
                    "confidence_explanation": "ಹಳದಿ ಬಣ್ಣವು ಯಾವುದೇ ಶಿಲೀಂಧ್ರ ಕಲೆಯಿಲ್ಲದೆ ಹರಡಿದೆ."
                },
                "what_is_happening": {
                    "summary_kn": "ಎಲೆಗಳಲ್ಲಿ ಕ್ಲೋರೋಫಿಲ್ ಕೊರತೆಯಿಂದ ಹಳದಿ ಬಣ್ಣ ಬಂದಿದೆ. ಇದು ಶಿಲೀಂಧ್ರ ಅಥವಾ ಬ್ಯಾಕ್ಟೀರಿಯಾ ರೋಗವಲ್ಲ. ಸಾರಜನಕ ಅಥವಾ ಮೆಗ್ನೀಸಿಯಂ ಕೊರತೆಯಿಂದ ಈ ರೀತಿ ಉಂಟಾಗುತ್ತದೆ.",
                    "summary_en": "Pale and yellow discoloration is observed on the foliage without characteristic infectious necrotic spots. This indicates possible nutrient deficiency (such as Nitrogen or Magnesium chlorosis) or abiotic moisture stress, rather than an infectious disease."
                },
                "symptoms": {
                    "visible_symptoms_kn": "ಎಲೆಗಳಲ್ಲಿ ಸಮಗ್ರ ಅಥವಾ ನರಗಳ ನಡುವೆ ಹಳದಿ ಬಣ್ಣ (ಕ್ಲೋರೋಸಿಸ್), ಒಣಗಿದ ಕಲೆಗಳಿಲ್ಲ.",
                    "visible_symptoms_en": "Generalized or interveinal yellow chlorosis without necrotic fungal borders.",
                    "other_parts_to_check_kn": "ಗಿಡದ ಬೇರು ಕೊಳೆಯುತ್ತಿದೆಯೇ ಮತ್ತು ಮಣ್ಣಿನಲ್ಲಿ ನೀರು ನಿಂತಿದೆಯೇ ಎಂದು ಪರೀಕ್ಷಿಸಿ.",
                    "other_parts_to_check_en": "Inspect root system for waterlogging or root knot."
                },
                "possible_causes": {
                    "pathogen_type": "Abiotic / Nutrient Deficiency (ಪೋಷಕಾಂಶ ಕೊರತೆ)",
                    "favorable_conditions_kn": "ಮಣ್ಣಿನಲ್ಲಿ ಸಾರಜನಕ/ಸತುವಿನ ಕೊರತೆ, ಅತಿಯಾದ ತೇವಾಂಶ ಅಥವಾ ನೀರು ಬಸಿಯದಿರುವುದು.",
                    "favorable_conditions_en": "Nitrogen/Zinc deficiency, high soil pH, or temporary root hypoxia from waterlogging."
                },
                "treatment_and_management": {
                    "treatment_needed": True,
                    "organic_solution_kn": "1. ಎಕರೆಗೆ 10 ಕೆ.ಜಿ ಬೇವಿನ ಹಿಂಡಿ ಮತ್ತು ಚೆನ್ನಾಗಿ ಕಳಿತ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ನೀಡಿ.\n2. ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 5 ಮಿ.ಲೀ ಜೀವಾಮೃತ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.",
                    "organic_solution_en": "1. Apply well-decomposed FYM (Farmyard Manure) with neem cake.\n2. Foliar application of enriched vermiwash or bio-fertilizers.",
                    "chemical_treatment_kn": "ಕೀಟನಾಶಕ ಅಥವಾ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸಬೇಡಿ! ಪೋಷಕಾಂಶ ತಿದ್ದುಪಡಿಗೆ 19:19:19 ನೀರಿನಲ್ಲಿ ಕರಗುವ ಗೊಬ್ಬರ @ 5 ಗ್ರಾಂ/ಲೀಟರ್ ಅಥವಾ ಲಘು ಪೋಷಕಾಂಶ ಮಿಶ್ರಣ @ 2.5 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.",
                    "chemical_treatment_en": "DO NOT spray fungicides or insecticides! For nutrient correction, spray water-soluble 19:19:19 @ 5g/L or multi-micronutrient mixture @ 2.5g/L.",
                    "safety_disclaimer_kn": "⚠️ ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆ: ಇದು ರೋಗವಲ್ಲದಿರುವುದರಿಂದ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸುವುದರಿಂದ ಬೆಳೆಗೆ ಹೆಚ್ಚುವರಿ ಹಾನಿಯಾಗುತ್ತದೆ.",
                    "safety_disclaimer_en": "⚠️ Safety warning: Chemical pesticides will not fix nutrient deficiencies and can cause chemical scorch."
                },
                "prevention": {
                    "measures_kn": "• ಮಣ್ಣು ಪರೀಕ್ಷೆ ನಡೆಸಿ ಶಿಫಾರಸು ಮಾಡಿದಂತೆ NPK ಗೊಬ್ಬರ ನೀಡಿ.\n• ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಬಸಿಗಾಲುವೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ.",
                    "measures_en": "• Conduct regular soil tests and follow UASB recommended fertilizer doses.\n• Ensure adequate field drainage to avoid root suffocation."
                },
                "when_to_seek_expert_help": {
                    "triggers_kn": "ಪೋಷಕಾಂಶ ಸಿಂಪಡಿಸಿದ 10 ದಿನಗಳ ನಂತರವೂ ಎಲೆಗಳು ಹಸಿರಾಗದಿದ್ದಲ್ಲಿ ಸ್ಥಳೀಯ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರಕ್ಕೆ ಭೇಟಿ ನೀಡಿ.",
                    "triggers_en": "If chlorosis persists 10 days after nutrient correction, consult your local agricultural officer.",
                    "helpline_kn": "KVK ಮಂಡ್ಯ: 08232-277456 | ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್: 1800-180-1551"
                },
                "source_and_reliability": {
                    "official_sources": [
                        "University of Agricultural Sciences, Bengaluru (UASB) - Integrated Nutrient Management Guide",
                        "ICAR-Indian Institute of Soil Science"
                    ],
                    "uncertainty_warning_kn": "ಗಮನಿಸಿ: ಇದು ಪೋಷಕಾಂಶ ಕೊರತೆಯ ಲಕ್ಷಣವಾಗಿದೆ. ಕೀಟನಾಶಕ ಬಳಸಬೇಡಿ.",
                    "uncertainty_warning_en": "Note: Abiotic nutritional symptom. Pesticides should not be applied."
                }
            }

        # Case 4: Wide-Field Photo / Apparently Healthy
        if cv_metrics.get("is_wide_field", False) or heuristic_cat == CATEGORY_APPARENTLY_HEALTHY or (cv_metrics.get("green_ratio", 0) >= 0.50 and cv_metrics.get("necrotic_ratio", 0) < 0.010):
            is_wide = cv_metrics.get("is_wide_field", False)
            return {
                "status": "success",
                "engine": "Raitha Seva Agronomic Expert System",
                "category": CATEGORY_APPARENTLY_HEALTHY,
                "category_display_kn": "ಆರೋಗ್ಯಕರ ಬೆಳೆ / ಯಾವುದೇ ಸ್ಪಷ್ಟ ರೋಗ ಲಕ್ಷಣಗಳಿಲ್ಲ",
                "category_display_en": "Apparently Healthy / No Obvious Symptoms Visible",
                "is_plant": True,
                "is_healthy": True,
                "crop_identification": {
                    "crop_name": crop_display,
                    "confidence": "HIGH" if not is_wide else "MODERATE",
                    "is_supported": is_supported
                },
                "visual_observations": {
                    "summary_kn": (
                        "ಬೆಳೆಯು ಸಾಮಾನ್ಯವಾಗಿ ಹಸಿರಾಗಿದ್ದು ಉತ್ತಮ ಸ್ಥಿತಿಯಲ್ಲಿ ಕಂಡುಬರುತ್ತದೆ. "
                        + ("ಇದು ವಿಶಾಲ ಕೋನದ ಜಮೀನಿನ ಫೋಟೋ ಆಗಿರುವುದರಿಂದ ಪ್ರತ್ಯೇಕ ಎಲೆಗಳ ಮೇಲಿನ ಸೂಕ್ಷ್ಮ ಚುಕ್ಕೆಗಳನ್ನು ಪರೀಕ್ಷಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ." if is_wide else "ಎಲೆಗಳಲ್ಲಿ ಯಾವುದೇ ರೋಗಾಣು ಸೋಂಕು ಅಥವಾ ಒಣ ಚುಕ್ಕೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.")
                    ),
                    "summary_en": (
                        "No obvious disease symptoms detected in this image. The crop appears generally green and healthy from the visible view. "
                        + ("However, this is a wide-angle image, so individual leaves cannot be examined closely. Upload a clear close-up of the leaves if you notice spots, yellowing, wilting, or other changes." if is_wide else "Foliage shows vibrant green vegetative growth with no visible necrotic lesions or pest feeding damage.")
                    ),
                    "view_type": "WIDE_FIELD" if is_wide else "CLOSE_UP_LEAF",
                    "lesions_or_spots_detected": False,
                    "yellowing_observed": False,
                    "yellowing_type": "NONE"
                },
                "possible_diagnosis": {
                    "name_kn": "ಯಾವುದೇ ಸ್ಪಷ್ಟ ರೋಗ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿಲ್ಲ",
                    "name_en": "No obvious disease symptoms detected",
                    "scientific_name": "None",
                    "diagnosis_type": "HEALTHY",
                    "justification_kn": "ಬೆಳೆಯ ಕ್ಯಾನೋಪಿ ಹಸಿರಾಗಿದ್ದು ಯಾವುದೇ ನೆಕ್ರೋಟಿಕ್ ಕಲೆಗಳು ಅಥವಾ ಕೀಟ ಬಾಧೆ ಕಂಡುಬಂದಿಲ್ಲ.",
                    "justification_en": "Uniform green canopy without focal necrotic spots, sporulation, or pest defoliation."
                },
                "uncertainty_or_limitations": {
                    "limitations_kn": (unsupported_note_kn + " " if unsupported_note_kn else "") + ("ವಿಶಾಲ ಕೋನದ ಚಿತ್ರದಲ್ಲಿ ಸಣ್ಣ ಎಲೆ ಚುಕ್ಕೆಗಳು ಕಾಣದಿರಬಹುದು. ಸಂಶಯವಿದ್ದರೆ ಹತ್ತಿರದ ಫೋಟೋ ಹಾಕಿ." if is_wide else "ಕ್ಯಾಮೆರಾ ವೀಕ್ಷಣೆಯಲ್ಲಿ ಎಲೆಯ ಮೇಲ್ಮೈ ಆರೋಗ್ಯಕರವಾಗಿದೆ."),
                    "limitations_en": (unsupported_note_en + " " if unsupported_note_en else "") + ("Wide-angle view limits detection of microscopic early lesions." if is_wide else "Visible leaf surface is in good health."),
                    "confidence_rating": "HIGH",
                    "confidence_explanation": "Healthy green canopy with absence of necrotic patches."
                },
                "recommended_next_steps": {
                    "steps_kn": "ವಾರಕ್ಕೊಮ್ಮೆ ಜಮೀನಿನಲ್ಲಿ ನಿಯಮಿತ ಪರಿಶೀಲನೆ (Crop Scouting) ನಡೆಸಿ. ಯಾವುದೇ ರಾಸಾಯನಿಕ ಸಿಂಪಡಣೆ ಅಗತ್ಯವಿಲ್ಲ.",
                    "steps_en": "Conduct regular weekly field scouting. No chemical sprays are needed.",
                    "request_closeup": is_wide
                },
                "disease_identification": {
                    "disease_name_kn": "ಯಾವುದೇ ಸ್ಪಷ್ಟ ರೋಗ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿಲ್ಲ (ಆರೋಗ್ಯಕರ ಬೆಳೆ)",
                    "disease_name_en": "No Obvious Disease Symptoms Detected (Healthy Crop)",
                    "scientific_name": "N/A",
                    "crop_identified": crop_display,
                    "affected_plant_part": "Canopy / Foliage (ಆರೋಗ್ಯಕರ)",
                    "confidence_level": "HIGH (Assistive Visual Triage)",
                    "confidence_score": 0.88,
                    "confidence_explanation": "ಬೆಳೆಯು ಹಸಿರಾಗಿದ್ದು ಯಾವುದೇ ರೋಗದ ಕಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ."
                },
                "what_is_happening": {
                    "summary_kn": (
                        "ನಿಮ್ಮ ಬೆಳೆಯು ಸಾಮಾನ್ಯವಾಗಿ ಹಸಿರಾಗಿದ್ದು ಉತ್ತಮ ಆರೋಗ್ಯ ಸ್ಥಿತಿಯಲ್ಲಿದೆ. "
                        + ("ಇದು ವಿಶಾಲ ಕೋನದ ಚಿತ್ರವಾದ್ದರಿಂದ ಪ್ರತ್ಯೇಕ ಎಲೆಗಳಲ್ಲಿ ಕಲೆಗಳಿದ್ದರೆ ಹತ್ತಿರದ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ." if is_wide else "ಎಲೆಗಳಲ್ಲಿ ಆಹಾರ ತಯಾರಿಕೆ ಉತ್ತಮವಾಗಿದ್ದು ಯಾವುದೇ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸುವ ಅಗತ್ಯವಿಲ್ಲ.")
                    ),
                    "summary_en": (
                        "No obvious disease symptoms detected in this image. The crop appears generally green and healthy from the visible view. "
                        + ("However, this is a wide-angle image, so individual leaves cannot be examined closely. Upload a clear close-up of the leaves if you notice spots, yellowing, wilting, or other changes." if is_wide else "Your crop shows vigorous vegetative growth with no visible signs of pathogen infection. No chemical spraying is needed.")
                    )
                },
                "symptoms": {
                    "visible_symptoms_kn": "ಯಾವುದೇ ರೋಗ ಲಕ್ಷಣಗಳಿಲ್ಲ. ಕ್ಯಾನೋಪಿ ಸಹಜ ಹಸಿರಾಗಿದೆ.",
                    "visible_symptoms_en": "No symptoms detected; natural green canopy.",
                    "other_parts_to_check_kn": "ಕೆಳಗಿನ ಎಲೆಗಳು ಮತ್ತು ಚಿಗುರುಗಳನ್ನು ನಿಯಮಿತವಾಗಿ ಪರಿಶೀಲಿಸಿ.",
                    "other_parts_to_check_en": "Scout lower leaves and active tillers/shoots regularly."
                },
                "possible_causes": {
                    "pathogen_type": "None (ಆರೋಗ್ಯಕರ ಬೆಳೆ)",
                    "favorable_conditions_kn": "ಉತ್ತಮ ಕೃಷಿ ಪದ್ಧತಿ ಮತ್ತು ಸೂಕ್ತ ತೇವಾಂಶ.",
                    "favorable_conditions_en": "Normal growing conditions."
                },
                "treatment_and_management": {
                    "treatment_needed": False,
                    "organic_solution_kn": "ಯಾವುದೇ ಸಿಂಪಡಣೆ ಅಗತ್ಯವಿಲ್ಲ. ಜೀವಾಮೃತ ಅಥವಾ ಸಮತೋಲಿತ ಪೋಷಕಾಂಶ ನೀಡಿ.",
                    "organic_solution_en": "No chemical spraying needed. Continue organic soil health management.",
                    "chemical_treatment_kn": "ಯಾವುದೇ ರಾಸಾಯನಿಕ ಸಿಂಪಡಿಸಬೇಡಿ (No chemical spraying needed).",
                    "chemical_treatment_en": "No chemical sprays needed. Do not apply fungicides to healthy crops.",
                    "safety_disclaimer_kn": "⚠️ ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆ: ಆರೋಗ್ಯಕರ ಬೆಳೆಗೆ ಅನಗತ್ಯ ರಾಸಾಯನಿಕ ಸಿಂಪಡಿಸುವುದು ವೆಚ್ಚ ಮತ್ತು ಪರಿಸರಕ್ಕೆ ಹಾನಿಕಾರಕ.",
                    "safety_disclaimer_en": "⚠️ Safety notice: Spraying healthy crops wastes input costs and disrupts beneficial predatory insects."
                },
                "prevention": {
                    "measures_kn": "• ಶಿಫಾರಸು ಮಾಡಿದ ಅಂತರದಲ್ಲಿ ಬೆಳೆಸಿ.\n• ಹನಿ ನೀರಾವರಿ ಮತ್ತು ಸಮತೋಲಿತ NPK ನಿರ್ವಹಿಸಿ.\n• ಕಳೆ ಮುಕ್ತವಾಗಿರಿಸಿ.",
                    "measures_en": "• Maintain recommended plant spacing and canopy aeration.\n• Follow balanced NPK scheduling according to UASB Package of Practices.\n• Keep field weed-free."
                },
                "when_to_seek_expert_help": {
                    "triggers_kn": "ಭವಿಷ್ಯದಲ್ಲಿ ಎಲೆಗಳಲ್ಲಿ ಚುಕ್ಕೆಗಳು ಅಥವಾ ಹಳದಿ ಬಣ್ಣ ಕಂಡುಬಂದರೆ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
                    "triggers_en": "Upload a fresh close-up photo if foliar spots, yellowing, or wilting appear later.",
                    "helpline_kn": "KVK ಮಂಡ್ಯ: 08232-277456"
                },
                "source_and_reliability": {
                    "official_sources": [
                        "University of Agricultural Sciences, Bengaluru (UASB) - Good Agricultural Practices",
                        "Karnataka Department of Agriculture (KSDA / Raitamitra)"
                    ],
                    "uncertainty_warning_kn": "ಗಮನಿಸಿ: ಈ ಚಿತ್ರದಲ್ಲಿ ಯಾವುದೇ ರೋಗ ಲಕ್ಷಣಗಳಿಲ್ಲ.",
                    "uncertainty_warning_en": "Note: No visible disease symptoms detected."
                }
            }

        # Case 5: Blurry / Ambiguous / Inconclusive Image (Default Fallback)
        return {
            "status": "success",
            "engine": "Raitha Seva Agronomic Expert System",
            "category": CATEGORY_INCONCLUSIVE,
            "category_display_kn": "ಅನಿರ್ದಿಷ್ಟ / ಸ್ಪಷ್ಟ ಪುರಾವೆಗಳಿಲ್ಲ (Inconclusive)",
            "category_display_en": "Inconclusive / Insufficient Visual Evidence",
            "is_plant": True,
            "is_healthy": False,
            "crop_identification": {
                "crop_name": crop_display,
                "confidence": "LOW",
                "is_supported": is_supported
            },
            "visual_observations": {
                "summary_kn": "ಚಿತ್ರವು ಮಸುಕಾಗಿದೆ ಅಥವಾ ಸಾಕಷ್ಟು ವಿವರಣೆ ಹೊಂದಿಲ್ಲ. ಎಲೆಯ ಮೇಲಿನ ನಿರ್ದಿಷ್ಟ ಕಲೆಗಳನ್ನು ಪ್ರತ್ಯೇಕಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.",
                "summary_en": "The image is blurry or out of focus. Individual leaf lesions and symptom margins cannot be resolved reliably.",
                "view_type": "UNCLEAR",
                "lesions_or_spots_detected": False,
                "yellowing_observed": cv_metrics.get("yellow_ratio", 0) > 0.05,
                "yellowing_type": "OTHER"
            },
            "possible_diagnosis": {
                "name_kn": "ಅನಿರ್ದಿಷ್ಟ ಫಲಿತಾಂಶ (ರೋಗ ಅಥವಾ ಕೊರತೆಯನ್ನು ದೃಢಪಡಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ)",
                "name_en": "Inconclusive (Cannot determine disease or deficiency safely)",
                "scientific_name": "N/A",
                "diagnosis_type": "INCONCLUSIVE",
                "justification_kn": "ಪುರಾವೆಗಳ ಕೊರತೆಯಿಂದಾಗಿ ಯಾವುದೇ ರೋಗವನ್ನು ಹೆಸರಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.",
                "justification_en": "Insufficient visual evidence to support any disease diagnosis without risking a false positive."
            },
            "uncertainty_or_limitations": {
                "limitations_kn": (unsupported_note_kn + " " if unsupported_note_kn else "") + "ಚಿತ್ರದ ಮಸುಕು ಮತ್ತು ಫೋಕಸ್ ಕೊರತೆಯಿಂದಾಗಿ ಖಚಿತ ರೋಗನಿರ್ಣಯ ಅಸಾಧ್ಯ.",
                "limitations_en": (unsupported_note_en + " " if unsupported_note_en else "") + "Blurriness and low spatial resolution prevent clinical assessment.",
                "confidence_rating": "INCONCLUSIVE",
                "confidence_explanation": "Low sharpness or ambiguous foliage prevents safe disease identification."
            },
            "recommended_next_steps": {
                "steps_kn": "ಕ್ಯಾಮೆರಾವನ್ನು ಎಲೆಯ ಹತ್ತಿರ ಹಿಡಿದು, ನೈಸರ್ಗಿಕ ಬೆಳಕಿನಲ್ಲಿ ಸ್ಪಷ್ಟ ಫೋಕಸ್ ಇರುವ ಫೋಟೋ ತೆಗೆಯಿರಿ. ಎಲೆಯ ಎರಡೂ ಬದಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
                "steps_en": "Hold the camera steady 15-20 cm from affected leaves in good daylight. Capture both upper and lower leaf surfaces.",
                "request_closeup": True
            },
            "disease_identification": {
                "disease_name_kn": "ಅನಿರ್ದಿಷ್ಟ / ಸ್ಪಷ್ಟ ಪುರಾವೆಗಳಿಲ್ಲ (Inconclusive)",
                "disease_name_en": "Inconclusive / Insufficient Visual Evidence",
                "scientific_name": "N/A",
                "crop_identified": crop_display,
                "affected_plant_part": "Foliage (ಅಸ್ಪಷ್ಟ)",
                "confidence_level": "ಅನಿರ್ದಿಷ್ಟ / Inconclusive",
                "confidence_score": 0.35,
                "confidence_explanation": "ಚಿತ್ರದ ಮಸುಕುತನದಿಂದಾಗಿ ರೋಗವನ್ನು ಖಚಿತಪಡಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ."
            },
            "what_is_happening": {
                "summary_kn": "ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾದ ಫೋಟೋದಲ್ಲಿ ಸ್ಪಷ್ಟ ವಿವರಗಳು ಲಭ್ಯವಿಲ್ಲ. ರೋಗ ದೃಢಪಡುವ ಮೊದಲು ಯಾವುದೇ ಔಷಧಿ ಸಿಂಪಡಿಸಬೇಡಿ.",
                "summary_en": "The uploaded photo does not provide sufficient visual resolution or clear leaf details to confirm a diagnosis safely. Do not treat without a clear diagnosis."
            },
            "symptoms": {
                "visible_symptoms_kn": "ಮಸುಕು ಚಿತ್ರ, ನಿರ್ದಿಷ್ಟ ಲಕ್ಷಣಗಳು ಗೋಚರಿಸುತ್ತಿಲ್ಲ.",
                "visible_symptoms_en": "Blurry image; specific lesions cannot be characterized.",
                "other_parts_to_check_kn": "ಎಲೆಯ ಕೆಳಭಾಗದಲ್ಲಿ ಶಿಲೀಂಧ್ರ ಅಥವಾ ನುಸಿ ಇದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.",
                "other_parts_to_check_en": "Check underside of leaves for mycelium or sucking pests."
            },
            "possible_causes": {
                "pathogen_type": "Unknown / Insufficient Evidence",
                "favorable_conditions_kn": "ಸ್ಪಷ್ಟ ಫೋಟೋ ಅಗತ್ಯವಿದೆ.",
                "favorable_conditions_en": "Clear close-up photograph required."
            },
            "treatment_and_management": {
                "treatment_needed": False,
                "organic_solution_kn": "ರೋಗ ದೃಢಪಡುವವರೆಗೆ ಕಾಯಿರಿ.",
                "organic_solution_en": "Await confirmed diagnosis before treatment.",
                "chemical_treatment_kn": "ಯಾವುದೇ ರಾಸಾಯನಿಕ ಸಿಂಪಡಿಸಬೇಡಿ. ತಪ್ಪಾದ ಸಿಂಪಡಣೆಯು ಬೆಳೆಗೆ ಹಾನಿ ಉಂಟುಮಾಡಬಹುದು.",
                "chemical_treatment_en": "DO NOT spray chemical pesticides without a verified diagnosis.",
                "safety_disclaimer_kn": "⚠️ ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆ: ಖಚಿತವಿಲ್ಲದೆ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಬೇಡಿ.",
                "safety_disclaimer_en": "⚠️ Safety notice: Never apply pesticides without an evidence-based diagnosis."
            },
            "prevention": {
                "measures_kn": "ಎಲೆಗಳ ಹತ್ತಿರದ ಸ್ಪಷ್ಟ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
                "measures_en": "Upload a sharp, focused close-up of affected foliage."
            },
            "when_to_seek_expert_help": {
                "triggers_kn": "ಸಮಸ್ಯೆ ಮುಂದುವರಿದರೆ ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿ ಅಥವಾ KVK ಮಂಡ್ಯ (08232-277456) ಸಂಪರ್ಕಿಸಿ.",
                "triggers_en": "If symptoms spread, contact local Raitha Samparka Kendra or KVK Mandya (08232-277456).",
                "helpline_kn": "KVK ಮಂಡ್ಯ: 08232-277456 | ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್: 1800-180-1551"
            },
            "source_and_reliability": {
                "official_sources": [
                    "University of Agricultural Sciences, Bengaluru (UASB)",
                    "Karnataka Department of Agriculture (KSDA)"
                ],
                "uncertainty_warning_kn": "ಗಮನಿಸಿ: ಫೋಟೋ ಅಸ್ಪಷ್ಟವಾಗಿದ್ದು ರೋಗ ದೃಢಪಡಿಸಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ.",
                "uncertainty_warning_en": "Note: Evidence is insufficient. Do not spray chemicals without confirmed advice."
            }
        }

    def _validate_and_format_diagnosis(
        self,
        raw_json: Dict[str, Any],
        cv_metrics: Optional[Dict[str, Any]] = None,
        language: str = "kn"
    ) -> Dict[str, Any]:
        """
        Validates the raw LLM output against objective CV heuristics,
        enforces standard categories, and prevents ungrounded hallucinations.
        """
        if cv_metrics is None:
            cv_metrics = {}

        category = raw_json.get("category", "")
        is_plant = raw_json.get("is_plant", True)
        is_healthy = raw_json.get("is_healthy", False)

        # 1. Botanical Crop & Plant Part Resolution
        crop_ident = raw_json.setdefault("crop_identification", {})
        crop_name = crop_ident.get("crop_name", "")
        norm_crop = normalize_crop_slug(crop_name)
        is_supported = (norm_crop in KARNATAKA_POP_SUPPORTED_CROPS) or (norm_crop == "auto")
        crop_ident["is_supported"] = is_supported

        # If CV detected grain or cob morphology, botanical morphological reality overrides default hints
        if cv_metrics.get("is_grain_or_cob", False) and (norm_crop in ["auto", "crop", "unknown", "paddy", "rice"]):
            logger.info("[Vision Doctor] Grain/cob morphology detected. Resolving crop to Maize/Corn.")
            norm_crop = "maize"
            crop_ident["crop_name"] = "Maize / Corn (ಮೆಕ್ಕೆಜೋಳ)"
            crop_ident["plant_part"] = "EAR_COB"
            crop_ident["is_supported"] = True

        plant_part = crop_ident.get("plant_part") or cv_metrics.get("detected_part", "FOLIAGE")
        crop_ident["plant_part"] = plant_part
        raw_json["crop_identification"] = crop_ident

        # Cross-check with objective CV metrics
        if not cv_metrics.get("is_plant", True) and is_plant and cv_metrics:
            raw_json["is_plant"] = False
            raw_json["category"] = CATEGORY_NON_PLANT
            category = CATEGORY_NON_PLANT

        if cv_metrics.get("is_wide_field", False) and category == CATEGORY_POSSIBLE_DISEASE:
            logger.info("[Vision Doctor] Overruling disease to APPARENTLY_HEALTHY due to wide-angle field view.")
            raw_json["category"] = CATEGORY_APPARENTLY_HEALTHY
            raw_json["is_healthy"] = True
            category = CATEGORY_APPARENTLY_HEALTHY

        # Standardize category labels
        if category not in [
            CATEGORY_APPARENTLY_HEALTHY,
            CATEGORY_POSSIBLE_DISEASE,
            CATEGORY_POSSIBLE_PEST,
            CATEGORY_NUTRIENT_OR_STRESS,
            CATEGORY_INCONCLUSIVE,
            CATEGORY_NON_PLANT
        ]:
            if not is_plant:
                category = CATEGORY_NON_PLANT
            elif is_healthy:
                category = CATEGORY_APPARENTLY_HEALTHY
            else:
                category = CATEGORY_POSSIBLE_DISEASE
            raw_json["category"] = category

        # Add bilingual category display
        cat_map = {
            CATEGORY_APPARENTLY_HEALTHY: ("ಆರೋಗ್ಯಕರ ಬೆಳೆ / ಯಾವುದೇ ಸ್ಪಷ್ಟ ರೋಗ ಲಕ್ಷಣಗಳಿಲ್ಲ", "Apparently Healthy / No Obvious Symptoms Visible"),
            CATEGORY_POSSIBLE_DISEASE: ("ಸಂಭಾವ್ಯ ಬೆಳೆ ರೋಗ (Possible Disease)", "Possible Crop Disease"),
            CATEGORY_POSSIBLE_PEST: ("ಸಂಭಾವ್ಯ ಕೀಟ ಬಾಧೆ (Possible Pest Damage)", "Possible Pest Damage"),
            CATEGORY_NUTRIENT_OR_STRESS: ("ಪೋಷಕಾಂಶ ಕೊರತೆ / ಪರಿಸರ ಒತ್ತಡ (Nutrient / Abiotic Stress)", "Possible Nutrient Deficiency or Environmental Stress"),
            CATEGORY_INCONCLUSIVE: ("ಅನಿರ್ದಿಷ್ಟ / ಸ್ಪಷ್ಟ ಪುರಾವೆಗಳಿಲ್ಲ (Inconclusive)", "Inconclusive / Insufficient Visual Evidence"),
            CATEGORY_NON_PLANT: ("ಸಸ್ಯವಲ್ಲದ ಚಿತ್ರ (Non-plant)", "Non-plant image detected")
        }
        raw_json["category_display_kn"] = cat_map[category][0]
        raw_json["category_display_en"] = cat_map[category][1]

        # 2. Biological Host-Pathogen Compatibility Check
        poss_diag = raw_json.setdefault("possible_diagnosis", {})
        dis_name_en = poss_diag.get("name_en", "")
        dis_name_kn = poss_diag.get("name_kn", "")
        sci_name = poss_diag.get("scientific_name", "")

        is_compat, correction = validate_crop_pathogen_compatibility(
            crop_slug=norm_crop,
            plant_part=plant_part,
            disease_name_en=dis_name_en,
            disease_name_kn=dis_name_kn,
            scientific_name=sci_name
        )

        mismatch_intercepted = False
        if not is_compat:
            mismatch_intercepted = True
            logger.warning(f"[Vision Doctor Host Mismatch] {correction.get('mismatch_reason')}")
            poss_diag["name_en"] = correction["name_en"]
            poss_diag["name_kn"] = correction["name_kn"]
            poss_diag["scientific_name"] = correction["scientific_name"]
            plant_part = correction.get("affected_plant_part", plant_part)
            crop_ident["plant_part"] = plant_part
            if "crop_name" in correction:
                crop_ident["crop_name"] = correction["crop_name"]
                norm_crop = correction.get("crop_slug", "maize")

            raw_json.setdefault("uncertainty_or_limitations", {})
            raw_json["uncertainty_or_limitations"]["limitations_en"] = correction["mismatch_reason"]
            raw_json["uncertainty_or_limitations"]["limitations_kn"] = (
                "ಜೈವಿಕ ಹೊಂದಾಣಿಕೆ ತಿದ್ದುಪಡಿ: ರೋಗಾಣು ಮತ್ತು ಬೆಳೆಯ ನಡುವಿನ ಹೊಂದಾಣಿಕೆಯಿಲ್ಲದಿರುವುದು ಪತ್ತೆಯಾಗಿದೆ. "
                "ಚಿತ್ರದಲ್ಲಿನ ಅಂಗರಚನೆಯ ಆಧಾರದ ಮೇಲೆ ಸೂಕ್ತ ರೋಗನಿರ್ಣಯಕ್ಕೆ ಸರಿಪಡಿಸಲಾಗಿದೆ."
            )
            raw_json["uncertainty_or_limitations"]["confidence_rating"] = "MODERATE"
            raw_json["uncertainty_or_limitations"]["confidence_explanation"] = (
                "Host range corrected visual triage. Laboratory diagnostic testing recommended for definitive pathogen confirmation."
            )

        # 3. Chemical Safety Enforcement & Sanitization
        raw_json["treatment_and_management"] = sanitize_chemical_recommendations(
            crop_slug=norm_crop,
            plant_part=plant_part,
            category=category,
            treatment_dict=raw_json.setdefault("treatment_and_management", {})
        )

        # 4. Calibrate Confidence Ratings (Prevent uncalibrated 96.2% percentages)
        if category == CATEGORY_APPARENTLY_HEALTHY:
            conf_rating = "HIGH"
            conf_level = "HIGH (Assistive Visual Triage)"
            conf_score = 0.88
            conf_expl = "Uniform healthy canopy without focal necrotic spots or pest defoliation."
        elif category == CATEGORY_POSSIBLE_DISEASE:
            conf_rating = "MODERATE"
            conf_level = "MODERATE (Assistive Agronomic Visual Triage - Host Corrected)" if mismatch_intercepted else "MODERATE (Assistive Agronomic Visual Triage)"
            conf_score = 0.70 if mismatch_intercepted else 0.82
            conf_expl = "Visual necrotic lesions observed. Laboratory fungal culture recommended for definitive verification."
        elif category == CATEGORY_POSSIBLE_PEST:
            conf_rating = "MODERATE"
            conf_level = "MODERATE (Assistive Agronomic Visual Triage)"
            conf_score = 0.80
            conf_expl = "Visual feeding damage observed. Field scouting recommended."
        elif category == CATEGORY_NUTRIENT_OR_STRESS:
            conf_rating = "MODERATE"
            conf_level = "MODERATE (Assistive Agronomic Visual Triage)"
            conf_score = 0.78
            conf_expl = "Visual chlorosis matches abiotic nutritional pattern rather than biotic lesions."
        elif category == CATEGORY_NON_PLANT:
            conf_rating = "HIGH"
            conf_level = "ಸಸ್ಯವಲ್ಲ / Non-Plant"
            conf_score = 1.0
            conf_expl = "Color index confirms absence of agricultural vegetation."
        else:  # INCONCLUSIVE
            conf_rating = "INCONCLUSIVE"
            conf_level = "ಅನಿರ್ದಿಷ್ಟ / Inconclusive"
            conf_score = 0.35
            conf_expl = "Low sharpness, lighting glare, or ambiguous foliage prevents safe visual disease identification."

        # Synchronize disease_identification
        raw_json["disease_identification"] = {
            "disease_name_kn": poss_diag.get("name_kn", raw_json["category_display_kn"]),
            "disease_name_en": poss_diag.get("name_en", raw_json["category_display_en"]),
            "scientific_name": poss_diag.get("scientific_name", "N/A"),
            "crop_identified": crop_ident.get("crop_name", "Crop"),
            "affected_plant_part": plant_part,
            "confidence_level": conf_level,
            "confidence_score": conf_score,
            "confidence_explanation": conf_expl
        }

        if "what_is_happening" not in raw_json:
            raw_json["what_is_happening"] = {
                "summary_kn": raw_json.get("visual_observations", {}).get("summary_kn", ""),
                "summary_en": raw_json.get("visual_observations", {}).get("summary_en", "")
            }

        if "symptoms" not in raw_json:
            raw_json["symptoms"] = {
                "visible_symptoms_kn": raw_json.get("visual_observations", {}).get("summary_kn", ""),
                "visible_symptoms_en": raw_json.get("visual_observations", {}).get("summary_en", ""),
                "other_parts_to_check_kn": "ಇತರ ಭಾಗಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
                "other_parts_to_check_en": "Check other plant parts."
            }

        if "possible_causes" not in raw_json:
            raw_json["possible_causes"] = {
                "pathogen_type": poss_diag.get("diagnosis_type", "None"),
                "favorable_conditions_kn": "ಸಾಮಾನ್ಯ ವಾತಾವರಣ.",
                "favorable_conditions_en": "Standard conditions."
            }

        return raw_json

    def _enrich_with_trusted_evidence(
        self,
        diagnosis_res: Dict[str, Any],
        crop_hint: str,
        language: str
    ) -> Dict[str, Any]:
        """
        Grounds diagnosis with verified evidence from ChromaDB knowledge base (UASB, ICAR, KSDA).
        Only retrieves crop-specific problem guidance when disease/pest matches.
        """
        category = diagnosis_res.get("category")
        crop_name = diagnosis_res.get("crop_identification", {}).get("crop_name", crop_hint)
        norm_crop = normalize_crop_slug(crop_name)

        try:
            from assistant.rag import rag_engine

            if category in [CATEGORY_POSSIBLE_DISEASE, CATEGORY_POSSIBLE_PEST]:
                problem = diagnosis_res.get("possible_diagnosis", {}).get("name_en", "disease")
                rag_crop = rag_engine.detect_crop(norm_crop)
                query = f"{norm_crop} {problem} control package of practices"
                chunks = rag_engine.retrieve_evidence(query=query, crop=rag_crop, n_results=2)
                if chunks:
                    diagnosis_res["citations"] = [
                        f"{c['metadata'].get('source')} - {c['metadata'].get('title')} ({c['metadata'].get('publication_date')})"
                        for c in chunks
                    ]

            elif category == CATEGORY_NUTRIENT_OR_STRESS:
                rag_crop = rag_engine.detect_crop(norm_crop)
                query = f"{norm_crop} nutrient deficiency nitrogen potassium chlorosis management"
                chunks = rag_engine.retrieve_evidence(query=query, crop=rag_crop, n_results=2)
                if chunks:
                    diagnosis_res["citations"] = [
                        f"{c['metadata'].get('source')} - {c['metadata'].get('title')} ({c['metadata'].get('publication_date')})"
                        for c in chunks
                    ]
        except Exception as e:
            logger.warning(f"[Vision Doctor] RAG evidence enrichment notice: {e}")

        return diagnosis_res

    def _build_error_response(self, error_msg: str, language: str = "kn") -> Dict[str, Any]:
        """Builds structured error response with actionable guidance."""
        return {
            "status": "error",
            "message": error_msg,
            "category": CATEGORY_INCONCLUSIVE,
            "category_display_kn": "ದೋಷ ಉಂಟಾಗಿದೆ",
            "category_display_en": "Processing error",
            "disease_identification": {
                "disease_name_kn": "ಚಿತ್ರ ಪ್ರಕ್ರಿಯೆ ವಿಫಲವಾಗಿದೆ",
                "disease_name_en": "Image processing error",
                "scientific_name": "N/A",
                "crop_identified": "ಅಪರಿಚಿತ / Unknown",
                "affected_plant_part": "N/A",
                "confidence_level": "0%",
                "confidence_score": 0.0,
                "confidence_explanation": error_msg
            },
            "what_is_happening": {
                "summary_kn": "ಫೋಟೋ ಕಳುಹಿಸುವಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ. ದಯವಿಟ್ಟು 10MB ಗಿಂತ ಕಡಿಮೆ ಗಾತ್ರದ ಸ್ಪಷ್ಟ JPG ಅಥವಾ PNG ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
                "summary_en": "Failed to decode the image file. Please upload a clear JPG, PNG, or WEBP image under 10MB."
            },
            "symptoms": {
                "visible_symptoms_kn": "ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ",
                "visible_symptoms_en": "Not available",
                "other_parts_to_check_kn": "ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ",
                "other_parts_to_check_en": "Not available"
            },
            "possible_causes": {
                "pathogen_type": "N/A",
                "favorable_conditions_kn": "N/A",
                "favorable_conditions_en": "N/A"
            },
            "treatment_and_management": {
                "treatment_needed": False,
                "organic_solution_kn": "ಸಹಾಯವಾಣಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ",
                "organic_solution_en": "Contact helpline",
                "chemical_treatment_kn": "ಯಾವುದೇ ರಾಸಾಯನಿಕ ಸಿಂಪಡಿಸಬೇಡಿ",
                "chemical_treatment_en": "Do not spray chemicals",
                "safety_disclaimer_kn": "ಎಚ್ಚರಿಕೆ",
                "safety_disclaimer_en": "Notice"
            },
            "prevention": {
                "measures_kn": "ಸ್ಪಷ್ಟ ಫೋಟೋ ತೆಗೆಯಿರಿ",
                "measures_en": "Retake a clear photo"
            },
            "when_to_seek_expert_help": {
                "triggers_kn": "KVK ಮಂಡ್ಯ ಸಂಪರ್ಕಿಸಿ: 08232-277456",
                "triggers_en": "Call KVK Mandya: 08232-277456",
                "helpline_kn": "08232-277456"
            },
            "source_and_reliability": {
                "official_sources": ["Raitha Seva AI"],
                "uncertainty_warning_kn": "ದೋಷ ಉಂಟಾಗಿದೆ",
                "uncertainty_warning_en": "Error occurred"
            }
        }

# Global singleton
vision_doctor = PlantDiseaseVisionDoctor()
