from datetime import date
from django.db.models import Q
from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.contrib.auth.models import User
from .models import (
    Profile, Equipment, OwnerRequest, Booking,
    Advertisement, Reel, WeatherCache, MarketPrice, PestReport,
    OfficialPestAlert, SourceSyncLog
)
from .serializers import (
    ProfileSerializer, RegisterSerializer, EquipmentSerializer,
    OwnerRequestSerializer, BookingSerializer, AdvertisementSerializer,
    ReelSerializer, WeatherCacheSerializer, MarketPriceSerializer,
    PestReportSerializer, OfficialPestAlertSerializer, SourceSyncLogSerializer
)
from integrations.pipeline import pest_pipeline


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get('username') or attrs.get('email')
        if username_or_email and '@' in username_or_email:
            try:
                user = User.objects.filter(email__iexact=username_or_email).first()
                if user:
                    attrs['username'] = user.username
            except Exception:
                pass
        elif not attrs.get('username') and attrs.get('email'):
            try:
                user = User.objects.filter(email__iexact=attrs.get('email')).first()
                if user:
                    attrs['username'] = user.username
            except Exception:
                pass

        return super().validate(attrs)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        return Response(ProfileSerializer(profile).data, status=status.HTTP_201_CREATED)


class CurrentProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.profile
            serializer = ProfileSerializer(profile)
            return Response(serializer.data)
        except Profile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        try:
            profile = request.user.profile
            serializer = ProfileSerializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except Profile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all().order_by('-created_at')
    serializer_class = EquipmentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.profile)


class OwnerRequestViewSet(viewsets.ModelViewSet):
    queryset = OwnerRequest.objects.all().order_by('-created_at')
    serializer_class = OwnerRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = self.request.user.profile
        if profile.is_admin:
            return OwnerRequest.objects.all()
        return OwnerRequest.objects.filter(user=profile)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user.profile)


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = self.request.user.profile
        if profile.is_admin:
            return Booking.objects.all()
        return Booking.objects.filter(
            models.Q(farmer=profile) | models.Q(equipment__owner=profile)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user.profile)


class AdvertisementViewSet(viewsets.ModelViewSet):
    queryset = Advertisement.objects.all()
    serializer_class = AdvertisementSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_authenticated and hasattr(self.request.user, 'profile') and self.request.user.profile.is_admin:
            return Advertisement.objects.all()
        return Advertisement.objects.filter(is_enabled=True)


class ReelViewSet(viewsets.ModelViewSet):
    queryset = Reel.objects.filter(is_published=True).order_by('-created_at')
    serializer_class = ReelSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class WeatherCacheViewSet(viewsets.ModelViewSet):
    queryset = WeatherCache.objects.all()
    serializer_class = WeatherCacheSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'village_name'


class MarketPriceViewSet(viewsets.ModelViewSet):
    queryset = MarketPrice.objects.all().order_by('-price_date')
    serializer_class = MarketPriceSerializer
    permission_classes = [permissions.AllowAny]


class PestReportViewSet(viewsets.ModelViewSet):
    queryset = PestReport.objects.all().order_by('-created_at')
    serializer_class = PestReportSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        if self.request.user.is_authenticated and hasattr(self.request.user, 'profile'):
            serializer.save(user=self.request.user.profile)
        else:
            serializer.save()


class OfficialPestAlertViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/pest-alerts/
    Filterable by:
    - crop: paddy, ragi, sugarcane, maize, pulses, groundnut, cotton, vegetables, coconut, all
    - district: Mandya, Mysuru, Hassan, etc. (also matches 'All Karnataka')
    - source: UAS_BANGALORE, ICAR, RAITAMITRA_KSDA
    - status: active (default), expired, all
    - weather_risk: true, false
    """
    serializer_class = OfficialPestAlertSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = OfficialPestAlert.objects.all()

        # Status filter (default active)
        status_param = self.request.query_params.get('status', 'active').lower()
        today = date.today()
        if status_param == 'active':
            qs = qs.filter(is_active=True).filter(Q(expires_at__gte=today) | Q(expires_at__isnull=True))
        elif status_param == 'expired':
            qs = qs.filter(Q(is_active=False) | Q(expires_at__lt=today))

        # Crop filter
        crop = self.request.query_params.get('crop')
        if crop and crop.lower() != 'all':
            qs = qs.filter(crop__iexact=crop.strip().lower())

        # District filter (matches specific district or statewide 'All Karnataka')
        district = self.request.query_params.get('district')
        if district and district.lower() != 'all':
            qs = qs.filter(
                Q(district__icontains=district.strip()) |
                Q(district__iexact='All Karnataka') |
                Q(district__iexact='Statewide')
            )

        # Source filter
        source = self.request.query_params.get('source')
        if source and source.upper() != 'ALL':
            qs = qs.filter(source_org__iexact=source.strip())

        # Weather risk filter
        weather_risk = self.request.query_params.get('weather_risk')
        if weather_risk in ['true', '1']:
            qs = qs.filter(is_weather_risk=True)
        elif weather_risk in ['false', '0']:
            qs = qs.filter(is_weather_risk=False)

        return qs.order_by('-publication_date', '-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        total_count = queryset.count()
        sources_included = list(queryset.values_list('source_org', flat=True).distinct())

        return Response({
            "status": "success",
            "total_alerts": total_count,
            "sources_represented": sources_included,
            "filters": {
                "crop": request.query_params.get('crop', 'all'),
                "district": request.query_params.get('district', 'all'),
                "source": request.query_params.get('source', 'all'),
                "status": request.query_params.get('status', 'active'),
            },
            "alerts": serializer.data
        })


class PestSourcesStatusView(APIView):
    """
    GET /api/pest-alerts/sources/
    Returns live connectivity status, access method, last sync, and error logs for all 3 sources.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        sources = pest_pipeline.get_sources_status()
        return Response({
            "status": "success",
            "sources_count": len(sources),
            "sources": sources
        })


class PestAlertSyncView(APIView):
    """
    POST /api/pest-alerts/sync/
    Triggers synchronization from official sources.
    Body (optional): { "source": "UAS_BANGALORE" | "ICAR" | "RAITAMITRA_KSDA" | "ALL" }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        source_key = request.data.get('source', 'ALL').upper()
        if source_key == 'ALL':
            results = pest_pipeline.sync_all_sources()
        else:
            if source_key not in pest_pipeline.adapters:
                return Response(
                    {"error": f"Invalid source: {source_key}. Must be one of: {list(pest_pipeline.adapters.keys())}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            results = [pest_pipeline.sync_source(source_key)]

        return Response({
            "status": "success",
            "sync_results": results,
            "total_alerts_now": OfficialPestAlert.objects.count()
        })


class PestAlertManualUploadView(APIView):
    """
    POST /api/pest-alerts/upload/
    Allows administrative ingestion of official bulletins / circulars.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        title = request.data.get('title', '').strip()
        crop = request.data.get('crop', '').strip()
        pest_name = request.data.get('pest_name', '').strip()
        source_url = request.data.get('source_url', '').strip()

        if not (title and crop and pest_name and source_url):
            return Response(
                {"error": "Fields 'title', 'crop', 'pest_name', and 'source_url' are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        adapter = pest_pipeline.adapters.get("RAITAMITRA_KSDA")
        pub_date_str = request.data.get('publication_date')
        pub_date = date.today()
        if pub_date_str:
            try:
                from datetime import datetime
                pub_date = datetime.strptime(pub_date_str, "%Y-%m-%d").date()
            except Exception:
                pass

        alert_dict = adapter.ingest_manual_document(
            title=title,
            description=request.data.get('description', title),
            crop=crop,
            pest_name=pest_name,
            district=request.data.get('district', 'All Karnataka'),
            source_url=source_url,
            publication_date=pub_date,
            symptoms=request.data.get('symptoms', ''),
            preventive_measures=request.data.get('preventive_measures', ''),
            chemical_treatment=request.data.get('chemical_treatment', ''),
            organic_treatment=request.data.get('organic_treatment', ''),
            severity=request.data.get('severity', 'MODERATE'),
            content_kn=request.data.get('content_kn', ''),
            content_en=request.data.get('content_en', '')
        )

        alert, created = OfficialPestAlert.objects.update_or_create(
            source_id=alert_dict["source_id"],
            defaults=alert_dict
        )

        # Index into ChromaDB
        pest_pipeline.index_alerts_to_vector_store()

        return Response({
            "status": "success",
            "created": created,
            "alert": OfficialPestAlertSerializer(alert).data
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

