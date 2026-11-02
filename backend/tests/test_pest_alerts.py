"""
Unit and Integration Tests for Raitha Seva Multi-Source Pest Alert System.
Tests:
- Source adapters (UASB, ICAR, Raitamitra) and error resilience
- Normalization, deduplication, and expiry filtering
- Crop and location filtering endpoints
- Source status and health reporting
- Administrative upload & ingestion
- RAG evidence retrieval and Kannada response formatting
- Security: No API key leakage in responses
"""

import os
import sys
from pathlib import Path
from datetime import date, timedelta
from unittest.mock import patch, MagicMock

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone

from api.models import OfficialPestAlert, SourceSyncLog
from integrations.sources.uasb import UASBangaloreAdapter
from integrations.sources.icar import ICARAdapter
from integrations.sources.raitamitra import RaitamitraAdapter
from integrations.pipeline import pest_pipeline
from assistant.rag import rag_engine

class TestSourceAdapters(TestCase):
    def test_uasb_adapter_structure_and_bulletins(self):
        adapter = UASBangaloreAdapter()
        self.assertEqual(adapter.source_key, "UAS_BANGALORE")
        self.assertIn("uasbangalore.edu.in", adapter.base_url)
        
        # Verify baseline authorized bulletins without requiring external network
        bulletins = adapter._get_uasb_authorized_bulletins()
        self.assertGreater(len(bulletins), 0)
        
        first = bulletins[0]
        self.assertEqual(first["source_org"], "UAS_BANGALORE")
        self.assertIn("crop", first)
        self.assertIn("pest_name", first)
        self.assertIn("source_url", first)
        self.assertIn("publication_date", first)

    def test_icar_adapter_structure_and_bulletins(self):
        adapter = ICARAdapter()
        self.assertEqual(adapter.source_key, "ICAR")
        self.assertIn("icar.org.in", adapter.base_url)

        bulletins = adapter._get_icar_authorized_bulletins()
        self.assertGreater(len(bulletins), 0)
        crops = [b["crop"] for b in bulletins]
        self.assertIn("maize", crops)
        self.assertIn("pulses", crops)

    def test_raitamitra_adapter_manual_ingestion(self):
        adapter = RaitamitraAdapter()
        self.assertEqual(adapter.source_key, "RAITAMITRA_KSDA")

        # Test admin manual ingestion workflow
        doc = adapter.ingest_manual_document(
            title="Special Groundnut Rust Circular 2026",
            description="High rust incidence reported in Pavagada taluk.",
            crop="groundnut",
            pest_name="Groundnut Rust",
            district="Tumakuru",
            source_url="https://raitamitra.karnataka.gov.in/circulars/2026-rust",
            publication_date=date.today(),
            chemical_treatment="Spray Hexaconazole 5% EC @ 2ml/L",
            organic_treatment="Apply 5% Neem oil",
            content_kn="ಕಡಲೆಕಾಯಿ ತುಕ್ಕು ರೋಗ ಸುತ್ತೋಲೆ 2026."
        )
        self.assertEqual(doc["crop"], "groundnut")
        self.assertEqual(doc["district"], "Tumakuru")
        self.assertIn("raitamitra_ksda", doc["source_id"])

    def test_adapter_graceful_network_failure(self):
        adapter = UASBangaloreAdapter()
        with patch("urllib.request.urlopen", side_effect=Exception("Connection timed out")):
            health = adapter.health_check()
            self.assertEqual(health["status"], "UNAVAILABLE")
            self.assertIn("Connection timed out", health["error"])

            # fetch_advisories must not crash when network is down
            advisories = adapter.fetch_advisories()
            self.assertGreater(len(advisories), 0)


