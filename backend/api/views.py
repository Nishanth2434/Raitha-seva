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
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'village_name'


class MarketPriceViewSet(viewsets.ModelViewSet):
    """
    Agricultural Market Price API.
    Supports filtering by:
    - district: Mandya, Mysuru, Ramanagara, etc. (defaults to Mandya priority if empty)
    - crop: Paddy, Ragi, Jaggery, Sugarcane, etc. (matches English or Kannada)
    - market / mandi: Mandya, Maddur, Pandavapura, etc.
    - state: Karnataka (default)
    - date: YYYY-MM-DD
    """
    serializer_class = MarketPriceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = MarketPrice.objects.all()

        # District filter with spelling normalization
        district = self.request.query_params.get('district')
        if district and district.lower() not in ['all', 'all karnataka', 'all karnataka districts']:
            d = district.strip()
            if d.lower() in ["mysuru", "mysore"]:
                qs = qs.filter(Q(district__icontains="Mysuru") | Q(district__icontains="Mysore"))
            elif d.lower() in ["tumakuru", "tumkur"]:
                qs = qs.filter(Q(district__icontains="Tumakuru") | Q(district__icontains="Tumkur"))
            elif d.lower() in ["chikkaballapura", "chikkaballapur"]:
                qs = qs.filter(Q(district__icontains="Chikkaballapura") | Q(district__icontains="Chikkaballapur"))
            elif d.lower() in ["shivamogga", "shimoga"]:
                qs = qs.filter(Q(district__icontains="Shivamogga") | Q(district__icontains="Shimoga"))
            elif d.lower() in ["davanagere", "davangere"]:
                qs = qs.filter(Q(district__icontains="Davanagere") | Q(district__icontains="Davangere"))
            else:
                qs = qs.filter(district__icontains=d)

        # Crop filter with robust normalization and alias matching (e.g. Maize vs Corn vs Makka)
        crop = self.request.query_params.get('crop')
        if crop and crop.lower() != 'all':
            raw_c = crop.strip()
            c = raw_c.lower()

            if any(k in c for k in ["maize", "corn", "makka", "ಮೆಕ್ಕೆಜೋಳ", "ಮಕ್ಕೆಜೋಳ"]):
                crop_q = Q(crop_name__icontains="Maize") | Q(crop_name__icontains="Corn") | Q(crop_name_kn__icontains="ಮೆಕ್ಕೆಜೋಳ")
            elif any(k in c for k in ["paddy", "dhan", "rice", "ಭತ್ತ"]):
                crop_q = Q(crop_name__icontains="Paddy") | Q(crop_name__icontains="Dhan") | Q(crop_name__icontains="Rice") | Q(crop_name_kn__icontains="ಭತ್ತ")
            elif any(k in c for k in ["ragi", "finger millet", "ರಾಗಿ"]):
                crop_q = Q(crop_name__icontains="Ragi") | Q(crop_name__icontains="Finger Millet") | Q(crop_name_kn__icontains="ರಾಗಿ")
            elif any(k in c for k in ["tender coconut", "tender", "ಎಳನೀರು"]):
                crop_q = Q(crop_name__icontains="Tender Coconut") | Q(crop_name_kn__icontains="ಎಳನೀರು")
            elif any(k in c for k in ["coconut", "ತೆಂಗಿನಕಾಯಿ", "ತೆಂಗು"]):
                crop_q = (Q(crop_name__iexact="Coconut") | Q(crop_name_kn__icontains="ತೆಂಗಿನಕಾಯಿ") | Q(crop_name_kn__icontains="ತೆಂಗು")) & ~Q(crop_name__icontains="Tender")
            elif any(k in c for k in ["sugarcane", "sugar cane", "cane", "ಕಬ್ಬು"]):
                crop_q = Q(crop_name__icontains="Sugarcane") | Q(crop_name__icontains="Cane") | Q(crop_name_kn__icontains="ಕಬ್ಬು")
            elif any(k in c for k in ["jaggery", "gur", "ಬೆಲ್ಲ"]):
                crop_q = Q(crop_name__icontains="Jaggery") | Q(crop_name_kn__icontains="ಬೆಲ್ಲ")
            elif any(k in c for k in ["tomato", "tamatar", "ಟೊಮ್ಯಾಟೊ", "ಟೊಮೇಟೊ", "ಟೊಮೆಟೊ"]):
                crop_q = Q(crop_name__icontains="Tomato") | Q(crop_name_kn__icontains="ಟೊಮ್ಯಾಟೊ") | Q(crop_name_kn__icontains="ಟೊಮೇಟೊ")
            elif any(k in c for k in ["onion", "pyaz", "ಈರುಳ್ಳಿ"]):
                crop_q = Q(crop_name__icontains="Onion") | Q(crop_name_kn__icontains="ಈರುಳ್ಳಿ")
            elif any(k in c for k in ["groundnut", "peanut", "shenga", "ಕಡಲೆಕಾಯಿ"]):
                crop_q = Q(crop_name__icontains="Groundnut") | Q(crop_name_kn__icontains="ಕಡಲೆಕಾಯಿ")
            elif any(k in c for k in ["banana", "yelakki", "ಬಾಳೆಹಣ್ಣು"]):
                crop_q = Q(crop_name__icontains="Banana") | Q(crop_name_kn__icontains="ಬಾಳೆಹಣ್ಣು")
            else:
                crop_q = Q(crop_name__icontains=c) | Q(crop_name_kn__icontains=c)

            qs = qs.filter(crop_q)

        # Market / Mandi filter
        mandi = self.request.query_params.get('mandi') or self.request.query_params.get('market')
        if mandi and mandi.lower() != 'all':
            qs = qs.filter(mandi_name__icontains=mandi.strip())

        # State filter
        state = self.request.query_params.get('state')
        if state and state.lower() != 'all':
            qs = qs.filter(state__icontains=state.strip())

        # Date filter
        date_param = self.request.query_params.get('date')
        if date_param:
            qs = qs.filter(market_report_date=date_param)

        return qs.order_by('-market_report_date', '-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # If no records exist in DB at all, auto-populate baseline once
        if MarketPrice.objects.count() == 0:
            from integrations.market_service import MarketDataSyncService
            MarketDataSyncService().sync_market_prices(state='Karnataka', district='Mandya')
            queryset = self.filter_queryset(self.get_queryset())

        serializer = self.get_serializer(queryset, many=True)

        last_sync_log = SourceSyncLog.objects.filter(source_org='AGMARKNET').order_by('-last_sync').first()
        latest_record = MarketPrice.objects.order_by('-market_report_date').first()
        today = date.today()

        is_stale = False
        if latest_record and latest_record.market_report_date:
            is_stale = (today - latest_record.market_report_date).days > 1

        return Response({
            "count": queryset.count(),
            "results": serializer.data,
            "metadata": {
                "district_requested": request.query_params.get('district', 'all'),
                "crop_requested": request.query_params.get('crop', 'all'),
                "last_synced_at": last_sync_log.last_sync.isoformat() if last_sync_log else None,
                "sync_status": last_sync_log.status if last_sync_log else "INITIAL",
                "latest_report_date": latest_record.market_report_date.isoformat() if latest_record else None,
                "is_stale": is_stale,
                "source": latest_record.source_name if latest_record else "AGMARKNET (agmarknet.gov.in)",
                "mandya_count": MarketPrice.objects.filter(district__iexact='Mandya').count(),
                "total_records": MarketPrice.objects.count()
            }
        })

    @action(detail=False, methods=['post'], url_path='sync')
    def sync(self, request):
        """Trigger market data sync on-demand."""
        from integrations.market_service import MarketDataSyncService
        state = request.data.get('state', 'Karnataka')
        district = request.data.get('district', 'Mandya')
        force = bool(request.data.get('force', False))

        service = MarketDataSyncService()
        result = service.sync_market_prices(state=state, district=district, force=force)
        return Response(result, status=status.HTTP_200_OK if result.get('status') != 'FAILED' else status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='status')
    def status_report(self, request):
        """Diagnostic status of AGMARKNET sync service."""
        last_sync_log = SourceSyncLog.objects.filter(source_org='AGMARKNET').order_by('-last_sync').first()
        latest_record = MarketPrice.objects.order_by('-market_report_date').first()
        today = date.today()

        districts = list(MarketPrice.objects.values_list('district', flat=True).distinct())
        commodities = list(MarketPrice.objects.values_list('crop_name', flat=True).distinct())

        return Response({
            "service": "AGMARKNET Market Data Sync Service",
            "schedule": "Daily at 06:00 AM IST (00:30 UTC)",
            "timezone": "Asia/Kolkata",
            "last_sync": last_sync_log.last_sync.isoformat() if last_sync_log else None,
            "last_status": last_sync_log.status if last_sync_log else "NO_SYNC_YET",
            "error_message": last_sync_log.error_message if last_sync_log else None,
            "total_records": MarketPrice.objects.count(),
            "mandya_records": MarketPrice.objects.filter(district__iexact='Mandya').count(),
            "latest_report_date": latest_record.market_report_date.isoformat() if latest_record else None,
            "is_stale": (today - latest_record.market_report_date).days > 1 if (latest_record and latest_record.market_report_date) else True,
            "districts": districts,
            "commodities": commodities,
        })


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
    permission_classes = [permissions.IsAuthenticated]

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
    permission_classes = [permissions.IsAuthenticated]

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
    permission_classes = [permissions.IsAuthenticated]

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
    permission_classes = [permissions.IsAuthenticated]

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

