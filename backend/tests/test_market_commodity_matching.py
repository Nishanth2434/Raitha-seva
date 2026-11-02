"""
Regression Test Suite for Market Commodity Matching & District Filtering.
Specifically verifies:
1. Maize (ಮೆಕ್ಕೆಜೋಳ) selection resolves correctly under aliases: "Maize", "Corn", "Makka", "ಮೆಕ್ಕೆಜೋಳ".
2. District + Maize intersection (Mandya, Davanagere, Hassan, Chikkaballapura).
3. All Karnataka Districts behavior for Maize.
4. District spelling normalizations (Mysuru/Mysore, Davanagere/Davangere).
5. Non-Maize commodities (Paddy, Ragi, Jaggery, Tender Coconut) remain 100% intact.
6. Honest 0-result empty states for unlisted crops (e.g. Vanilla, Saffron).
"""

import os
import sys
from decimal import Decimal
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

from django.test import TestCase
from unittest.mock import patch
from rest_framework.test import APIClient
from rest_framework import status

from api.models import MarketPrice
from integrations.market_service import MarketDataSyncService, BASELINE_AGMARKNET_RECORDS


class TestMarketCommodityMatching(TestCase):
    @patch("integrations.market_service.MarketDataSyncService._sync_to_supabase")
    def setUp(self, mock_supa):
        mock_supa.return_value = None
        self.client = APIClient()
        MarketPrice.objects.all().delete()

        service = MarketDataSyncService()
        for item in BASELINE_AGMARKNET_RECORDS:
            service._save_baseline_record(item)

    def test_maize_alias_english(self):
        """Querying ?crop=Maize returns Karnataka APMC Maize records."""
        response = self.client.get("/api/market-prices/?crop=Maize")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", [])
        self.assertGreaterEqual(len(results), 1)
        crops = [r["crop_name"] for r in results]
        self.assertTrue(all(c == "Maize" for c in crops))

    def test_maize_alias_corn(self):
        """Querying ?crop=Corn resolves to Maize APMC records."""
        response = self.client.get("/api/market-prices/?crop=Corn")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", [])
        self.assertGreaterEqual(len(results), 1)
        self.assertEqual(results[0]["crop_name"], "Maize")

    def test_maize_alias_makka(self):
        """Querying ?crop=Makka resolves to Maize APMC records."""
        response = self.client.get("/api/market-prices/?crop=Makka")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", [])
        self.assertGreaterEqual(len(results), 1)
        self.assertEqual(results[0]["crop_name"], "Maize")

    def test_maize_alias_kannada(self):
        """Querying ?crop=ಮೆಕ್ಕೆಜೋಳ resolves to Maize APMC records."""
        response = self.client.get("/api/market-prices/?crop=ಮೆಕ್ಕೆಜೋಳ")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", [])
        self.assertGreaterEqual(len(results), 1)
        self.assertEqual(results[0]["crop_name"], "Maize")

    def test_maize_mandya_intersection(self):
        """Querying ?crop=Maize&district=Mandya returns Nagamangala APMC."""
        response = self.client.get("/api/market-prices/?crop=Maize&district=Mandya")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", [])
        self.assertEqual(len(results), 1)
        record = results[0]
        self.assertEqual(record["crop_name"], "Maize")
        self.assertEqual(record["district"], "Mandya")
        self.assertEqual(record["mandi_name"], "Nagamangala")
        self.assertEqual(Decimal(str(record["modal_price"])), Decimal("2240.00"))

    def test_maize_davanagere_intersection(self):
        """Querying ?crop=Maize&district=Davanagere returns Davanagere APMC."""
        response = self.client.get("/api/market-prices/?crop=Maize&district=Davanagere")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", [])
        self.assertEqual(len(results), 1)
        record = results[0]
        self.assertEqual(record["crop_name"], "Maize")
        self.assertEqual(record["district"], "Davanagere")
        self.assertEqual(record["mandi_name"], "Davanagere")
        self.assertEqual(Decimal(str(record["modal_price"])), Decimal("2280.00"))

    def test_maize_all_districts(self):
        """Querying ?crop=Maize without district filter returns all 4 Karnataka APMC records."""
        response = self.client.get("/api/market-prices/?crop=Maize")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", [])
        self.assertEqual(len(results), 4)
        districts = {r["district"] for r in results}
        self.assertEqual(districts, {"Mandya", "Davanagere", "Hassan", "Chikkaballapura"})

    def test_district_spelling_normalization_mysuru(self):
        """Both Mysuru and Mysore return the Onion Mysuru APMC record."""
        res_mysuru = self.client.get("/api/market-prices/?district=Mysuru")
        res_mysore = self.client.get("/api/market-prices/?district=Mysore")
        self.assertEqual(res_mysuru.status_code, status.HTTP_200_OK)
        self.assertEqual(res_mysore.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_mysuru.data["results"]), len(res_mysore.data["results"]))
        self.assertGreaterEqual(len(res_mysuru.data["results"]), 1)

    def test_district_spelling_normalization_davanagere(self):
        """Both Davanagere and Davangere return the Davanagere APMC Maize record."""
        res1 = self.client.get("/api/market-prices/?district=Davanagere")
        res2 = self.client.get("/api/market-prices/?district=Davangere")
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res1.data["results"]), len(res2.data["results"]))
        self.assertGreaterEqual(len(res1.data["results"]), 1)

    def test_other_commodities_intact(self):
        """Verifies Jaggery, Paddy, Ragi, Sugarcane, Tender Coconut are intact."""
        commodities = ["Jaggery", "Paddy", "Ragi", "Sugarcane", "Tender Coconut", "Tomato", "Onion"]
        for crop in commodities:
            res = self.client.get(f"/api/market-prices/?crop={crop}")
            self.assertEqual(res.status_code, status.HTTP_200_OK, f"Failed for {crop}")
            self.assertGreaterEqual(len(res.data.get("results", [])), 1, f"No results for {crop}")

    def test_tender_coconut_distinction(self):
        """Tender Coconut returns Maddur APMC with price_unit ₹/100 Nuts."""
        res = self.client.get("/api/market-prices/?crop=Tender Coconut")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get("results", [])
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["crop_name"], "Tender Coconut")
        self.assertEqual(results[0]["price_unit"], "₹/100 Nuts")

    def test_unavailable_commodity_empty_state(self):
        """Querying an unavailable crop (e.g. Saffron) returns 0 results with status 200 without error."""
        res = self.client.get("/api/market-prices/?crop=Saffron")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data.get("results", [])), 0)
        self.assertEqual(res.data.get("count", 0), 0)
