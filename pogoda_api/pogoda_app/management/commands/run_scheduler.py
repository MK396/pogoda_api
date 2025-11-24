import logging

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.interval import IntervalTrigger
from django.conf import settings
from django.core.management.base import BaseCommand

from pogoda_app.utils import fetch_and_save_weather_data


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Uruchamia scheduler, który cyklicznie pobiera dane pogodowe."

    def handle(self, *args, **options):

        scheduler = BlockingScheduler(timezone=settings.TIME_ZONE)


        scheduler.add_job(
            fetch_and_save_weather_data,
            trigger=IntervalTrigger(minutes=30),
            id="fetch_weather_job",
            name="Pobieranie pogody co 30 minut",
            replace_existing=True,
        )



        try:
            fetch_and_save_weather_data()
            scheduler.start()
        except KeyboardInterrupt:
            scheduler.shutdown()