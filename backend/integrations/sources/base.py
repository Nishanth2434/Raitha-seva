"""
Base Source Adapter for Raitha Seva Agricultural Advisory System.
Defines common interface, rate-limiting, error recovery, and normalization protocol.
"""

import time
import hashlib
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime, date, timedelta
from django.utils import timezone

logger = logging.getLogger(__name__)

class BaseSourceAdapter(ABC):
    source_key: str = "BASE"
    source_name: str = "Base Agricultural Organization"
    access_method: str = "UNSPECIFIED"
    base_url: str = ""
    terms_url: str = ""
    rate_limit_delay: float = 1.0
    timeout: int = 10

    def __init__(self):
        self._last_request_time = 0.0

    def _respect_rate_limit(self):
        """Ensures responsible querying honoring polite bot conventions."""
        now = time.time()
        elapsed = now - self._last_request_time
        if elapsed < self.rate_limit_delay:
            time.sleep(self.rate_limit_delay - elapsed)
        self._last_request_time = time.time()

    @abstractmethod
    def fetch_advisories(self) -> List[Dict[str, Any]]:
        """
        Fetches advisories from official source using authorized access method.
        Must return list of raw advisory dictionaries.
        """
        pass

    @abstractmethod
    def health_check(self) -> Dict[str, Any]:
        """
        Checks connectivity and access permissions without heavy payloads.
        Returns health status dict.
        """
        pass

    def generate_source_id(self, unique_key: str) -> str:
        """Generates deterministic unique ID for deduplication."""
        h = hashlib.sha256(f"{self.source_key}:{unique_key}".encode("utf-8")).hexdigest()[:16]
        return f"{self.source_key.lower()}-{h}"

    def normalize_crop_name(self, raw_crop: str) -> str:
        """Normalizes crop string to standard system slug."""
        if not raw_crop:
            return "all"
        c = raw_crop.lower()
        if any(w in c for w in ["paddy", "rice", "ಭತ್ತ", "ನೆಲ್ಲು"]):
            return "paddy"
        if any(w in c for w in ["ragi", "millet", "ರಾಗಿ"]):
            return "ragi"
        if any(w in c for w in ["sugarcane", "sugar cane", "cane", "ಕಬ್ಬು"]):
            return "sugarcane"
        if any(w in c for w in ["maize", "corn", "ಮೆಕ್ಕೆಜೋಳ"]):
            return "maize"
        if any(w in c for w in ["pulses", "red gram", "tur", "pigeonpea", "ತೊಗರಿ", "ಬೇಳೆ"]):
            return "pulses"
        if any(w in c for w in ["groundnut", "peanut", "ಕಡಲೆಕಾಯಿ"]):
            return "groundnut"
        if any(w in c for w in ["cotton", "ಹತ್ತಿ"]):
            return "cotton"
        if any(w in c for w in ["tomato", "chilli", "onion", "vegetable", "ತರಕಾರಿ", "ಟೊಮೆಟೊ"]):
            return "vegetables"
        if any(w in c for w in ["coconut", "ತೆಂಗು"]):
            return "coconut"
        if any(w in c for w in ["fruit", "mango", "banana", "ಹಣ್ಣು"]):
            return "fruits"
        return "all"

    def get_crop_display(self, crop_slug: str) -> str:
        """Returns bilingual display name for crop."""
        displays = {
            "paddy": "Paddy / ಭತ್ತ",
            "ragi": "Finger Millet / ರಾಗಿ",
            "sugarcane": "Sugarcane / ಕಬ್ಬು",
            "maize": "Maize / ಮೆಕ್ಕೆಜೋಳ",
            "pulses": "Red Gram & Pulses / ತೊಗರಿ & ಬೇಳೆಕಾಳುಗಳು",
            "groundnut": "Groundnut / ಕಡಲೆಕಾಯಿ",
            "cotton": "Cotton / ಹತ್ತಿ",
            "vegetables": "Vegetables (Tomato, Chilli, Onion) / ತರಕಾರಿಗಳು",
            "coconut": "Coconut / ತೆಂಗು",
            "fruits": "Fruits / ಹಣ್ಣಿನ ಬೆಳೆಗಳು",
            "all": "All Crops / ಎಲ್ಲಾ ಬೆಳೆಗಳು",
        }
        return displays.get(crop_slug, f"{crop_slug.capitalize()} / ಬೆಳೆ")
