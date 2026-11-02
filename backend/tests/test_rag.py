"""
Automated Test Suite for Raitha Seva AI RAG, ChromaDB, and Safety Verification.
"""

import sys
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

import unittest
from assistant.rag import rag_engine
from assistant.safety import check_chemical_safety, validate_agricultural_advice
from assistant.citations import format_citations
from ingestion.collect_sources import list_all_crops, OFFICIAL_SOURCES
from ingestion.chunk_documents import chunk_agricultural_document

class TestRaithaSevaRAG(unittest.TestCase):

    def test_multi_crop_catalogue(self):
        """Verify that multi-crop catalogue covers all required target crops."""
        crops = list_all_crops()
        crop_slugs = [c["slug"] for c in crops]
        required_crops = ["paddy", "ragi", "sugarcane", "maize", "pulses", "vegetables", "coconut"]
        for rc in required_crops:
            self.assertIn(rc, crop_slugs, f"Missing required crop: {rc}")

    def test_document_chunking_and_metadata(self):
        """Verify that documents are chunked with accurate metadata and hash values."""
        sample_doc = OFFICIAL_SOURCES[0]
        chunks = chunk_agricultural_document(sample_doc)
        self.assertGreater(len(chunks), 0)
        first_chunk = chunks[0]
        self.assertIn("metadata", first_chunk)
        self.assertEqual(first_chunk["metadata"]["crop"], "paddy")
        self.assertIn("source_url", first_chunk["metadata"])
        self.assertIn("content_hash", first_chunk["metadata"])

    def test_safety_banned_chemical_blocking(self):
        """Verify that banned/hazardous chemicals are blocked immediately."""
        test_case = "Farmer asks to spray monocrotophos 36% SL on vegetables"
        check = check_chemical_safety(test_case)
        self.assertFalse(check["safe"])
        self.assertEqual(check["action"], "BLOCK")
        self.assertIn("BANNED_CHEMICAL", check["violation_type"])

    def test_safety_overdose_detection(self):
        """Verify that lethal or excessive dosages (> 10 ml/L or g/L) are flagged."""
        test_case = "Mix 25 ml per liter of pesticide"
        check = check_chemical_safety(test_case)
        self.assertFalse(check["safe"])
        self.assertEqual(check["action"], "FLAG_AND_REVISE")

    def test_safety_safe_dosage_allowed(self):
        """Verify that legitimate, registered dosages are permitted."""
        test_case = "Spray Tricyclazole 75% WP @ 0.6g/liter of water"
        check = check_chemical_safety(test_case)
        self.assertTrue(check["safe"])
        self.assertEqual(check["action"], "ALLOW")

    def test_retrieval_grounding_and_citations(self):
        """Verify that a legitimate paddy blast query retrieves authentic evidence and citations."""
        res = rag_engine.generate_advisory("ಭತ್ತದ ಬೆಂಕಿ ರೋಗ ನಿಯಂತ್ರಣ ಹೇಗೆ?", preferred_lang="kn")
        self.assertTrue(res["grounded"])
        self.assertIn("citations", res)
        self.assertGreater(len(res["citations"]), 0)
        self.assertEqual(res["citations"][0]["badge"], "ICAR/UASB Verified")

    def test_missing_evidence_escalation(self):
        """Verify that queries with unverified evidence escalate to KVK Mandya."""
        res = rag_engine.generate_advisory("How to cultivate saffron in the Sahara desert?", preferred_lang="en")
        self.assertFalse(res["grounded"])
        self.assertEqual(res["safety_status"], "ESCALATED_TO_EXPERT")
        self.assertIn("Krishi Vigyan Kendra", res["answer"])

if __name__ == "__main__":
    unittest.main()
