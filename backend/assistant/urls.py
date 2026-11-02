"""
URL patterns for Raitha Seva AI Assistant API endpoints.
"""

from django.urls import path
from .views import (
    AssistantQueryView,
    PestDiagnosisView,
    CropCatalogueView,
    SourcesManifestView
)

urlpatterns = [
    path('ask/', AssistantQueryView.as_view(), name='assistant_ask'),
    path('diagnose/', PestDiagnosisView.as_view(), name='assistant_diagnose'),
    path('crops/', CropCatalogueView.as_view(), name='assistant_crops'),
    path('sources/', SourcesManifestView.as_view(), name='assistant_sources'),
]
