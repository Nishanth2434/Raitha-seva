"""
Automated Test Suite for KrishiMitra Trilingual AI Assistant:
Language persistence, strict locale enforcement (Kannada, Hindi, English),
speech compatibility, safety disclaimers, citations, and consecutive query handling.
"""

import sys
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

import unittest
from assistant.prompts import (
    get_system_prompt,
    build_rag_user_prompt,
    KANNADA_SYSTEM_PROMPT,
    HINDI_SYSTEM_PROMPT,
    ENGLISH_SYSTEM_PROMPT,
)
from assistant.safety import (
    check_chemical_safety,
    get_safety_disclaimer,
    BANNED_OR_RESTRICTED_CHEMICALS,
)
from assistant.citations import render_citations_markdown
from assistant.rag import rag_engine


class TestMultilingualAssistant(unittest.TestCase):

    def test_detect_language_authoritative_precedence(self):
        """User's selected language must take absolute precedence over script detection."""
        # User selected Kannada, but typed English words / transliteration
        self.assertEqual(rag_engine.detect_language("blast in paddy", preferred="kn"), "kn")
        self.assertEqual(rag_engine.detect_language("tell me about urea dose", preferred="kn"), "kn")
        self.assertEqual(rag_engine.detect_language("bhattadalli benki roga", preferred="kn"), "kn")

        # User selected Hindi, but typed English words / transliteration
        self.assertEqual(rag_engine.detect_language("paddy leaf blast remedy", preferred="hi"), "hi")
        self.assertEqual(rag_engine.detect_language("dhan me kida laga hai", preferred="hi"), "hi")
        self.assertEqual(rag_engine.detect_language("urea dose in maize", preferred="hi"), "hi")

        # User selected English, typed Kannada script or English
        self.assertEqual(rag_engine.detect_language("ಭತ್ತದ ಬೆಂಕಿ ರೋಗ", preferred="en"), "en")
        self.assertEqual(rag_engine.detect_language("How to treat blast in paddy?", preferred="en"), "en")

    def test_system_prompts_configured_with_strict_rules(self):
        """Verify that prompts for all 3 languages enforce strict language output."""
        kn_prompt = get_system_prompt("kn")
        self.assertIn("ಕನ್ನಡ", kn_prompt)
        self.assertIn("NEVER switch to English", kn_prompt)

        hi_prompt = get_system_prompt("hi")
        self.assertIn("हिंदी", hi_prompt)
        self.assertIn("NEVER switch to English", hi_prompt)

        en_prompt = get_system_prompt("en")
        self.assertIn("English", en_prompt)

    def test_build_rag_user_prompt_includes_language_directive(self):
        """Prompt wrapper must explicitly instruct LLM on target language."""
        kn_user_prompt = build_rag_user_prompt("What is blast?", "context text", language="kn")
        self.assertIn("strictly in KANNADA script", kn_user_prompt)

        hi_user_prompt = build_rag_user_prompt("What is blast?", "context text", language="hi")
        self.assertIn("strictly in HINDI script", hi_user_prompt)

        en_user_prompt = build_rag_user_prompt("What is blast?", "context text", language="en")
        self.assertIn("in clear ENGLISH", en_user_prompt)

    def test_safety_disclaimers_trilingual(self):
        """Safety disclaimers must be accurately localized for kn, hi, en."""
        kn_disc = get_safety_disclaimer("kn")
        self.assertIn("ಕೃಷಿ ಸಲಹಾ ಮುನ್ನೆಚ್ಚರಿಕೆ", kn_disc)
        self.assertIn("1800-180-1551", kn_disc)

        hi_disc = get_safety_disclaimer("hi")
        self.assertIn("कृषि परामर्श वैधानिक सूचना", hi_disc)
        self.assertIn("1800-180-1551", hi_disc)

        en_disc = get_safety_disclaimer("en")
        self.assertIn("Agricultural Advisory Disclaimer", en_disc)
        self.assertIn("1800-180-1551", en_disc)

    def test_banned_chemical_blocking_trilingual(self):
        """Banned chemicals must return localized warnings matching requested language."""
        banned_query = "Farmer wants to spray monocrotophos 36% SL on crops"

        kn_check = check_chemical_safety(banned_query, language="kn")
        self.assertFalse(kn_check["safe"])
        self.assertIn("ನಿಷೇಧಿಸಲಾಗಿದೆ", kn_check["warning_message"])

        hi_check = check_chemical_safety(banned_query, language="hi")
        self.assertFalse(hi_check["safe"])
        self.assertIn("प्रतिबंधित", hi_check["warning_message"])

        en_check = check_chemical_safety(banned_query, language="en")
        self.assertFalse(en_check["safe"])
        self.assertIn("banned", en_check["warning_message"].lower())

    def test_citations_markdown_trilingual(self):
        """Citations markdown heading must match requested language."""
        sample_citations = [
            {
                "title": "ICAR UASB Package of Practices",
                "source": "University of Agricultural Sciences, Bengaluru (UASB)",
                "url": "https://www.uasbangalore.edu.in",
                "publication_date": "2024",
                "region": "Mandya",
            }
        ]

        kn_md = render_citations_markdown(sample_citations, language="kn")
        self.assertIn("ಅಧಿಕೃತ ಆಧಾರ ಮತ್ತು ಉಲ್ಲೇಖಗಳು", kn_md)
        self.assertIn("ಅಧಿಕೃತ ಮಾಹಿತಿ ಲಿಂಕ್", kn_md)

        hi_md = render_citations_markdown(sample_citations, language="hi")
        self.assertIn("सत्यापित आधिकारिक स्रोत एवं संदर्भ", hi_md)
        self.assertIn("आधिकारिक दस्तावेज़ लिंक", hi_md)

        en_md = render_citations_markdown(sample_citations, language="en")
        self.assertIn("Verified Scientific Citations", en_md)
        self.assertIn("Official Document Link", en_md)

    def test_kannada_consecutive_queries_remain_in_kannada(self):
        """5 consecutive queries with preferred_lang='kn' must all return Kannada responses."""
        kannada_test_queries = [
            "ಭತ್ತದಲ್ಲಿ ಕಂದು ಜಿಗಿಹುಳು ಬಾಧೆಗೆ ಪರಿಹಾರವೇನು?",
            "ರಾಗಿಯಲ್ಲಿ blast ರೋಗಕ್ಕೆ ಯಾವ ಔಷಧಿ ಸಿಂಪಡಿಸಬೇಕು?",
            "ಕಬ್ಬಿನಲ್ಲಿ shoot borer ನಿರ್ವಹಣೆ ಹೇಗೆ?",
            "ಯೂರಿಯಾ ಮತ್ತು ಡಿಎಪಿ ಗೊಬ್ಬರ ಪ್ರಮಾಣ ತಿಳಿಸಿ",
            "ಟೊಮ್ಯಾಟೊ ಎಲೆ ಮುದುರು ರೋಗಕ್ಕೆ ಮದ್ದು ಏನು?",
        ]

        for idx, q in enumerate(kannada_test_queries, 1):
            res = rag_engine.generate_advisory(q, preferred_lang="kn")
            self.assertEqual(res["language"], "kn", f"Query {idx} failed language tag check")
            # Verify text contains Kannada characters
            has_kannada = any("\u0C80" <= ch <= "\u0CFF" for ch in res["answer"])
            self.assertTrue(has_kannada, f"Query {idx} did not return Kannada characters in answer")
            # Ensure no English fallback flip
            self.assertTrue("ಮುನ್ನೆಚ್ಚರಿಕೆ" in res["answer"] or "ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ" in res["answer"], f"Query {idx} missing Kannada advisory content")

    def test_hindi_consecutive_queries_remain_in_hindi(self):
        """5 consecutive queries with preferred_lang='hi' must all return Hindi responses."""
        hindi_test_queries = [
            "धान में भूरा फुदका कीट की रोकथाम कैसे करें?",
            "रागी में blast रोग के लिए कौन सी दवा स्प्रे करें?",
            "गन्ने में तना छेदक कीट का इलाज बताएं",
            "यूरिया और डीएपी खाद का सही अनुपात क्या है?",
            "टमाटर में पत्ती मरोड़ रोग का उपचार क्या है?",
        ]

        for idx, q in enumerate(hindi_test_queries, 1):
            res = rag_engine.generate_advisory(q, preferred_lang="hi")
            self.assertEqual(res["language"], "hi", f"Query {idx} failed language tag check")
            # Verify text contains Devanagari characters
            has_hindi = any("\u0900" <= ch <= "\u097F" for ch in res["answer"])
            self.assertTrue(has_hindi, f"Query {idx} did not return Devanagari characters in answer")
            # Ensure no English fallback flip
            self.assertTrue("सावधानी" in res["answer"] or "कृषि विज्ञान केंद्र" in res["answer"], f"Query {idx} missing Hindi advisory content")

    def test_escalation_messages_are_localized(self):
        """Out of scope or ungrounded queries escalate in the farmer's selected language."""
        alien_query = "How to grow hydroponic tulips in space on Mars?"

        kn_res = rag_engine.generate_advisory(alien_query, preferred_lang="kn")
        self.assertEqual(kn_res["language"], "kn")
        self.assertIn("ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ", kn_res["answer"])

        hi_res = rag_engine.generate_advisory(alien_query, preferred_lang="hi")
        self.assertEqual(hi_res["language"], "hi")
        self.assertIn("कृषि विज्ञान केंद्र", hi_res["answer"])

        en_res = rag_engine.generate_advisory(alien_query, preferred_lang="en")
        self.assertEqual(en_res["language"], "en")
        self.assertIn("Krishi Vigyan Kendra", en_res["answer"])


if __name__ == "__main__":
    unittest.main()
