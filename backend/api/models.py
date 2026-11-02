import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Profile(models.Model):
    OWNER_STATUS_CHOICES = [
        ('none', 'None'),
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    village = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(max_length=255, blank=True, null=True)
    district = models.CharField(max_length=255, blank=True, null=True)
    avatar_url = models.URLField(max_length=1024, blank=True, null=True)
    is_owner = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    owner_status = models.CharField(max_length=20, choices=OWNER_STATUS_CHOICES, default='none')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name or self.user.username} ({self.user.email})"


class Equipment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='equipment_listings')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    image_url = models.URLField(max_length=1024, blank=True, null=True)
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.category}"


class OwnerRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='owner_requests')
    equipment_name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    photos = models.TextField(blank=True, null=True)  # comma separated or JSON string
    price = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Request by {self.user} for {self.equipment_name} ({self.status})"


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='bookings')
    farmer = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='my_bookings')
    start_date = models.DateField()
    end_date = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Booking #{self.id} - {self.equipment.name} by {self.farmer}"


class Advertisement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    banner_image_url = models.URLField(max_length=1024, blank=True, null=True)
    cta_text = models.CharField(max_length=100, default='Learn More')
    external_link = models.URLField(max_length=1024, default='https://novaagri.in/nova-agri-seeds/')
    badge_text = models.CharField(max_length=50, default='Sponsored')
    is_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Reel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100)
    video_url = models.URLField(max_length=1024)
    thumbnail_url = models.URLField(max_length=1024, blank=True, null=True)
    views_count = models.IntegerField(default=0)
    likes_count = models.IntegerField(default=0)
    author_name = models.CharField(max_length=255, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class WeatherCache(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    village_name = models.CharField(max_length=255, unique=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    temp_celsius = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    humidity_pct = models.IntegerField(blank=True, null=True)
    wind_speed_kmh = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    rain_probability_pct = models.IntegerField(blank=True, null=True)
    ai_recommendation = models.TextField(blank=True, null=True)
    cached_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Weather Cache for {self.village_name}"


class MarketPrice(models.Model):
    RECOMMENDATION_CHOICES = [
        ('HOLD', 'Hold'),
        ('SELL NOW', 'Sell Now'),
        ('WATCH', 'Watch'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    crop_name = models.CharField(max_length=255, db_index=True)
    crop_name_kn = models.CharField(max_length=255, blank=True, null=True)
    variety = models.CharField(max_length=255, default='Common / Local')
    grade = models.CharField(max_length=100, default='FAQ')
    category = models.CharField(max_length=100, default='General', db_index=True)
    mandi_name = models.CharField(max_length=255, db_index=True)
    district = models.CharField(max_length=255, default='Mandya', db_index=True)
    state = models.CharField(max_length=255, default='Karnataka', db_index=True)

    min_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    max_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    modal_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    today_price = models.DecimalField(max_digits=10, decimal_places=2)  # Modal price alias for compatibility
    predicted_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_change_pct = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    price_unit = models.CharField(max_length=50, default='₹/Quintal')
    recommendation = models.CharField(max_length=20, choices=RECOMMENDATION_CHOICES, default='HOLD')
    recommendation_reason = models.TextField(blank=True, null=True)
    confidence_score = models.IntegerField(default=85)

    market_report_date = models.DateField(default=timezone.now, db_index=True)
    price_date = models.DateField(default=timezone.now, db_index=True)
    source_name = models.CharField(max_length=255, default='AGMARKNET (agmarknet.gov.in)')
    source_record_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    fetched_at = models.DateTimeField(default=timezone.now)
    is_stale = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-market_report_date', '-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['crop_name', 'variety', 'mandi_name', 'district', 'state', 'market_report_date'],
                name='unique_mandi_commodity_date_record'
            )
        ]

    def __str__(self):
        return f"{self.crop_name} @ {self.mandi_name} ({self.market_report_date}): ₹{self.modal_price or self.today_price}"


class PestReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(Profile, on_delete=models.SET_NULL, blank=True, null=True, related_name='pest_reports')
    crop_name = models.CharField(max_length=255)
    disease_name = models.CharField(max_length=255)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    organic_solution = models.TextField(blank=True, null=True)
    chemical_solution = models.TextField(blank=True, null=True)
    outbreak_risk_pct = models.IntegerField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    image_url = models.URLField(max_length=1024, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Pest Report: {self.disease_name} on {self.crop_name}"


class OfficialPestAlert(models.Model):
    SOURCE_CHOICES = [
        ('UAS_BANGALORE', 'University of Agricultural Sciences, Bengaluru (UASB)'),
        ('ICAR', 'Indian Council of Agricultural Research (ICAR)'),
        ('RAITAMITRA_KSDA', 'Karnataka Department of Agriculture / Raitamitra (KSDA)'),
    ]

    SEVERITY_CHOICES = [
        ('LOW', 'Low Risk / Advisory'),
        ('MODERATE', 'Moderate Risk / Alert'),
        ('HIGH', 'High Outbreak Risk'),
        ('CRITICAL', 'Critical Epidemic Alert'),
    ]

    REVIEW_CHOICES = [
        ('VERIFIED', 'Verified Official Advisory'),
        ('PENDING_REVIEW', 'Pending Expert Verification'),
        ('EXPIRED', 'Expired / Archived'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_id = models.CharField(max_length=255, unique=True, db_index=True)
    source_org = models.CharField(max_length=50, choices=SOURCE_CHOICES, db_index=True)
    title = models.CharField(max_length=500)
    description = models.TextField()
    crop = models.CharField(max_length=100, db_index=True)
    crop_display = models.CharField(max_length=255, default='All Crops / ಎಲ್ಲಾ ಬೆಳೆಗಳು')
    pest_name = models.CharField(max_length=255, db_index=True)
    scientific_name = models.CharField(max_length=255, blank=True, null=True)
    district = models.CharField(max_length=100, default='All Karnataka', db_index=True)
    region = models.CharField(max_length=255, blank=True, null=True)
    symptoms = models.TextField(blank=True, null=True)
    preventive_measures = models.TextField(blank=True, null=True)
    chemical_treatment = models.TextField(blank=True, null=True)
    organic_treatment = models.TextField(blank=True, null=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='MODERATE')
    source_url = models.URLField(max_length=1024)
    document_url = models.URLField(max_length=1024, blank=True, null=True)
    publication_date = models.DateField(null=True, blank=True, db_index=True)
    retrieved_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateField(null=True, blank=True, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    is_weather_risk = models.BooleanField(default=False)
    review_status = models.CharField(max_length=30, choices=REVIEW_CHOICES, default='VERIFIED')
    confidence_score = models.FloatField(default=1.0)
    content_kn = models.TextField(blank=True, null=True)
    content_en = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-publication_date', '-created_at']

    def __str__(self):
        return f"[{self.source_org}] {self.pest_name} on {self.crop} ({self.district})"


class SourceSyncLog(models.Model):
    STATUS_CHOICES = [
        ('SUCCESS', 'Success'),
        ('PARTIAL', 'Partial Success'),
        ('FAILED', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_org = models.CharField(max_length=50, db_index=True)
    access_method = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUCCESS')
    items_synced = models.IntegerField(default=0)
    items_new = models.IntegerField(default=0)
    last_sync = models.DateTimeField(default=timezone.now)
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-last_sync']

    def __str__(self):
        return f"{self.source_org} sync at {self.last_sync} ({self.status})"

