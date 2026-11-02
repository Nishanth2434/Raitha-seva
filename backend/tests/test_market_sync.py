"""
Comprehensive Unit & Integration Tests for Market Price Sync Service,
Django Management Command, and REST API Endpoints.
"""

import os
import sys
from datetime import date
from decimal import Decimal
from pathlib import Path
from unittest.mock import patch, MagicMock

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

from django.test import TestCase
from django.core.management import call_command
from rest_framework.test import APIClient
from rest_framework import status

from api.models import MarketPrice, SourceSyncLog
from integrations.market_service import MarketDataSyncService


class TestMarketDataSyncService(TestCase):
    def setUp(self):
        self.service = MarketDataSyncService()
        MarketPrice.objects.all().delete()
        SourceSyncLog.objects.all().delete()

    @patch("integrations.market_service.MarketDataSyncService._sync_to_supabase")
    def test_sync_baseline_data_populates_mandya(self, mock_supa):
        """Test syncing without data.gov.in key safely populates verified Mandya baseline."""
        mock_supa.return_value = None
        result = self.service.sync_market_prices(state="Karnataka", district="Mandya", force=True)
        self.assertIn(result["status"], ["SUCCESS", "PARTIAL"])
        self.assertGreaterEqual(result["items_synced"], 5)

        # Check Mandya records exist
        mandya_records = MarketPrice.objects.filter(district__iexact="Mandya")
        self.assertTrue(mandya_records.exists())

        # Check Jaggery specifically
        jaggery = MarketPrice.objects.filter(crop_name="Jaggery", mandi_name="Mandya").first()
        self.assertIsNotNone(jaggery)
        self.assertIn("ಬೆಲ್ಲ", jaggery.crop_name_kn)
        self.assertGreater(jaggery.modal_price, Decimal("3500.00"))
        self.assertEqual(jaggery.price_unit, "₹/Quintal")
        self.assertIn(jaggery.recommendation, ["HOLD", "SELL NOW", "WATCH"])

        # Check Tender Coconut in Maddur APMC
        coconut = MarketPrice.objects.filter(crop_name="Tender Coconut", mandi_name="Maddur").first()
        self.assertIsNotNone(coconut)
        self.assertEqual(coconut.price_unit, "₹/100 Nuts")

    @patch("integrations.market_service.MarketDataSyncService._sync_to_supabase")
    def test_duplicate_prevention_on_repeated_sync(self, mock_supa):
        """Strict duplicate prevention: running sync multiple times must NOT duplicate records."""
        mock_supa.return_value = None
        # First sync
        res1 = self.service.sync_market_prices(state="Karnataka", district="Mandya", force=True)
        count_first = MarketPrice.objects.count()
        self.assertGreater(count_first, 0)
        self.assertGreater(res1["items_new"], 0)

        # Second sync on the same date/district
        res2 = self.service.sync_market_prices(state="Karnataka", district="Mandya", force=True)
        count_second = MarketPrice.objects.count()

        # Record count in DB must remain identical
        self.assertEqual(count_first, count_second)
        # res2 items_new must be 0 because 0 new records were added
        self.assertEqual(res2["items_new"], 0)
        self.assertEqual(res2["items_synced"], count_first)

    @patch("integrations.market_service.MarketDataSyncService._sync_to_supabase")
    def test_sync_creates_source_sync_log(self, mock_supa):
        """Test that sync operations record audit log in SourceSyncLog."""
        mock_supa.return_value = None
        self.service.sync_market_prices(state="Karnataka", district="Mandya")
        log = SourceSyncLog.objects.filter(source_org="AGMARKNET").order_by("-last_sync").first()
        self.assertIsNotNone(log)
        self.assertIn(log.status, ["SUCCESS", "PARTIAL"])
        self.assertGreater(log.items_synced, 0)

    @patch("integrations.market_service.MarketDataSyncService._sync_to_supabase")
    @patch("integrations.market_service.urllib.request.urlopen")
    def test_mock_api_data_gov_in_parsing(self, mock_urlopen, mock_supa):
        """Test parsing of live JSON response format from data.gov.in API."""
        mock_supa.return_value = None
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.__enter__.return_value = mock_response
        mock_response.read.return_value = b'''{
            "records": [
                {
                    "state": "Karnataka",
                    "district": "Mandya",
                    "market": "Mandya",
                    "commodity": "Paddy(Dhan)(Common)",
                    "variety": "Jyothi",
                    "grade": "FAQ",
                    "arrival_date": "02/11/2026",
                    "min_price": "2300",
                    "max_price": "2480",
                    "modal_price": "2410"
                }
            ]
        }'''
        mock_urlopen.return_value = mock_response

        service = MarketDataSyncService(api_key="test-api-key")
        result = service.sync_market_prices(state="Karnataka", district="Mandya", force=True)

        self.assertEqual(result["status"], "SUCCESS")
        record = MarketPrice.objects.filter(
            crop_name="Paddy(Dhan)(Common)",
            mandi_name="Mandya",
            market_report_date="2026-11-02"
        ).first()

        self.assertIsNotNone(record)
        self.assertEqual(record.modal_price, Decimal("2410.00"))
        self.assertEqual(record.min_price, Decimal("2300.00"))
        self.assertEqual(record.max_price, Decimal("2480.00"))
        self.assertEqual(record.variety, "Jyothi")


