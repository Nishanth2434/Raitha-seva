"""
Unit and Integration Tests for Multimodal Plant Disease Vision Doctor.
Verifies all 8 structured sections, edge cases (clear close-up, wide-field, ambiguous/blurry,
nutrient deficiency, healthy, non-plant, unsupported crops), chemical safety,
and calculates benchmark metrics (False-Positive Rate, Recall, Inconclusive Rate).
"""

import io
import math
import base64
import numpy as np
from PIL import Image
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from assistant.vision import (
    PlantDiseaseVisionDoctor,
    vision_doctor,
    CATEGORY_APPARENTLY_HEALTHY,
    CATEGORY_POSSIBLE_DISEASE,
    CATEGORY_POSSIBLE_PEST,
    CATEGORY_NUTRIENT_OR_STRESS,
    CATEGORY_INCONCLUSIVE,
    CATEGORY_NON_PLANT
)


def create_b64_image(width: int, height: int, pixel_gen) -> str:
    img = Image.new("RGB", (width, height))
    pixels = img.load()
    for y in range(height):
        for x in range(width):
            pixels[x, y] = pixel_gen(x, y, width, height)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")


class PlantDiseaseVisionTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        # 1. Healthy close-up leaf: high green, leaf-vein variation, high sharpness
        cls.img_healthy_closeup = create_b64_image(
            200, 200,
            lambda x, y, w, h: (
                int(30 + 15 * math.sin(x / 5.0)),
                int(145 + 20 * math.cos(y / 5.0)),
                int(35 + 10 * math.sin((x + y) / 7.0))
            )
        )

        # 2. Healthy wide-angle field photo: 400x200 (aspect 2.0), vast green canopy
        cls.img_healthy_widefield = create_b64_image(
            400, 200,
            lambda x, y, w, h: (
                int(40 + 10 * math.sin(x / 10.0)),
                int(135 + 15 * math.sin(y / 10.0)),
                int(45 + 10 * math.cos(x / 10.0))
            )
        )

        # 3. Confirmed disease leaf: green background with dark brown necrotic spots
        def disease_pixels(x, y, w, h):
            # 3 focal necrotic spots with chlorotic yellow halos
            centers = [(60, 60), (140, 80), (100, 140)]
            for cx, cy in centers:
                dist = math.hypot(x - cx, y - cy)
                if dist < 12:  # Necrotic brown center
                    return (105, 50, 30)
                elif dist < 20:  # Chlorotic halo
                    return (185, 175, 45)
            return (
                int(30 + 10 * math.sin(x / 5.0)),
                int(140 + 15 * math.cos(y / 5.0)),
                int(35 + 10 * math.sin(y / 5.0))
            )
        cls.img_diseased_leaf = create_b64_image(200, 200, disease_pixels)

        # 4. Nutrient-deficiency leaf: diffuse yellow chlorosis, NO necrotic spots
        cls.img_nutrient_deficiency = create_b64_image(
            200, 200,
            lambda x, y, w, h: (
                int(180 + 20 * math.sin(x / 8.0)),
                int(185 + 20 * math.cos(y / 8.0)),
                int(50 + 15 * math.sin((x + y) / 10.0))
            )
        )

        # 5. Blurry / Inconclusive leaf: ambiguous foliage in shadows / low contrast
        cls.img_blurry_leaf = create_b64_image(
            200, 200,
            lambda x, y, w, h: (40, 120, 45) if (x < 70 and y < 70) else (75, 75, 70)
        )

        # 6. Non-plant image: solid blue-gray indoor surface
        cls.img_non_plant = create_b64_image(
            200, 200,
            lambda x, y, w, h: (50, 60, 140)
        )

        # 7. Maize ear / cob with damaged kernels (Bug reproduction case)
        # Golden yellow/orange kernels with localized dark necrotic/rotted spots
        def maize_ear_pixels(x, y, w, h):
            damaged_spots = [(70, 70), (130, 110), (90, 150)]
            for cx, cy in damaged_spots:
                dist = math.hypot(x - cx, y - cy)
                if dist < 14:  # Decayed brown/black rotted kernel
                    return (120, 55, 35)
                elif dist < 22:  # Discolored margin
                    return (160, 110, 50)
            # Golden yellow maize kernels
            # R=210, G=165, B=120 gives exg = 2*165 - 210 - 120 = 0 <= 15
            # low green, high yellow ratio, plant presence > 0.15
            r_val = int(210 + 15 * math.sin(x / 4.0))
            g_val = int(165 + 10 * math.cos(y / 4.0))
            b_val = int(120 + 8 * math.sin((x + y) / 6.0))
            return (r_val, g_val, b_val)

        cls.img_maize_ear = create_b64_image(200, 200, maize_ear_pixels)


    def setUp(self):
        self.client = APIClient()
        self.doctor = PlantDiseaseVisionDoctor()

    def test_eight_sections_present_in_diagnosis(self):
        """Verify that all 8 required sections are returned with expected fields."""
        result = self.doctor.analyze_crop_image(
            image_base64=self.img_healthy_closeup,
            crop_hint="tomato",
            region="Mandya",
            language="kn"
        )
        self.assertEqual(result.get("status"), "success")

        # 1. Disease Identification
        self.assertIn("disease_identification", result)
        ident = result["disease_identification"]
        self.assertIn("disease_name_kn", ident)
        self.assertIn("disease_name_en", ident)
        self.assertIn("scientific_name", ident)
        self.assertIn("crop_identified", ident)
        self.assertIn("affected_plant_part", ident)
        self.assertIn("confidence_level", ident)
        self.assertIn("confidence_score", ident)

        # 2. What is happening?
        self.assertIn("what_is_happening", result)
        what = result["what_is_happening"]
        self.assertIn("summary_kn", what)
        self.assertIn("summary_en", what)

        # 3. Symptoms
        self.assertIn("symptoms", result)
        sym = result["symptoms"]
        self.assertIn("visible_symptoms_kn", sym)
        self.assertIn("other_parts_to_check_kn", sym)

        # 4. Possible Causes
        self.assertIn("possible_causes", result)
        causes = result["possible_causes"]
        self.assertIn("pathogen_type", causes)
        self.assertIn("favorable_conditions_kn", causes)

        # 5. Treatment and Management
        self.assertIn("treatment_and_management", result)
        mgmt = result["treatment_and_management"]
        self.assertIn("organic_solution_kn", mgmt)
        self.assertIn("chemical_treatment_kn", mgmt)
        self.assertIn("safety_disclaimer_kn", mgmt)

        # 6. Prevention
        self.assertIn("prevention", result)
        prev = result["prevention"]
        self.assertIn("measures_kn", prev)

        # 7. When to seek expert help
        self.assertIn("when_to_seek_expert_help", result)
        help_sec = result["when_to_seek_expert_help"]
        self.assertIn("triggers_kn", help_sec)
        self.assertIn("helpline_kn", help_sec)
        self.assertIn("08232-277456", help_sec["helpline_kn"])

        # 8. Source and Reliability
        self.assertIn("source_and_reliability", result)
        src = result["source_and_reliability"]
        self.assertIn("official_sources", src)
        self.assertTrue(len(src["official_sources"]) > 0)
        self.assertIn("uncertainty_warning_kn", src)

    def test_case_1_healthy_close_up_does_not_invent_disease(self):
        """Test A1: Healthy close-up foliage must be classified as APPARENTLY_HEALTHY without pesticides."""
        result = self.doctor.analyze_crop_image(
            image_base64=self.img_healthy_closeup,
            crop_hint="tomato",
            region="Mandya",
            language="kn"
        )
        self.assertEqual(result["category"], CATEGORY_APPARENTLY_HEALTHY)
        self.assertTrue(result["is_healthy"])
        self.assertFalse(result["treatment_and_management"]["treatment_needed"])
        self.assertIn("ಯಾವುದೇ ರಾಸಾಯನಿಕ ಸಿಂಪಡಿಸಬೇಡಿ", result["treatment_and_management"]["chemical_treatment_kn"])

    def test_case_2_wide_field_photo_limitations(self):
        """Test A2: Wide field landscape must not hallucinate leaf spot disease and must state limitations."""
        result = self.doctor.analyze_crop_image(
            image_base64=self.img_healthy_widefield,
            crop_hint="tomato",
            region="Mandya",
            language="kn"
        )
        self.assertEqual(result["category"], CATEGORY_APPARENTLY_HEALTHY)
        self.assertTrue(result["is_healthy"])
        # Must mention wide angle view limitation
        obs = result["visual_observations"]["summary_kn"]
        self.assertTrue("ವಿಶಾಲ ಕೋನದ" in obs or "wide-angle" in result["visual_observations"]["summary_en"].lower())
        self.assertIn("ಯಾವುದೇ ರಾಸಾಯನಿಕ ಸಿಂಪಡಿಸಬೇಡಿ", result["treatment_and_management"]["chemical_treatment_kn"])

    def test_case_3_confirmed_disease_diagnosis(self):
        """Test B1: Leaf with necrotic spots and halo must diagnose disease with grounded PoP."""
        result = self.doctor.analyze_crop_image(
            image_base64=self.img_diseased_leaf,
            crop_hint="tomato",
            region="Mandya",
            language="kn"
        )
        self.assertEqual(result["category"], CATEGORY_POSSIBLE_DISEASE)
        self.assertFalse(result["is_healthy"])
        self.assertTrue(result["treatment_and_management"]["treatment_needed"])
        self.assertIn("ಮ್ಯಾಂಕೋಜೆಬ್", result["treatment_and_management"]["chemical_treatment_kn"])

    def test_case_3_paddy_blast_diagnosis(self):
        """Test B2: Paddy leaf with disease lesions provides UAS Bengaluru Tricyclazole advisory."""
        result = self.doctor.analyze_crop_image(
            image_base64=self.img_diseased_leaf,
            crop_hint="paddy",
            region="Mandya",
            language="kn"
        )
        self.assertEqual(result["category"], CATEGORY_POSSIBLE_DISEASE)
        self.assertIn("ಭತ್ತದ ಬೆಂಕಿ ರೋಗ", result["disease_identification"]["disease_name_kn"])
        self.assertIn("Tricyclazole", result["treatment_and_management"]["chemical_treatment_en"])
        self.assertIn("Trichoderma", result["treatment_and_management"]["organic_solution_en"])

    def test_case_c_maize_ear_kernel_damage_not_paddy_blast(self):
        """
        Regression Test C: Upload of maize ear with damaged kernels (even with accidental crop_hint='paddy')
        must strictly NOT diagnose Paddy Leaf Blast / Neck Blast and must NOT prescribe Tricyclazole.
        """
        result = self.doctor.analyze_crop_image(
            image_base64=self.img_maize_ear,
            crop_hint="paddy",  # Simulating accidental/prior default leak
            region="Mandya",
            language="kn"
        )
        self.assertEqual(result.get("status"), "success")
        ident = result["disease_identification"]
        mgmt = result["treatment_and_management"]

        # Crop validation: must identify Maize / Corn, not Paddy
        self.assertIn("Maize", ident["crop_identified"])
        self.assertIn("Ear", ident["affected_plant_part"])

        # Pathogen-Crop biological incompatibility check:
        # Must NEVER diagnose Rice Blast (Pyricularia oryzae) on a maize ear!
        self.assertNotIn("blast", ident["disease_name_en"].lower())
        self.assertNotIn("ಬೆಂಕಿ ರೋಗ", ident["disease_name_kn"])
        self.assertNotIn("pyricularia", ident.get("scientific_name", "").lower())

        # Chemical safety: Tricyclazole 75% WP is strictly forbidden on maize/cobs
        self.assertNotIn("tricyclazole", mgmt.get("chemical_treatment_en", "").lower())
        self.assertNotIn("ಟ್ರೈಸೈಕ್ಲಾಜೋಲ್", mgmt.get("chemical_treatment_kn", ""))

        # Confidence reporting: Calibrated qualitative rating, not uncalibrated 96.2%
        self.assertNotEqual(ident["confidence_score"], 0.962)
        self.assertNotEqual(ident["confidence_level"], "96.2%")
        self.assertTrue(
            "MODERATE" in ident["confidence_level"] or "HIGH" in ident["confidence_level"]
        )

        # Grain/Cob specific treatment advice: drying/sorting, never spray mature edible cobs
        self.assertTrue(
            "ಒಣಗಿಸಿ" in mgmt["organic_solution_kn"] or "drying" in mgmt["organic_solution_en"].lower()
        )

    def test_case_c_api_endpoint_maize_ear_blocks_paddy_leakage(self):
        """Regression Test C (API level): POST /api/assistant/diagnose/ with maize ear and crop='paddy'."""
        response = self.client.post(
            "/api/assistant/diagnose/",
            {
                "image": self.img_maize_ear,
                "crop": "paddy",
                "region": "Mandya",
                "language": "kn"
            },
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        ident = data["disease_identification"]
        mgmt = data["treatment_and_management"]

        self.assertIn("Maize", ident["crop_identified"])
        self.assertNotIn("blast", ident["disease_name_en"].lower())
        self.assertNotIn("tricyclazole", mgmt.get("chemical_treatment_en", "").lower())


    def test_case_4_nutrient_deficiency_forbids_pesticides(self):
        """Test B3: Chlorotic yellow leaves without necrosis must diagnose nutrient deficiency and ban pesticides."""
        result = self.doctor.analyze_crop_image(
            image_base64=self.img_nutrient_deficiency,
            crop_hint="tomato",
            region="Mandya",
            language="kn"
        )
        self.assertEqual(result["category"], CATEGORY_NUTRIENT_OR_STRESS)
        self.assertFalse(result["is_healthy"])
        chem_kn = result["treatment_and_management"]["chemical_treatment_kn"]
        self.assertIn("ಕೀಟನಾಶಕ ಅಥವಾ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸಬೇಡಿ", chem_kn)
        self.assertIn("19:19:19", chem_kn)

    def test_case_5_blurry_image_requests_closeup(self):
        """Test B4: Blurry/ambiguous photo returns INCONCLUSIVE without chemical treatment."""
        result = self.doctor.analyze_crop_image(
            image_base64=self.img_blurry_leaf,
            crop_hint="tomato",
            region="Mandya",
            language="kn"
        )
        self.assertEqual(result["category"], CATEGORY_INCONCLUSIVE)
        self.assertFalse(result["treatment_and_management"]["treatment_needed"])
        self.assertIn("ಯಾವುದೇ ರಾಸಾಯನಿಕ ಸಿಂಪಡಿಸಬೇಡಿ", result["treatment_and_management"]["chemical_treatment_kn"])
        self.assertTrue(result["recommended_next_steps"]["request_closeup"])

    def test_case_6_non_plant_handling(self):
        """Test B5: Non-plant image detected and handled safely."""
        result = self.doctor.analyze_crop_image(
            image_base64=self.img_non_plant,
            crop_hint="tomato",
            region="Mandya",
            language="kn"
        )
        self.assertEqual(result["category"], CATEGORY_NON_PLANT)
        self.assertFalse(result["is_plant"])
        self.assertIn("ಸಸ್ಯ ಅಥವಾ ಬೆಳೆಯ ಚಿತ್ರವಲ್ಲ", result["disease_identification"]["disease_name_kn"])

    def test_case_7_unsupported_crop_flagging(self):
        """Test B6: Unsupported crop like olive flagged as is_supported=False with expert referral."""
        result = self.doctor.analyze_crop_image(
            image_base64=self.img_healthy_closeup,
            crop_hint="olive",
            region="Mandya",
            language="kn"
        )
        self.assertFalse(result["crop_identification"]["is_supported"])
        self.assertIn("ಪಟ್ಟಿಯ ಹೊರಗಿದೆ", result["uncertainty_or_limitations"]["limitations_kn"])

    def test_benchmark_metrics_calculation(self):
        """
        Benchmark accuracy on the required test set:
        - False-Positive Rate on healthy images: target 0%
        - Recall on confirmed disease cases: target 100%
        - Inconclusive proportion on blurry images: target 100%
        """
        # Test 1 & 2: Healthy Close-up and Healthy Wide-Field
        r_healthy1 = self.doctor.analyze_crop_image(self.img_healthy_closeup, crop_hint="tomato")
        r_healthy2 = self.doctor.analyze_crop_image(self.img_healthy_widefield, crop_hint="tomato")

        healthy_results = [r_healthy1, r_healthy2]
        false_positives = sum(
            1 for r in healthy_results
            if r["category"] in [CATEGORY_POSSIBLE_DISEASE, CATEGORY_POSSIBLE_PEST]
        )
        fpr = false_positives / len(healthy_results)

        # Test 3: Confirmed Disease
        r_disease = self.doctor.analyze_crop_image(self.img_diseased_leaf, crop_hint="tomato")
        disease_results = [r_disease]
        true_positives = sum(
            1 for r in disease_results
            if r["category"] == CATEGORY_POSSIBLE_DISEASE
        )
        recall = true_positives / len(disease_results)

        # Test 4: Blurry Image
        r_blurry = self.doctor.analyze_crop_image(self.img_blurry_leaf, crop_hint="tomato")
        inconclusive_flag = 1 if r_blurry["category"] == CATEGORY_INCONCLUSIVE else 0

        # Assertions
        self.assertEqual(fpr, 0.0, f"False-Positive Rate must be 0%, got {fpr * 100}%")
        self.assertEqual(recall, 1.0, f"Disease Recall must be 100%, got {recall * 100}%")
        self.assertEqual(inconclusive_flag, 1, "Blurry image must be categorized as INCONCLUSIVE")

    def test_chemical_safety_precautions(self):
        """Ensure all diagnoses carry safety disclaimer and PPE requirements."""
        result = self.doctor.analyze_crop_image(
            image_base64=self.img_diseased_leaf,
            crop_hint="tomato",
            region="Mandya",
            language="kn"
        )
        disclaimer = result["treatment_and_management"]["safety_disclaimer_kn"]
        self.assertTrue("ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆ" in disclaimer or "ಮಾಸ್ಕ್" in disclaimer)

    def test_api_endpoint_with_image(self):
        """Test POST /api/assistant/diagnose/ with image payload."""
        response = self.client.post(
            "/api/assistant/diagnose/",
            {
                "image": self.img_healthy_closeup,
                "crop": "tomato",
                "region": "Mandya",
                "language": "kn"
            },
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data.get("status"), "success")
        self.assertEqual(data["category"], CATEGORY_APPARENTLY_HEALTHY)
        self.assertIn("disease_identification", data)
        self.assertIn("treatment_and_management", data)
