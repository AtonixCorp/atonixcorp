from django.core.management.base import BaseCommand
import logging
import os

from atonixcorp.spark import get_spark_session, stop_spark_session

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Run the AtonixCorpAnalytics Spark job (reads CSV and prints sample rows)'

    def add_arguments(self, parser):
        parser.add_argument('--master', help='Spark master URL (overrides SPARK_MASTER env)')
        parser.add_argument('--app-name', help='Spark app name (overrides SPARK_APP_NAME)')
        parser.add_argument('--input', help='Path to CSV file (local or HDFS)')

    def handle(self, *args, **options):
        master = options.get('master')
        app_name = options.get('app_name') or 'AtonixCorpAnalytics'
        input_path = options.get('input') or os.path.join(os.getcwd(), 'data', 'transactions.csv')

        self.stdout.write(f'Starting Spark job: {app_name} master={master or os.environ.get("SPARK_MASTER")}')
        spark = None
        try:
            spark = get_spark_session(app_name=app_name, master=master)
            # Read CSV
            df = spark.read.csv(input_path, header=True, inferSchema=True)
            self.stdout.write('Schema:')
            df.printSchema()
            self.stdout.write('Sample rows:')
            df.show(10, truncate=False)
        except Exception as exc:
            logger.exception('AtonixCorp analytics job failed')
            self.stderr.write(str(exc))
        finally:
            if spark:
                stop_spark_session(spark)
                self.stdout.write('Spark job finished and session stopped')