class TestFetchMarketPricesManagementCommand(TestCase):
    def setUp(self):
        MarketPrice.objects.all().delete()

    @patch("integrations.market_service.MarketDataSyncService._sync_to_supabase")
    def test_management_command_execution(self, mock_supa):
        """Test invoking python manage.py fetch_market_prices."""
        mock_supa.return_value = None
        call_command("fetch_market_prices", state="Karnataka", district="Mandya", force=True)
        self.assertGreater(MarketPrice.objects.count(), 0)

        # Re-running without force should execute cleanly without crashing
        call_command("fetch_market_prices", state="Karnataka", district="Mandya")
        self.assertGreater(MarketPrice.objects.count(), 0)


class TestMarketPriceAPIEndpoints(TestCase):
    def setUp(self):
        self.client = APIClient()
        MarketPrice.objects.all().delete()
        with patch("integrations.market_service.MarketDataSyncService._sync_to_supabase"):
            service = MarketDataSyncService()
            service.sync_market_prices(state="Karnataka", district="Mandya")

    def test_list_market_prices_default(self):
        """GET /api/market-prices/ returns items and metadata."""
        response = self.client.get("/api/market-prices/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn("results", data)
        self.assertIn("metadata", data)
        self.assertGreater(len(data["results"]), 0)

        first_item = data["results"][0]
        self.assertIn("crop_name", first_item)
        self.assertIn("modal_price", first_item)
        self.assertIn("market_report_date", first_item)
        self.assertIn("recommendation", first_item)

    def test_filter_by_district(self):
        """GET /api/market-prices/?district=Mandya filters records to Mandya."""
        response = self.client.get("/api/market-prices/?district=Mandya")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        for item in data["results"]:
            self.assertEqual(item["district"].lower(), "mandya")

    def test_filter_by_crop_english_and_kannada(self):
        """Test searching by both English name and Kannada name."""
        # English
        res_en = self.client.get("/api/market-prices/?crop=Jaggery")
        self.assertEqual(res_en.status_code, status.HTTP_200_OK)
        data_en = res_en.json()
        self.assertTrue(any(i["crop_name"] == "Jaggery" for i in data_en["results"]))

        # Kannada
        res_kn = self.client.get("/api/market-prices/?crop=ಬೆಲ್ಲ")
        self.assertEqual(res_kn.status_code, status.HTTP_200_OK)
        data_kn = res_kn.json()
        self.assertTrue(any("ಬೆಲ್ಲ" in i.get("crop_name_kn", "") for i in data_kn["results"]))

    def test_market_status_endpoint(self):
        """GET /api/market-prices/status/ returns health and diagnostic information."""
        response = self.client.get("/api/market-prices/status/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["service"], "AGMARKNET Market Data Sync Service")
        self.assertGreater(data["total_records"], 0)
        self.assertIn("Mandya", data["districts"])

    @patch("integrations.market_service.MarketDataSyncService._sync_to_supabase")
    def test_manual_sync_endpoint(self, mock_supa):
        """POST /api/market-prices/sync/ triggers on-demand sync."""
        mock_supa.return_value = None
        response = self.client.post("/api/market-prices/sync/", {"district": "Mandya", "force": True}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn(data["status"], ["SUCCESS", "PARTIAL"])
