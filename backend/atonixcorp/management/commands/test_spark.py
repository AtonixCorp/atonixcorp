from django.core.management.base import BaseCommand
import logging

from atonixcorp.spark import get_spark_session, stop_spark_session

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Start a SparkSession and print basic info to verify connectivity'

    def add_arguments(self, parser):
        parser.add_argument('--master', help='Spark master URL (overrides SPARK_MASTER env)')
        parser.add_argument('--app-name', help='Spark app name (overrides SPARK_APP_NAME)')

    def handle(self, *args, **options):
        master = options.get('master')
        app_name = options.get('app_name')

        self.stdout.write('Starting SparkSession...')
        spark = None
        try:
            spark = get_spark_session(app_name=app_name, master=master)
            sc = spark.sparkContext
            self.stdout.write(f'Spark version: {sc.version}')
            self.stdout.write(f'Master: {sc.master}')
            self.stdout.write(f'App name: {sc.appName}')
            # Simple parallelize test
            rdd = sc.parallelize([1, 2, 3, 4, 5])
            s = rdd.sum()
            self.stdout.write(f'RDD sum test succeeded: {s}')
        except Exception as exc:
            logger.exception('Spark test failed')
            self.stderr.write(str(exc))
        finally:
            if spark:
                stop_spark_session(spark)
                self.stdout.write('SparkSession stopped')
