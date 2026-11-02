from django.core.management.base import BaseCommand
from integrations.market_service import MarketDataSyncService
from api.models import MarketPrice, SourceSyncLog
import json

class Command(BaseCommand):
    help = 'Fetches official daily agricultural market prices from AGMARKNET / data.gov.in'

    def add_arguments(self, parser):
        parser.add_argument(
            '--state',
            type=str,
            default='Karnataka',
            help='State to fetch market records for (default: Karnataka)'
        )
        parser.add_argument(
            '--district',
            type=str,
            default='Mandya',
            help='District to prioritize (default: Mandya, or "all")'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force fetch regardless of last sync time'
        )

    def handle(self, *args, **options):
        state = options['state']
        district = options['district']
        force = options['force']

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"Starting agricultural market price fetch for {state} (District: {district})..."
        ))

        service = MarketDataSyncService()
        result = service.sync_market_prices(state=state, district=district, force=force)

        status = result.get('status', 'UNKNOWN')
        items_synced = result.get('items_synced', 0)
        items_new = result.get('items_new', 0)
        source = result.get('source', '')

        if status in ['SUCCESS', 'PARTIAL']:
            self.stdout.write(self.style.SUCCESS(
                f"Sync Completed [{status}]: {items_synced} records processed ({items_new} new) from {source}"
            ))
            if result.get('errors'):
                self.stdout.write(self.style.WARNING(f"Warnings/Notes: {'; '.join(result['errors'])}"))
        else:
            self.stdout.write(self.style.ERROR(
                f"Sync Failed: {result.get('error', 'Unknown failure')}"
            ))

        total_mandya = MarketPrice.objects.filter(district__iexact='Mandya').count()
        total_all = MarketPrice.objects.count()
        self.stdout.write(f"Database Status: {total_mandya} Mandya district records, {total_all} total records in DB.")
