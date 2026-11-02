"""
ChromaDB Vector Store Indexing Pipeline for Raitha Seva AI.
Loads chunks from processed manifest and embeds them into a persistent ChromaDB collection
with complete agricultural metadata.
"""

import os
import sys
from pathlib import Path

# Add backend directory to path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

import chromadb
from ingestion.collect_sources import OFFICIAL_SOURCES
from ingestion.chunk_documents import process_and_save_chunks
from assistant.embeddings import GeminiEmbeddingFunction

CHROMA_PATH = BASE_DIR / "data" / "chroma_db"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
COLLECTION_NAME = "raitha_seva_knowledge"

def get_chroma_client() -> chromadb.PersistentClient:
    """Returns a PersistentClient pointing to backend/data/chroma_db."""
    CHROMA_PATH.mkdir(parents=True, exist_ok=True)
    return chromadb.PersistentClient(path=str(CHROMA_PATH))

def index_all_documents(force_reindex: bool = False):
    """
    Reads official knowledge sources, processes into semantic chunks,
    and indexes into ChromaDB with Gemini embedding function.
    """
    print(f"[Indexing] Processing official agricultural documents...")
    chunks = process_and_save_chunks(OFFICIAL_SOURCES, PROCESSED_DIR)
    print(f"[Indexing] Prepared {len(chunks)} chunks across {len(OFFICIAL_SOURCES)} official crop guides.")

    client = get_chroma_client()
    embedding_fn = GeminiEmbeddingFunction()

    # Re-index if requested
    if force_reindex:
        try:
            client.delete_collection(name=COLLECTION_NAME)
            print(f"[Indexing] Deleted existing collection: {COLLECTION_NAME}")
        except Exception:
            pass

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"description": "Raitha Seva Multi-Crop Verified Agricultural Knowledge Base"}
    )

    ids = [c["id"] for c in chunks]
    documents = [c["text"] for c in chunks]
    metadatas = [c["metadata"] for c in chunks]

    # Compute embeddings
    print(f"[Indexing] Vectorizing documents with embedding model...")
    embeddings = embedding_fn.embed_documents(documents)

    # Upsert into ChromaDB
    collection.upsert(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
        embeddings=embeddings
    )

    print(f"[Indexing] Successfully indexed {collection.count()} chunks into collection '{COLLECTION_NAME}'.")
    return collection

if __name__ == "__main__":
    col = index_all_documents(force_reindex=True)
    print("Vector database indexing complete!")
