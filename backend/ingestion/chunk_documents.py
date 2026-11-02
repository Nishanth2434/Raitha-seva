"""
Semantic and Heading-Aware Document Chunker for Agricultural Advisories.
Processes raw documents and package of practices into structured, metadata-rich chunks
suitable for embedding and semantic retrieval with ChromaDB.
"""

import re
import json
import hashlib
from typing import List, Dict, Any
from pathlib import Path

def normalize_agricultural_text(text: str) -> str:
    """
    Clean excess whitespace and normalize punctuation while strictly
    preserving units (e.g. g/liter, ml/liter, kg/acre, DAP, NPK, %, ppm).
    """
    # Replace multiple spaces/newlines
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def chunk_agricultural_document(doc: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Breaks a single crop document into meaningful semantic sections (Bilingual EN & KN).
    Each chunk inherits full verified source metadata and content hashes.
    """
    chunks = []
    doc_id = doc["id"]
    crop = doc["crop"]
    source = doc["source"]
    source_url = doc["source_url"]
    pub_date = doc["publication_date"]
    region = doc["applicable_region"]

    # 1. English Chunks
    en_text = doc.get("content_en", "").strip()
    if en_text:
        sections = [s.strip() for s in re.split(r'\n(?=[0-9]+\.|\-|\•)', en_text) if s.strip()]
        for idx, sec in enumerate(sections):
            normalized = normalize_agricultural_text(sec)
            chunk_id = f"{doc_id}-en-{idx+1}"
            chunk_hash = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
            chunks.append({
                "id": chunk_id,
                "text": f"[{doc['crop'].upper()} - {doc['title']}]\n{normalized}",
                "metadata": {
                    "doc_id": doc_id,
                    "crop": crop,
                    "language": "en",
                    "title": doc["title"],
                    "source": source,
                    "source_url": source_url,
                    "publication_date": pub_date,
                    "applicable_region": region,
                    "chunk_index": idx + 1,
                    "content_hash": chunk_hash,
                    "review_status": doc.get("review_status", "verified")
                }
            })

    # 2. Kannada Chunks
    kn_text = doc.get("content_kn", "").strip()
    if kn_text:
        sections_kn = [s.strip() for s in re.split(r'\n(?=[0-9]+\.|\-|\•)', kn_text) if s.strip()]
        for idx, sec in enumerate(sections_kn):
            normalized_kn = normalize_agricultural_text(sec)
            chunk_id = f"{doc_id}-kn-{idx+1}"
            chunk_hash = hashlib.sha256(normalized_kn.encode("utf-8")).hexdigest()
            chunks.append({
                "id": chunk_id,
                "text": f"[{doc['crop_kn']} - {doc['title']}]\n{normalized_kn}",
                "metadata": {
                    "doc_id": doc_id,
                    "crop": crop,
                    "language": "kn",
                    "title": doc["title"],
                    "source": source,
                    "source_url": source_url,
                    "publication_date": pub_date,
                    "applicable_region": region,
                    "chunk_index": idx + 1,
                    "content_hash": chunk_hash,
                    "review_status": doc.get("review_status", "verified")
                }
            })

    return chunks

def process_and_save_chunks(sources: List[Dict[str, Any]], output_dir: Path) -> List[Dict[str, Any]]:
    """Chunks all official documents and saves the structured manifest."""
    output_dir.mkdir(parents=True, exist_ok=True)
    all_chunks = []

    for s in sources:
        doc_chunks = chunk_agricultural_document(s)
        all_chunks.extend(doc_chunks)

    manifest_path = output_dir / "manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump({
            "total_documents": len(sources),
            "total_chunks": len(all_chunks),
            "sources": sources,
            "chunks": all_chunks
        }, f, ensure_ascii=False, indent=2)

    return all_chunks

if __name__ == "__main__":
    from collect_sources import OFFICIAL_SOURCES
    out_dir = Path(__file__).resolve().parent.parent / "data" / "processed"
    chunks = process_and_save_chunks(OFFICIAL_SOURCES, out_dir)
    print(f"Successfully generated {len(chunks)} structured agricultural chunks in {out_dir}")
