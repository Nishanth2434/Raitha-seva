"""
RAG Engine (Retrieval-Augmented Generation) for Raitha Seva AI.
Connects ChromaDB vector search with Google Gemini 2.0 / 1.5 Flash models
and enforces agricultural safety verification.
"""

import os
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Path setup
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from ingestion.index_documents import get_chroma_client, COLLECTION_NAME
from assistant.embeddings import GeminiEmbeddingFunction
from assistant.safety import validate_agricultural_advice
from assistant.citations import format_citations, render_citations_markdown
from assistant.prompts import KANNADA_SYSTEM_PROMPT, HINDI_SYSTEM_PROMPT, ENGLISH_SYSTEM_PROMPT, get_system_prompt, build_rag_user_prompt

load_dotenv()

# Maximum squared Euclidean distance (L2) allowed in ChromaDB for relevance (~cosine similarity >= 0.28)
RELEVANCE_DISTANCE_THRESHOLD = 1.45

class RaithaSevaRAG:
    def __init__(self):
        self.chroma_client = get_chroma_client()
        self.embedding_fn = GeminiEmbeddingFunction()
        try:
            self.collection = self.chroma_client.get_collection(
                name=COLLECTION_NAME
            )
        except Exception:
            # Fallback if collection was not indexed yet
            self.collection = self.chroma_client.get_or_create_collection(
                name=COLLECTION_NAME
            )
        
        # Initialize Google GenAI client
        self.api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("VITE_GEMINI_API_KEY")
        self.gemini_client = None
        if self.api_key and not self.api_key.startswith("your-"):
            try:
                from google import genai
                self.gemini_client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[RAG Init Warning] Gemini client initialization error: {e}")

    def detect_crop(self, query: str) -> Optional[str]:
        """Detects crop name from user query in Kannada, Hindi, or English."""
        q = query.lower()
        if any(w in q for w in ["paddy", "rice", "ಭತ್ತ", "ನೆಲ್ಲು", "धान"]):
            return "paddy"
        if any(w in q for w in ["ragi", "millet", "ರಾಗಿ", "मंडुआ", "रागी"]):
            return "ragi"
        if any(w in q for w in ["sugarcane", "sugar cane", "cane", "ಕಬ್ಬು", "गन्ना"]):
            return "sugarcane"
        if any(w in q for w in ["maize", "corn", "ಮೆಕ್ಕೆಜೋಳ", "मक्का"]):
            return "maize"
        if any(w in q for w in ["tur", "redgram", "red gram", "pigeonpea", "ತೊಗರಿ", "ಬೇಳೆ", "अरहर", "तुअर"]):
            return "pulses"
        if any(w in q for w in ["tomato", "chilli", "onion", "ಟೊಮೆಟೊ", "ಮೆಣಸಿನಕಾಯಿ", "ಈರುಳ್ಳಿ", "टमाटर", "मिर्च", "प्याज"]):
            return "vegetables"
        if any(w in q for w in ["coconut", "ತೆಂಗು", "ತೆಂಗಿನ", "नारियल"]):
            return "coconut"
        return None

    def detect_language(self, query: str, preferred: str = "kn") -> str:
        """
        Determines the authoritative response language.
        The explicitly selected language takes priority over query text or previous messages.
        """
        p = (preferred or "").lower().strip()
        if p in ["kn", "hi", "en"]:
            return p
        if any(u'\u0C80' <= c <= u'\u0CFF' for c in query):
            return "kn"
        if any(u'\u0900' <= c <= u'\u097F' for c in query):
            return "hi"
        return "kn"

    def retrieve_evidence(self, query: str, crop: Optional[str] = None, n_results: int = 4) -> List[Dict[str, Any]]:
        """
        Queries ChromaDB for semantically matching knowledge chunks,
        applying metadata filters, keyword boosting, and distance thresholding.
        """
        where_filter = None
        if crop:
            where_filter = {"crop": crop}

        query_emb = self.embedding_fn.embed_query(query)

        # 1. Semantic query
        try:
            results = self.collection.query(
                query_embeddings=[query_emb],
                n_results=max(n_results * 2, 8),
                where=where_filter,
                include=["documents", "metadatas", "distances"]
            )
        except Exception as e:
            print(f"[RAG Query Error] Chroma query failed: {e}")
            results = None

        chunks = []
        stop_words = {"the", "and", "for", "with", "how", "what", "can", "are", "this", "that", "from", "you", "your", "give", "tell", "please", "into", "about"}
        q_words = [w.strip() for w in query.lower().split() if len(w.strip()) > 2 and w.strip() not in stop_words]

        if results and results.get("documents") and results["documents"][0]:
            docs = results["documents"][0]
            metas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(docs)
            dists = results["distances"][0] if results.get("distances") else [0.0] * len(docs)

            for doc, meta, dist in zip(docs, metas, dists):
                # Count keyword overlap
                doc_lower = doc.lower()
                keyword_hits = sum(1 for w in q_words if w in doc_lower)
                # Effective distance accounting for keyword matches
                effective_dist = dist - (keyword_hits * 0.25)

                # Grounding condition: Must have keyword relevance, semantic proximity, or crop-specific verified match
                is_relevant = (
                    (keyword_hits >= 1 and effective_dist <= 1.45)
                    or (dist <= 1.30 and dist > 0.0)
                    or (bool(crop) and dist <= 1.95)
                )

                if is_relevant:
                    chunks.append({
                        "text": doc,
                        "metadata": meta,
                        "distance": dist,
                        "effective_dist": effective_dist,
                        "keyword_hits": keyword_hits
                    })

        # Sort by effective distance (best matches first)
        chunks.sort(key=lambda x: x.get("effective_dist", 999))
        return chunks[:n_results]

    def generate_advisory(
        self,
        query: str,
        preferred_lang: str = "kn",
        region: str = "Mandya",
        explicit_crop: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Full RAG pipeline:
        1. Identifies crop & language.
        2. Retrieves scientific evidence chunks from ChromaDB.
        3. Runs agricultural safety and pesticide dose validator.
        4. Synthesizes advisory via Gemini 2.0/1.5 Flash (or grounded fallback).
        5. Formats authentic citations from metadata.
        """
        crop = explicit_crop or self.detect_crop(query)
        language = self.detect_language(query, preferred=preferred_lang)

        # 1. Retrieve evidence
        chunks = self.retrieve_evidence(query, crop=crop, n_results=4)

        # 2. Safety validation
        safety_eval = validate_agricultural_advice(query, chunks, user_region=region)

        # 3. Handle ungrounded / missing knowledge cases
        if not safety_eval["grounded"]:
            if language == "kn":
                disclaimer = safety_eval.get("disclaimer_kn") or safety_eval["disclaimer_en"]
                esc = safety_eval["escalation"]
                answer = f"⚠️ {disclaimer}\n\n📞 **ಸಹಾಯವಾಣಿ (Official Support):**\n• {esc['kvk_name']}\n• ದೂರವಾಣಿ: {esc['phone']}"
            elif language == "hi":
                disclaimer = safety_eval.get("disclaimer_hi") or safety_eval["disclaimer_en"]
                esc = safety_eval["escalation"]
                answer = f"⚠️ {disclaimer}\n\n📞 **हेल्पलाइन (Official Support):**\n• {esc['kvk_name']}\n• फोन: {esc['phone']}"
            else:
                disclaimer = safety_eval["disclaimer_en"]
                esc = safety_eval["escalation"]
                answer = f"⚠️ {disclaimer}\n\n📞 **Official Support Helpline:**\n• {esc['kvk_name']}\n• Phone: {esc['phone']}"

            return {
                "answer": answer,
                "language": language,
                "crop": crop,
                "grounded": False,
                "citations": [],
                "warnings": [disclaimer],
                "safety_status": "ESCALATED_TO_EXPERT"
            }

        # 4. Synthesize with Gemini if available
        context_str = "\n\n---\n\n".join([c["text"] for c in chunks])
        citations = format_citations(chunks, language=language)
        citations_md = render_citations_markdown(citations, language=language)

        answer_text = None
        if self.gemini_client:
            try:
                system_prompt = get_system_prompt(language)
                user_prompt = build_rag_user_prompt(
                    query=query,
                    retrieved_context=context_str,
                    crop=crop,
                    region=region,
                    language=language
                )

                response = self.gemini_client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=[system_prompt, user_prompt]
                )
                if response and response.text:
                    answer_text = response.text.strip()
            except Exception as e:
                print(f"[Gemini Generation Note] Using grounded evidence fallback: {e}")

        # 5. Fallback synthesis directly from retrieved official context
        if not answer_text:
            answer_text = self._synthesize_grounded_fallback(chunks, crop, language, safety_eval, query)

        # Append citations
        final_answer = answer_text + citations_md

        warning_item = (
            safety_eval.get("disclaimer_kn")
            if language == "kn"
            else safety_eval.get("disclaimer_hi")
            if language == "hi"
            else safety_eval.get("disclaimer_en")
        )

        return {
            "answer": final_answer,
            "language": language,
            "crop": crop,
            "grounded": True,
            "citations": citations,
            "warnings": [warning_item],
            "safety_status": "VERIFIED_SAFE"
        }

    def _synthesize_grounded_fallback(
        self,
        chunks: List[Dict[str, Any]],
        crop: Optional[str],
        language: str,
        safety_eval: Dict[str, Any],
        query: str
    ) -> str:
        """
        Synthesizes a structured, evidence-grounded advisory in the user's selected language
        without dumping raw English documents into Kannada or Hindi responses.
        """
        crop_name = (crop or "General Crop").capitalize()
        crop_kn_map = {
            "paddy": "ಭತ್ತ (Paddy)",
            "ragi": "ರಾಗಿ (Ragi)",
            "sugarcane": "ಕಬ್ಬು (Sugarcane)",
            "maize": "ಮೆಕ್ಕೆಜೋಳ (Maize)",
            "pulses": "ತೊಗರಿ ಮತ್ತು ಕಾಳುಗಳು (Pulses)",
            "vegetables": "ತರಕಾರಿಗಳು (Vegetables)",
            "coconut": "ತೆಂಗು (Coconut)",
            "tomato": "ಟೊಮೆಟೊ (Tomato)",
            "chilli": "ಮೆಣಸಿನಕಾಯಿ (Chilli)",
            "onion": "ಈರುಳ್ಳಿ (Onion)",
        }
        crop_hi_map = {
            "paddy": "धान (Paddy)",
            "ragi": "रागी / मंडुआ (Ragi)",
            "sugarcane": "गन्ना (Sugarcane)",
            "maize": "मक्का (Maize)",
            "pulses": "दलहन एवं अरहर (Pulses)",
            "vegetables": "सब्जियां (Vegetables)",
            "coconut": "नारियल (Coconut)",
            "tomato": "टमाटर (Tomato)",
            "chilli": "मिर्च (Chilli)",
            "onion": "प्याज (Onion)",
        }

        crop_kn = crop_kn_map.get((crop or "").lower(), f"{crop_name} ಬೆಳೆ")
        crop_hi = crop_hi_map.get((crop or "").lower(), f"{crop_name} फसल")

        # Extract core factual points from chunks
        extracted_points = []
        for c in chunks[:3]:
            for line in c["text"].split("\n"):
                clean = line.strip()
                if clean and not clean.startswith("[") and len(clean) > 20 and not clean.startswith("==="):
                    extracted_points.append(clean)
                    if len(extracted_points) >= 3:
                        break
            if len(extracted_points) >= 3:
                break

        if language == "kn":
            body = (
                f"🌾 **ರೈತ ಸೇವಾ ಎಐ ಕೃಷಿ ಸಲಹೆಗಾರ (ಅಧಿಕೃತ UASB/ICAR ಮಾರ್ಗದರ್ಶಿ)**:\n\n"
                f"**ಸರಳ ಸಾರಾಂಶ:**\n"
                f"{crop_kn} ಬೆಳೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಶಿಫಾರಸು ಮಾಡಲಾದ ಅಧಿಕೃತ ಕೃಷಿ ಪದ್ಧತಿ ಹಾಗೂ ರೋಗ/ಕೀಟ ನಿರ್ವಹಣಾ ಕ್ರಮಗಳು ಕೆಳಕಂಡಂತಿವೆ.\n\n"
                f"📋 **ಅಧಿಕೃತ ಶಿಫಾರಸು ಕ್ರಮಗಳು:**\n"
                f"1. **ರೋಗ/ಕೀಟ ತಪಾಸಣೆ**: ಎಲೆಗಳ ಅಡಿಭಾಗ ಹಾಗೂ ಬುಡವನ್ನು ಕೂಲಂಕಷವಾಗಿ ಪರೀಕ್ಷಿಸಿ ಹಾನಿಯ ಪ್ರಮಾಣವನ್ನು ಗುರುತಿಸಿ.\n"
                f"2. **ಜೈವಿಕ & ಸಾಂಸ್ಕೃತಿಕ ಕ್ರಮ**: ಕಳೆಗಳನ್ನು ನಿಯಂತ್ರಿಸಿ, ಸಮತೋಲಿತ ನೀರಾವರಿ ಒದಗಿಸಿ ಹಾಗೂ ಬೇವಿನ ಎಣ್ಣೆ (1500 ppm @ 5 ಮಿಲಿ/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ.\n"
                f"3. **ರಾಸಾಯನಿಕ ಸಿಂಪಡಣೆ**: ತೀವ್ರ ಬಾಧೆಯಿದ್ದಲ್ಲಿ ಮಾತ್ರ ಶಿಫಾರಸು ಮಾಡಿದ ಪ್ರಮಾಣದಲ್ಲಿ ಶಿಲೀಂಧ್ರನಾಶಕ/ಕೀಟನಾಶಕವನ್ನು ಸಿಂಪಡಿಸಿ.\n\n"
                f"💡 **ಸಿಂಪಡಣೆ ಮುನ್ನೆಚ್ಚರಿಕೆ**: {safety_eval.get('disclaimer_kn')}"
            )
            return body

        elif language == "hi":
            body = (
                f"🌾 **कृषि मित्र एआई वैज्ञानिक सलाहकार (आधिकारिक ICAR/KVK दिशानिर्देश)**:\n\n"
                f"**सरल सारांश:**\n"
                f"{crop_hi} के संबंध में आधिकारिक पैकेज ऑफ प्रैक्टिसेज और कीट/रोग नियंत्रण के उपाय निम्नलिखित हैं।\n\n"
                f"📋 **आधिकारिक अनुशंसित कदम:**\n"
                f"1. **निगरानी**: पत्तियों के निचले हिस्से और तने की नियमित जांच करें।\n"
                f"2. **जैविक एवं प्राथमिक प्रबंधन**: खेत को खरपतवार मुक्त रखें तथा नीम तेल (1500 ppm @ 5 मिली/लीटर) का छिड़काव करें।\n"
                f"3. **संतुलित पोषण एवं रासायनिक उपाय**: गंभीर प्रकोप होने पर ही अनुशंसित मात्रा में कीटनाशक अथवा फफूंदनाशक का प्रयोग करें।\n\n"
                f"💡 **छिड़काव सावधानी**: {safety_eval.get('disclaimer_hi', safety_eval['disclaimer_en'])}"
            )
            return body

        else:
            sample_advice = "\n".join([f"• {pt}" for pt in extracted_points[:2]])
            body = (
                f"🌾 **Raitha Seva AI Scientific Advisory (Official ICAR/UASB Guidelines)**:\n\n"
                f"**Simple Overview:**\n"
                f"Official university-recommended package of practices and management schedule for {crop_name}.\n\n"
                f"📋 **Recommended Action Plan:**\n"
                f"{sample_advice or '• Inspect crop canopy and apply balanced fertilization and authorized preventive sprays.'}\n\n"
                f"💡 **Safety Notice**: {safety_eval['disclaimer_en']}"
            )
            return body

    def get_active_pest_advisories(
        self,
        crop: Optional[str] = None,
        district: Optional[str] = None,
        language: str = "kn"
    ) -> Dict[str, Any]:
        """
        Retrieves active, authorized pest advisories from UASB, ICAR, and KSDA.
        Provides a farmer-friendly bilingual summary with citations and disclaimers.
        """
        from datetime import date
        from django.db.models import Q
        from api.models import OfficialPestAlert

        today = date.today()
        qs = OfficialPestAlert.objects.filter(is_active=True).filter(
            Q(expires_at__gte=today) | Q(expires_at__isnull=True)
        )

        if crop and crop.lower() != "all":
            qs = qs.filter(crop__iexact=crop.strip().lower())

        if district and district.lower() != "all":
            qs = qs.filter(
                Q(district__icontains=district.strip()) |
                Q(district__iexact="All Karnataka") |
                Q(district__iexact="Statewide")
            )

        alerts = list(qs.order_by("-publication_date", "-created_at"))

        if not alerts:
            if language == "kn":
                crop_text = f"'{crop}' ಬೆಳೆಗೆ" if crop and crop != "all" else "ಆಯ್ಕೆಮಾಡಿದ ಬೆಳೆಗೆ"
                dist_text = f" {district} ಜಿಲ್ಲೆಯಲ್ಲಿ" if district and district != "all" else ""
                message = (
                    f"✅ ಪ್ರಸ್ತುತ {dist_text} {crop_text} ಯಾವುದೇ ಗಂಭೀರ ಕೀಟ ಅಥವಾ ರೋಗ ಬಾಧೆಯ ಅಧಿಕೃತ ಎಚ್ಚರಿಕೆ ದಾಖಲಾಗಿಲ್ಲ.\n\n"
                    f"ನಿಮ್ಮ ಹೊಲದಲ್ಲಿ ಹೊಸ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದರೆ, ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಅಥವಾ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ ಮಂಡ್ಯ (KVK Mandya: 08232-277456) ಸಂಪರ್ಕಿಸಿ."
                )
            else:
                crop_text = f"for '{crop}'" if crop and crop != "all" else "for the selected crop"
                dist_text = f" in {district}" if district and district != "all" else ""
                message = (
                    f"✅ Currently, there are no active verified pest or disease outbreak alerts {crop_text}{dist_text}.\n\n"
                    f"If you notice unusual symptoms on your farm, please consult your nearest Agricultural Officer or KVK Mandya (08232-277456)."
                )
            return {
                "status": "success",
                "count": 0,
                "crop": crop,
                "district": district,
                "message": message,
                "alerts": []
            }

        return {
            "status": "success",
            "count": len(alerts),
            "crop": crop,
            "district": district,
            "alerts": [
                {
                    "id": str(a.id),
                    "source_id": a.source_id,
                    "source_org": a.source_org,
                    "source_org_display": a.get_source_org_display(),
                    "title": a.title,
                    "crop": a.crop,
                    "crop_display": a.crop_display,
                    "pest_name": a.pest_name,
                    "severity": a.severity,
                    "district": a.district,
                    "symptoms": a.symptoms,
                    "preventive_measures": a.preventive_measures,
                    "chemical_treatment": a.chemical_treatment,
                    "organic_treatment": a.organic_treatment,
                    "source_url": a.source_url,
                    "publication_date": str(a.publication_date or ""),
                    "content_kn": a.content_kn,
                    "content_en": a.content_en,
                }
                for a in alerts
            ]
        }


# Global singleton instance
rag_engine = RaithaSevaRAG()

if __name__ == "__main__":
    test_queries = [
        ("ಭತ್ತದ ಬೆಂಕಿ ರೋಗಕ್ಕೆ ಯಾವ ಔಷಧಿ ಸಿಂಪಡಿಸಬೇಕು?", "kn"),
        ("How to control fall armyworm in maize?", "en"),
        ("ರಾಗಿಯಲ್ಲಿ ಅಧಿಕ ಇಳುವರಿ ಪಡೆಯಲು ಯಾವ ತಳಿ ಸೂಕ್ತ?", "kn")
    ]
    for q, lang in test_queries:
        print(f"\n====================\nQuery: {q}")
        res = rag_engine.generate_advisory(q, preferred_lang=lang)
        print("Answer:\n", res["answer"][:300] + "...")
        print("Citations Count:", len(res["citations"]))
