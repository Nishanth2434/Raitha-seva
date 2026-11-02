"""
Pest Alert Data Pipeline & Normalization Service for Raitha Seva AI.
Synchronizes, normalizes, deduplicates, and vector-indexes agricultural advisories
from UAS Bengaluru, ICAR, and Karnataka Department of Agriculture (Raitamitra).
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import date
from django.utils import timezone
from django.db import transaction

from api.models import OfficialPestAlert, SourceSyncLog
from integrations.sources.uasb import UASBangaloreAdapter
from integrations.sources.icar import ICARAdapter
from integrations.sources.raitamitra import RaitamitraAdapter

logger = logging.getLogger(__name__)

class PestAlertPipeline:
    def __init__(self):
        self.adapters = {
            "UAS_BANGALORE": UASBangaloreAdapter(),
            "ICAR": ICARAdapter(),
            "RAITAMITRA_KSDA": RaitamitraAdapter(),
        }

    def get_sources_status(self) -> List[Dict[str, Any]]:
        """
        Runs health check across all three official agricultural organizations,
        pairing with the latest database sync status.
        """
        results = []
        for key, adapter in self.adapters.items():
            health = adapter.health_check()
            last_log = SourceSyncLog.objects.filter(source_org=key).order_by("-last_sync").first()
            active_count = OfficialPestAlert.objects.filter(source_org=key, is_active=True).count()

            results.append({
                "source_key": key,
                "source_name": adapter.source_name,
                "access_method": adapter.access_method,
                "base_url": adapter.base_url,
                "connection_status": health.get("status", "UNKNOWN"),
                "http_status": health.get("http_status"),
                "latency_ms": health.get("latency_ms"),
                "last_checked": health.get("last_checked"),
                "last_successful_sync": last_log.last_sync.isoformat() if last_log and last_log.status == "SUCCESS" else None,
                "sync_status": last_log.status if last_log else "INITIALIZED",
                "total_active_alerts": active_count,
                "error": health.get("error") or (last_log.error_message if last_log and last_log.status == "FAILED" else None),
            })
        return results

    def sync_source(self, source_key: str) -> Dict[str, Any]:
        """Synchronizes advisories from a single source organization."""
        adapter = self.adapters.get(source_key)
        if not adapter:
            raise ValueError(f"Unknown source adapter: {source_key}")

        items_synced = 0
        items_new = 0
        error_msg = None
        sync_status = "SUCCESS"

        try:
            raw_advisories = adapter.fetch_advisories()
            items_synced = len(raw_advisories)

            with transaction.atomic():
                for item in raw_advisories:
                    source_id = item["source_id"]
                    pub_date = item.get("publication_date") or date.today()
                    expires_at = item.get("expires_at")

                    # Check expiry
                    today = date.today()
                    is_active = True
                    review_status = item.get("review_status", "VERIFIED")
                    if expires_at and expires_at < today:
                        is_active = False
                        review_status = "EXPIRED"

                    alert, created = OfficialPestAlert.objects.update_or_create(
                        source_id=source_id,
                        defaults={
                            "source_org": item["source_org"],
                            "title": item["title"],
                            "description": item["description"],
                            "crop": item["crop"],
                            "crop_display": item.get("crop_display", adapter.get_crop_display(item["crop"])),
                            "pest_name": item["pest_name"],
                            "scientific_name": item.get("scientific_name"),
                            "district": item.get("district", "All Karnataka"),
                            "region": item.get("region"),
                            "symptoms": item.get("symptoms"),
                            "preventive_measures": item.get("preventive_measures"),
                            "chemical_treatment": item.get("chemical_treatment"),
                            "organic_treatment": item.get("organic_treatment"),
                            "severity": item.get("severity", "MODERATE"),
                            "source_url": item["source_url"],
                            "document_url": item.get("document_url"),
                            "publication_date": pub_date,
                            "retrieved_at": item.get("retrieved_at", timezone.now()),
                            "expires_at": expires_at,
                            "is_active": is_active,
                            "is_weather_risk": item.get("is_weather_risk", False),
                            "review_status": review_status,
                            "confidence_score": item.get("confidence_score", 1.0),
                            "content_kn": item.get("content_kn"),
                            "content_en": item.get("content_en"),
                        }
                    )
                    if created:
                        items_new += 1

        except Exception as e:
            sync_status = "FAILED"
            error_msg = str(e)
            logger.error(f"[Sync Error] {source_key}: {e}", exc_info=True)

        # Record log
        SourceSyncLog.objects.create(
            source_org=source_key,
            access_method=adapter.access_method,
            status=sync_status,
            items_synced=items_synced,
            items_new=items_new,
            last_sync=timezone.now(),
            error_message=error_msg,
        )

        return {
            "source_key": source_key,
            "status": sync_status,
            "items_synced": items_synced,
            "items_new": items_new,
            "error": error_msg,
        }

    def sync_all_sources(self) -> List[Dict[str, Any]]:
        """Synchronizes all configured official agricultural sources."""
        results = []
        for key in self.adapters.keys():
            res = self.sync_source(key)
            results.append(res)
        
        # After database sync, update ChromaDB vector store
        try:
            self.index_alerts_to_vector_store()
        except Exception as e:
            logger.warning(f"[Vector Index Warning] Failed to index alerts into ChromaDB: {e}")

        return results

    def index_alerts_to_vector_store(self):
        """Indexes active pest alerts into ChromaDB for RAG retrieval."""
        try:
            from ingestion.index_documents import get_chroma_client, COLLECTION_NAME
            from assistant.embeddings import GeminiEmbeddingFunction

            chroma = get_chroma_client()
            collection = chroma.get_or_create_collection(name=COLLECTION_NAME)
            embedding_fn = GeminiEmbeddingFunction()

            active_alerts = OfficialPestAlert.objects.filter(is_active=True)
            if not active_alerts.exists():
                return

            documents = []
            metadatas = []
            ids = []

            for alert in active_alerts:
                doc_text = f"""
Official Agricultural Pest Advisory: {alert.title}
Source: {alert.get_source_org_display()} ({alert.source_org})
Source URL: {alert.source_url}
Publication Date: {alert.publication_date}
Crop: {alert.crop} ({alert.crop_display})
Pest / Disease: {alert.pest_name} (Scientific: {alert.scientific_name or 'N/A'})
District / Region: {alert.district} ({alert.region or ''})
Severity: {alert.severity}
Symptoms: {alert.symptoms}
Preventive Measures: {alert.preventive_measures}
Organic / Biocontrol: {alert.organic_treatment}
Chemical Treatment: {alert.chemical_treatment}
Advisory (Kannada): {alert.content_kn}
Advisory (English): {alert.content_en}
                """.strip()

                documents.append(doc_text)
                metadatas.append({
                    "doc_id": alert.source_id,
                    "crop": alert.crop,
                    "crop_kn": alert.crop_display,
                    "title": alert.title,
                    "source": alert.source_org,
                    "source_url": alert.source_url,
                    "publication_date": str(alert.publication_date or ""),
                    "applicable_region": alert.district,
                    "review_status": alert.review_status,
                })
                ids.append(f"alert-{alert.source_id}")

            embeddings = embedding_fn.embed_documents(documents)
            collection.upsert(
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids
            )
            logger.info(f"[Vector Index Success] Indexed {len(ids)} official alerts into ChromaDB.")
        except Exception as e:
            logger.error(f"[Vector Index Error] {e}")

# Global pipeline instance
pest_pipeline = PestAlertPipeline()