class TestPestAlertPipeline(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Seed test data using mock network so test suite executes instantly
        with patch("urllib.request.urlopen", side_effect=Exception("Offline test mode")):
            pest_pipeline.sync_all_sources()

    def test_sync_and_deduplication(self):
        initial_count = OfficialPestAlert.objects.count()
        self.assertGreater(initial_count, 5)

        # Run sync again — should deduplicate without inflating count
        with patch("urllib.request.urlopen", side_effect=Exception("Offline test mode")):
            pest_pipeline.sync_all_sources()
        subsequent_count = OfficialPestAlert.objects.count()
        self.assertEqual(initial_count, subsequent_count)

    def test_expired_alerts_handling(self):
        past_date = date.today() - timedelta(days=120)
        expired_alert = OfficialPestAlert.objects.create(
            source_id="test-expired-alert-1",
            source_org="UAS_BANGALORE",
            title="Expired Paddy Blast Advisory 2023",
            description="Outdated blast warning from previous season",
            crop="paddy",
            crop_display="Paddy / ಭತ್ತ",
            pest_name="Leaf Blast",
            district="Mandya",
            source_url="https://www.uasbangalore.edu.in",
            publication_date=past_date,
            expires_at=past_date + timedelta(days=30),
            is_active=False,
            review_status="EXPIRED"
        )

        res = rag_engine.get_active_pest_advisories(crop="paddy", district="Mandya")
        alert_ids = [a["source_id"] for a in res["alerts"]]
        self.assertNotIn("test-expired-alert-1", alert_ids)


class TestPestAlertAPIEndpoints(TestCase):
    @classmethod
    def setUpTestData(cls):
        with patch("urllib.request.urlopen", side_effect=Exception("Offline test mode")):
            pest_pipeline.sync_all_sources()

    def setUp(self):
        self.client = APIClient()

    def test_get_all_alerts(self):
        response = self.client.get('/api/pest-alerts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertGreater(data["total_alerts"], 0)
        self.assertIn("alerts", data)

    def test_filter_by_crop(self):
        response = self.client.get('/api/pest-alerts/?crop=paddy')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        for alert in data["alerts"]:
            self.assertEqual(alert["crop"], "paddy")

    def test_filter_by_district(self):
        response = self.client.get('/api/pest-alerts/?district=Mandya')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        for alert in data["alerts"]:
            self.assertTrue(
                "Mandya" in alert["district"] or
                alert["district"] in ["All Karnataka", "Statewide"]
            )

    def test_sources_health_endpoint(self):
        response = self.client.get('/api/pest-alerts/sources/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["sources_count"], 3)
        source_keys = [s["source_key"] for s in data["sources"]]
        self.assertIn("UAS_BANGALORE", source_keys)
        self.assertIn("ICAR", source_keys)
        self.assertIn("RAITAMITRA_KSDA", source_keys)

    def test_admin_manual_upload_endpoint(self):
        payload = {
            "title": "Official Tomato Blight Directive",
            "crop": "vegetables",
            "pest_name": "Early Blight",
            "district": "Kolar",
            "source_url": "https://raitamitra.karnataka.gov.in/notifications/2026/tomato",
            "publication_date": str(date.today()),
            "symptoms": "Concentric rings on leaves",
            "chemical_treatment": "Mancozeb 75% WP @ 2g/L",
            "content_kn": "ಟೊಮೆಟೊ ಆರಂಭಿಕ ಅಂಗಮಾರಿ ರೋಗ ಅಧಿಕೃತ ಸುತ್ತೋಲೆ."
        }
        response = self.client.post('/api/pest-alerts/upload/', data=payload, format='json')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["alert"]["crop"], "vegetables")
        self.assertEqual(data["alert"]["pest_name"], "Early Blight")

    def test_security_no_api_keys_exposed(self):
        endpoints = [
            '/api/pest-alerts/',
            '/api/pest-alerts/sources/',
            '/api/assistant/crops/',
            '/api/assistant/sources/',
        ]
        for ep in endpoints:
            res = self.client.get(ep)
            body = res.content.decode("utf-8")
            self.assertNotIn("AIzaSy", body)
            self.assertNotIn("GEMINI_API_KEY", body)
            self.assertNotIn("SECRET_KEY", body)
