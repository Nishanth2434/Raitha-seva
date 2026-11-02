"""
Django REST Framework API Views for Raitha Seva AI Assistant.
Exposes evidence-grounded RAG query, multi-crop disease diagnosis, and source catalogue endpoints.
"""

import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from assistant.rag import rag_engine
from assistant.safety import check_chemical_safety, validate_agricultural_advice
from assistant.citations import format_citations
from assistant.vision import vision_doctor
from ingestion.collect_sources import list_all_crops, OFFICIAL_SOURCES

class AssistantQueryView(APIView):
    """
    POST /api/assistant/ask/
    Body:
    {
        "query": "ಭತ್ತದ ಬೆಂಕಿ ರೋಗಕ್ಕೆ ಯಾವ ಔಷಧಿ ಸಿಂಪಡಿಸಬೇಕು?",
        "language": "kn" | "en",
        "region": "Mandya",
        "crop": "paddy" (optional)
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        query = request.data.get("query", "").strip()
        if not query:
            return Response(
                {"error": "Query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        raw_lang = str(request.data.get("language", "kn")).lower().strip()
        language = raw_lang if raw_lang in ["kn", "hi", "en"] else "kn"
        region = request.data.get("region", "Mandya")
        explicit_crop = request.data.get("crop")

        # Run RAG pipeline
        result = rag_engine.generate_advisory(
            query=query,
            preferred_lang=language,
            region=region,
            explicit_crop=explicit_crop
        )

        return Response({
            "status": "success",
            "query": query,
            "crop": result.get("crop"),
            "language": result.get("language"),
            "answer": result.get("answer"),
            "grounded": result.get("grounded", False),
            "citations": result.get("citations", []),
            "warnings": result.get("warnings", []),
            "safety_status": result.get("safety_status", "UNKNOWN")
        })

class PestDiagnosisView(APIView):
    """
    POST /api/assistant/diagnose/
    Accepts crop image analysis requests with multimodal vision processing and backend safety enforcement.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        crop = request.data.get("crop", "auto")
        if not crop or str(crop).lower().strip() in ["all", "none", "null", ""]:
            crop = "auto"
        symptom_notes = request.data.get("symptoms", "")
        raw_lang = str(request.data.get("language", "kn")).lower().strip()
        language = raw_lang if raw_lang in ["kn", "hi", "en"] else "kn"
        region = request.data.get("region", "Mandya")
        image = request.data.get("image") or request.data.get("image_base64")

        # 1. Multimodal Vision Doctor if image is provided
        if image:
            result = vision_doctor.analyze_crop_image(
                image_base64=image,
                crop_hint=crop,
                region=region,
                language=language
            )
            return Response(result)

        # 2. Text-based query fallback if only text was submitted
        query = f"{crop} disease symptoms: {symptom_notes}" if symptom_notes else f"{crop} disease diagnosis"

        # Query verified agronomic knowledge base
        rag_res = rag_engine.generate_advisory(
            query=query,
            preferred_lang=language,
            region=region,
            explicit_crop=crop
        )

        return Response({
            "status": "success",
            "crop": crop,
            "language": language,
            "diagnosis": rag_res.get("answer"),
            "citations": rag_res.get("citations", []),
            "safety_status": rag_res.get("safety_status"),
            "warnings": rag_res.get("warnings", [])
        })

class CropCatalogueView(APIView):
    """
    GET /api/assistant/crops/
    Returns full multi-crop catalogue with regional suitability.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        crops = list_all_crops()
        return Response({
            "status": "success",
            "total_crops": len(crops),
            "crops": crops
        })

class SourcesManifestView(APIView):
    """
    GET /api/assistant/sources/
    Returns verified official documents and publication dates.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        sources = [
            {
                "id": s["id"],
                "crop": s["crop"],
                "crop_kn": s.get("crop_kn"),
                "title": s["title"],
                "source": s["source"],
                "source_url": s["source_url"],
                "publication_date": s["publication_date"],
                "applicable_region": s["applicable_region"],
                "review_status": s["review_status"]
            }
            for s in OFFICIAL_SOURCES
        ]
        return Response({
            "status": "success",
            "total_sources": len(sources),
            "sources": sources
        })
