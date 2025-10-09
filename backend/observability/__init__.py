"""
OpenTelemetry configuration and initialization for AtonixCorp platform.
"""

import os
import logging
from typing import Optional

from opentelemetry import trace, metrics
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader, ConsoleMetricExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.semconv.resource import ResourceAttributes
from opentelemetry.instrumentation.django import DjangoInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.urllib3 import URLLib3Instrumentor
from opentelemetry.instrumentation.psycopg2 import Psycopg2Instrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
from opentelemetry.instrumentation.celery import CeleryInstrumentor

# Conditional imports for exporters
try:
    from opentelemetry.exporter.jaeger.thrift import JaegerExporter
    HAS_JAEGER = True
except ImportError:
    HAS_JAEGER = False

try:
    from opentelemetry.exporter.prometheus import PrometheusMetricReader
    from prometheus_client import start_http_server
    HAS_PROMETHEUS = True
except ImportError:
    HAS_PROMETHEUS = False

try:
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
    from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
    HAS_OTLP = True
except ImportError:
    HAS_OTLP = False

logger = logging.getLogger(__name__)


class OpenTelemetryConfig:
    """OpenTelemetry configuration and initialization."""
    
    def __init__(self):
        self.service_name = os.getenv('OTEL_SERVICE_NAME', 'atonixcorp-platform')
        self.service_version = os.getenv('OTEL_SERVICE_VERSION', '1.0.0')
        self.environment = os.getenv('ENVIRONMENT', 'development')
        self.jaeger_endpoint = os.getenv('JAEGER_ENDPOINT', 'http://localhost:14268/api/traces')
        self.otlp_endpoint = os.getenv('OTEL_EXPORTER_OTLP_ENDPOINT', 'http://localhost:4317')
        self.prometheus_port = int(os.getenv('PROMETHEUS_METRICS_PORT', '8000'))
        self.enable_console_export = os.getenv('OTEL_ENABLE_CONSOLE', 'false').lower() == 'true'
        self.enable_jaeger = os.getenv('OTEL_ENABLE_JAEGER', 'true').lower() == 'true'
        self.enable_prometheus = os.getenv('OTEL_ENABLE_PROMETHEUS', 'true').lower() == 'true'
        self.enable_otlp = os.getenv('OTEL_ENABLE_OTLP', 'false').lower() == 'true'
        
        # Initialize components
        self.resource = self._create_resource()
        self.tracer_provider: Optional[TracerProvider] = None
        self.meter_provider: Optional[MeterProvider] = None
        
    def _create_resource(self) -> Resource:
        """Create OpenTelemetry resource with service information."""
        return Resource.create({
            ResourceAttributes.SERVICE_NAME: self.service_name,
            ResourceAttributes.SERVICE_VERSION: self.service_version,
            ResourceAttributes.DEPLOYMENT_ENVIRONMENT: self.environment,
            ResourceAttributes.SERVICE_NAMESPACE: 'atonixcorp',
            ResourceAttributes.SERVICE_INSTANCE_ID: os.getenv('HOSTNAME', 'unknown'),
            # Kubernetes attributes if available
            ResourceAttributes.K8S_NAMESPACE_NAME: os.getenv('K8S_NAMESPACE'),
            ResourceAttributes.K8S_POD_NAME: os.getenv('K8S_POD_NAME'),
            ResourceAttributes.K8S_DEPLOYMENT_NAME: os.getenv('K8S_DEPLOYMENT_NAME'),
            # Container attributes
            ResourceAttributes.CONTAINER_NAME: os.getenv('CONTAINER_NAME'),
            ResourceAttributes.CONTAINER_ID: os.getenv('CONTAINER_ID'),
        })
    
    def _setup_tracing(self) -> TracerProvider:
        """Set up OpenTelemetry tracing."""
        tracer_provider = TracerProvider(resource=self.resource)
        
        # Console exporter for development
        if self.enable_console_export:
            console_exporter = ConsoleSpanExporter()
            console_processor = BatchSpanProcessor(console_exporter)
            tracer_provider.add_span_processor(console_processor)
            logger.info("Added console span exporter")
        
        # Jaeger exporter
        if self.enable_jaeger and HAS_JAEGER:
            try:
                jaeger_exporter = JaegerExporter(
                    agent_host_name=os.getenv('JAEGER_AGENT_HOST', 'localhost'),
                    agent_port=int(os.getenv('JAEGER_AGENT_PORT', '6831')),
                    collector_endpoint=self.jaeger_endpoint,
                )
                jaeger_processor = BatchSpanProcessor(jaeger_exporter)
                tracer_provider.add_span_processor(jaeger_processor)
                logger.info(f"Added Jaeger span exporter: {self.jaeger_endpoint}")
            except Exception as e:
                logger.warning(f"Failed to setup Jaeger exporter: {e}")
        
        # OTLP exporter
        if self.enable_otlp and HAS_OTLP:
            try:
                otlp_exporter = OTLPSpanExporter(
                    endpoint=self.otlp_endpoint,
                    headers=self._get_otlp_headers(),
                )
                otlp_processor = BatchSpanProcessor(otlp_exporter)
                tracer_provider.add_span_processor(otlp_processor)
                logger.info(f"Added OTLP span exporter: {self.otlp_endpoint}")
            except Exception as e:
                logger.warning(f"Failed to setup OTLP exporter: {e}")
        
        return tracer_provider
    
    def _setup_metrics(self) -> MeterProvider:
        """Set up OpenTelemetry metrics."""
        readers = []
        
        # Console exporter for development
        if self.enable_console_export:
            console_reader = PeriodicExportingMetricReader(
                ConsoleMetricExporter(),
                export_interval_millis=30000,
            )
            readers.append(console_reader)
            logger.info("Added console metric exporter")
        
        # Prometheus exporter
        if self.enable_prometheus and HAS_PROMETHEUS:
            try:
                prometheus_reader = PrometheusMetricReader()
                readers.append(prometheus_reader)
                
                # Start Prometheus HTTP server
                start_http_server(self.prometheus_port)
                logger.info(f"Started Prometheus metrics server on port {self.prometheus_port}")
            except Exception as e:
                logger.warning(f"Failed to setup Prometheus exporter: {e}")
        
        # OTLP exporter
        if self.enable_otlp and HAS_OTLP:
            try:
                otlp_metric_exporter = OTLPMetricExporter(
                    endpoint=self.otlp_endpoint,
                    headers=self._get_otlp_headers(),
                )
                otlp_reader = PeriodicExportingMetricReader(
                    otlp_metric_exporter,
                    export_interval_millis=30000,
                )
                readers.append(otlp_reader)
                logger.info(f"Added OTLP metric exporter: {self.otlp_endpoint}")
            except Exception as e:
                logger.warning(f"Failed to setup OTLP metric exporter: {e}")
        
        return MeterProvider(resource=self.resource, metric_readers=readers)
    
    def _get_otlp_headers(self) -> dict:
        """Get OTLP headers from environment."""
        headers = {}
        auth_header = os.getenv('OTEL_EXPORTER_OTLP_HEADERS')
        if auth_header:
            for header in auth_header.split(','):
                if '=' in header:
                    key, value = header.split('=', 1)
                    headers[key.strip()] = value.strip()
        return headers
    
    def initialize(self):
        """Initialize OpenTelemetry providers and instrumentations."""
        logger.info(f"Initializing OpenTelemetry for {self.service_name} v{self.service_version}")
        
        # Set up tracing
        self.tracer_provider = self._setup_tracing()
        trace.set_tracer_provider(self.tracer_provider)
        
        # Set up metrics
        self.meter_provider = self._setup_metrics()
        metrics.set_meter_provider(self.meter_provider)
        
        # Initialize instrumentations
        self._setup_instrumentations()
        
        logger.info("OpenTelemetry initialization completed")
    
    def _setup_instrumentations(self):
        """Set up automatic instrumentations."""
        try:
            # Django instrumentation
            DjangoInstrumentor().instrument()
            logger.info("Django instrumentation enabled")
            
            # HTTP client instrumentations
            RequestsInstrumentor().instrument()
            URLLib3Instrumentor().instrument()
            logger.info("HTTP client instrumentations enabled")
            
            # Database instrumentations
            try:
                Psycopg2Instrumentor().instrument()
                logger.info("PostgreSQL instrumentation enabled")
            except Exception as e:
                logger.debug(f"PostgreSQL instrumentation not available: {e}")
            
            # Redis instrumentation
            try:
                RedisInstrumentor().instrument()
                logger.info("Redis instrumentation enabled")
            except Exception as e:
                logger.debug(f"Redis instrumentation not available: {e}")
            
            # Celery instrumentation
            try:
                CeleryInstrumentor().instrument()
                logger.info("Celery instrumentation enabled")
            except Exception as e:
                logger.debug(f"Celery instrumentation not available: {e}")
                
        except Exception as e:
            logger.error(f"Error setting up instrumentations: {e}")
    
    def get_tracer(self, name: str = None):
        """Get a tracer instance."""
        return trace.get_tracer(name or self.service_name)
    
    def get_meter(self, name: str = None):
        """Get a meter instance."""
        return metrics.get_meter(name or self.service_name)


# Global configuration instance
otel_config = OpenTelemetryConfig()


def initialize_opentelemetry():
    """Initialize OpenTelemetry for the application."""
    if os.getenv('OTEL_ENABLED', 'true').lower() == 'true':
        otel_config.initialize()
    else:
        logger.info("OpenTelemetry is disabled")


def get_tracer(name: str = None):
    """Get a tracer instance."""
    return otel_config.get_tracer(name)


def get_meter(name: str = None):
    """Get a meter instance."""
    return otel_config.get_meter(name)