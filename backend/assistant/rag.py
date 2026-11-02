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
from assistant.prompts import KANNADA_SYSTEM_PROMPT, ENGLISH_SYSTEM_PROMPT, build_rag_user_prompt

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
        """Detects crop name from user query in Kannada or English."""
        q = query.lower()
        if any(w in q for w in ["paddy", "rice", "ಭತ್ತ", "ನೆಲ್ಲು"]):
            return "paddy"
        if any(w in q for w in ["ragi", "millet", "ರಾಗಿ"]):
            return "ragi"
        if any(w in q for w in ["sugarcane", "sugar cane", "cane", "ಕಬ್ಬು"]):
            return "sugarcane"
        if any(w in q for w in ["maize", "corn", "ಮೆಕ್ಕೆಜೋಳ"]):
            return "maize"
        if any(w in q for w in ["tur", "redgram", "red gram", "pigeonpea", "ತೊಗರಿ", "ಬೇಳೆ"]):
            return "pulses"
        if any(w in q for w in ["tomato", "chilli", "onion", "ಟೊಮೆಟೊ", "ಮೆಣಸಿನಕಾಯಿ", "ಈರುಳ್ಳಿ"]):
            return "vegetables"
        if any(w in q for w in ["coconut", "ತೆಂಗು", "ತೆಂಗಿನ"]):
            return "coconut"
        return None

    def detect_language(self, query: str, preferred: str = "kn") -> str:
        """Detects if query is written in Kannada script."""
        if any(u'\u0C80' <= c <= u'\u0CFF' for c in query):
            return "kn"
        if preferred in ["kn", "en"]:
            return preferred
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

                # Grounding condition: Must have keyword relevance or strong semantic proximity
                is_relevant = (keyword_hits >= 1 and effective_dist <= 1.45) or (dist <= 1.30 and dist > 0.0)

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
            disclaimer = safety_eval["disclaimer_kn"] if language == "kn" else safety_eval["disclaimer_en"]
            esc = safety_eval["escalation"]
            answer = f"⚠️ {disclaimer}\n\n📞 **ಸಹಾಯವಾಣಿ (Official Support):**\n• {esc['kvk_name']}\n• ದೂರವಾಣಿ: {esc['phone']}"
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
                system_prompt = KANNADA_SYSTEM_PROMPT if language == "kn" else ENGLISH_SYSTEM_PROMPT
                user_prompt = build_rag_user_prompt(
                    query=query,
                    retrieved_context=context_str,
                    crop=crop,
                    region=region,
                    language=language
                )

                # Try Gemini 2.0 Flash or 1.5 Flash
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
            if language == "kn":
                answer_text = f"🌾 **ರೈತ ಸೇವಾ ಎಐ ಕೃಷಿ ಸಲಹೆಗಾರ (ಅಧಿಕೃತ ಮಾಹಿತಿ)**:\n\n"
                for i, c in enumerate(chunks[:2], 1):
                    # Clean title line
                    lines = [ln for ln in c['text'].split('\n') if not ln.startswith('[')]
                    answer_text += f"{lines[0] if lines else ''}\n" + "\n".join(lines[1:5]) + "\n\n"
                answer_text += f"💡 **ಸಿಂಪಡಣೆ ಮುನ್ನೆಚ್ಚರಿಕೆ**: {safety_eval['disclaimer_kn']}"
            else:
                answer_text = f"🌾 **Raitha Seva AI Scientific Advisory**:\n\n"
                for i, c in enumerate(chunks[:2], 1):
                    lines = [ln for ln in c['text'].split('\n') if not ln.startswith('[')]
                    answer_text += f"{lines[0] if lines else ''}\n" + "\n".join(lines[1:5]) + "\n\n"
                answer_text += f"💡 **Safety Notice**: {safety_eval['disclaimer_en']}"

        # Append citations
        final_answer = answer_text + citations_md

        return {
            "answer": final_answer,
            "language": language,
            "crop": crop,
            "grounded": True,
            "citations": citations,
            "warnings": [safety_eval.get("disclaimer_kn" if language == "kn" else "disclaimer_en")],
            "safety_status": "VERIFIED_SAFE"
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
