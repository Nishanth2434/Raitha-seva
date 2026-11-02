"""
Integration tests for Raitha Seva AI Django REST Framework API Endpoints.
"""

import os
import sys
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

class TestAssistantAPIEndpoints(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_crops_catalogue_endpoint(self):
        """Test GET /api/assistant/crops/ returns all target crops."""
        response = self.client.get('/api/assistant/crops/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertGreater(data["total_crops"], 5)
        crop_slugs = [c["slug"] for c in data["crops"]]
        self.assertIn("paddy", crop_slugs)
        self.assertIn("ragi", crop_slugs)
        self.assertIn("sugarcane", crop_slugs)

    def test_sources_manifest_endpoint(self):
        """Test GET /api/assistant/sources/ returns official verified source manifests."""
        response = self.client.get('/api/assistant/sources/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertGreater(data["total_sources"], 0)
        first_src = data["sources"][0]
        self.assertIn("source_url", first_src)
        self.assertIn("review_status", first_src)

    def test_ask_query_endpoint(self):
        """Test POST /api/assistant/ask/ provides evidence-grounded response with citations."""
        payload = {
            "query": "How to control fall armyworm in maize?",
            "language": "en",
            "region": "Mandya",
            "crop": "maize"
        }
        response = self.client.post('/api/assistant/ask/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertTrue(data["grounded"])
        self.assertGreater(len(data["citations"]), 0)
        self.assertIn("Maize", data["answer"])

    def test_ask_query_kannada_endpoint(self):
        """Test POST /api/assistant/ask/ in Kannada returns Kannada response."""
        payload = {
            "query": "ಭತ್ತದ ಬೆಂಕಿ ರೋಗ ನಿಯಂತ್ರಣ ಹೇಗೆ?",
            "language": "kn",
            "region": "Mandya"
        }
        response = self.client.post('/api/assistant/ask/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["language"], "kn")
        self.assertIn("ಬೆಂಕಿ ರೋಗ", data["answer"])

    def test_ask_query_empty_bad_request(self):
        """Test POST /api/assistant/ask/ with empty query returns 400 Bad Request."""
        response = self.client.post('/api/assistant/ask/', data={"query": ""}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_diagnose_endpoint(self):
        """Test POST /api/assistant/diagnose/ returns structured diagnostic advice."""
        payload = {
            "crop": "paddy",
            "symptoms": "yellow leaves dead heart",
            "language": "en"
        }
        response = self.client.post('/api/assistant/diagnose/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("diagnosis", data)

if __name__ == "__main__":
    import unittest
    unittest.main()
