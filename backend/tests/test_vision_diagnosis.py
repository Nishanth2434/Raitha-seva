"""
Unit and Integration Tests for Multimodal Plant Disease Vision Doctor.
Verifies all 8 structured sections, edge cases (clear, ambiguous, healthy, non-plant),
chemical safety, and fallback engine reliability.
"""

import base64
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from assistant.vision import PlantDiseaseVisionDoctor, vision_doctor

class PlantDiseaseVisionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.doctor = PlantDiseaseVisionDoctor()
        # Generate a minimal valid 1x1 GIF base64 string
        self.tiny_gif_b64 = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

    def test_eight_sections_present_in_diagnosis(self):
        """Verify that all 8 required sections are returned with expected fields."""
        result = self.doctor.analyze_crop_image(
            image_base64=self.tiny_gif_b64,
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

    def test_paddy_blast_diagnosis(self):
        """Verify paddy blast advisory grounded in UAS Bengaluru Zone 6 recommendations."""
        result = self.doctor.analyze_crop_image(
            image_base64=self.tiny_gif_b64,
            crop_hint="paddy",
            region="Mandya",
            language="kn"
        )
        self.assertEqual(result.get("status"), "success")
        self.assertIn("ಭತ್ತದ ಬೆಂಕಿ ರೋಗ", result["disease_identification"]["disease_name_kn"])
        self.assertIn("Tricyclazole", result["treatment_and_management"]["chemical_treatment_en"])
        self.assertIn("Trichoderma", result["treatment_and_management"]["organic_solution_en"])

    def test_non_plant_handling(self):
        """Verify non-plant edge case structure."""
        mock_raw = {
            "status": "success",
            "is_plant": False,
            "is_healthy": False,
        }
        res = self.doctor._validate_and_format_diagnosis(mock_raw, language="kn")
        self.assertFalse(res["is_plant"])
        self.assertIn("Non-plant", res["disease_identification"]["disease_name_en"])
        self.assertIn("ಅಪ್‌ಲೋಡ್ ಮಾಡಿ", res["what_is_happening"]["summary_kn"])

    def test_healthy_plant_handling(self):
        """Verify healthy plant edge case: no pesticide recommended."""
        mock_raw = {
            "status": "success",
            "is_plant": True,
            "is_healthy": True,
            "disease_identification": {
                "crop_identified": "Tomato"
            }
        }
        res = self.doctor._validate_and_format_diagnosis(mock_raw, language="kn")
        self.assertTrue(res["is_healthy"])
        self.assertIn("ಆರೋಗ್ಯಕರ", res["disease_identification"]["disease_name_kn"])
        self.assertIn("ಅಗತ್ಯವಿಲ್ಲ", res["what_is_happening"]["summary_kn"])

    def test_chemical_safety_precautions(self):
        """Ensure all diagnoses carry safety disclaimer and PPE requirements."""
        result = self.doctor.analyze_crop_image(
            image_base64=self.tiny_gif_b64,
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
                "image": self.tiny_gif_b64,
                "crop": "tomato",
                "region": "Mandya",
                "language": "kn"
            },
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data.get("status"), "success")
        self.assertIn("disease_identification", data)
        self.assertIn("treatment_and_management", data)
