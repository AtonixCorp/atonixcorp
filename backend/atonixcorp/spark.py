import os
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)


def get_spark_conf_from_env() -> Dict[str, str]:
    """Read spark config from environment variables prefixed with SPARK_CONF_.

    Example: SPARK_CONF_spark.executor.memory=2g -> {'spark.executor.memory': '2g'}
    """
    conf = {}
    prefix = 'SPARK_CONF_'
    for k, v in os.environ.items():
        if k.startswith(prefix):
            conf_key = k[len(prefix):]
            # allow user to use dots by replacing '__' with '.' if desired
            conf_key = conf_key.replace('__', '.')
            conf[conf_key] = v
    return conf


def get_spark_session(app_name: Optional[str] = None, master: Optional[str] = None, extra_conf: Optional[Dict[str, str]] = None):
    """Create or return a SparkSession configured from environment variables.

    Environment variables used:
    - SPARK_MASTER (e.g. local[*] or spark://host:7077)
    - SPARK_APP_NAME
    - SPARK_CONF_<KEY> for arbitrary Spark configs (see get_spark_conf_from_env)
    """
    # Lazily import pyspark to avoid import errors when not installed
    try:
        from pyspark.sql import SparkSession
    except Exception as exc:  # pragma: no cover - runtime environment dependent
        logger.exception('Failed to import pyspark. Is pyspark installed?')
        raise

    app_name = app_name or os.environ.get('SPARK_APP_NAME', 'atonixcorp-app')
    master = master or os.environ.get('SPARK_MASTER', 'local[*]')

    builder = SparkSession.builder.appName(app_name)
    if master:
        builder = builder.master(master)

    # merge env conf and provided extra_conf
    conf = get_spark_conf_from_env()
    if extra_conf:
        conf.update(extra_conf)

    for k, v in conf.items():
        builder = builder.config(k, v)

    spark = builder.getOrCreate()
    logger.info('SparkSession created: app=%s master=%s', app_name, master)
    return spark


def stop_spark_session(spark):
    try:
        spark.stop()
        logger.info('SparkSession stopped')
    except Exception:
        logger.exception('Error stopping SparkSession')
