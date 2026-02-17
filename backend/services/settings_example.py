# AtonixCorp Services - Django Settings Configuration

"""
Add these configurations to your Django settings.py file
to enable and configure the cloud services platform.
"""

# ============================================================================
# INSTALLED APPS
# ============================================================================

INSTALLED_APPS = [
    # ... other apps ...
    'rest_framework',
    'django_filters',
    'corsheaders',
    'services',
]

# ============================================================================
# REST FRAMEWORK CONFIGURATION
# ============================================================================

REST_FRAMEWORK = {
    # Authentication classes
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'services.auth.APIKeyAuthentication',
        'services.auth.BearerTokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    
    # Permission classes
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    
    # Filtering & Pagination
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    
    # Throttling (rate limiting)
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
    },
    
    # Versioning
    'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.NamespaceVersioning',
    
    # Response formatting
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    
    # Error handling
    'EXCEPTION_HANDLER': 'services.exceptions.custom_exception_handler',
    
    # Metadata
    'DEFAULT_METADATA_CLASS': 'rest_framework.metadata.SimpleMetadata',
}

# ============================================================================
# CORS CONFIGURATION (for frontend access)
# ============================================================================

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:8000',
    'https://yourdomain.com',
]

CORS_ALLOW_CREDENTIALS = True

# ============================================================================
# SERVICES CONFIGURATION
# ============================================================================

# Service URL configuration
SERVICES_CONFIG = {
    'api_base_url': 'http://localhost:8000/api/v1',
    'api_prefix': '/services/',
    
    # Compute service settings
    'compute': {
        'default_region': 'us-west-2',
        'default_availability_zones': ['us-west-2a', 'us-west-2b', 'us-west-2c'],
        'enable_gpu': True,
        'max_instances_per_user': 100,
        'default_monitoring_interval': 60,  # seconds
    },
    
    # Storage service settings
    'storage': {
        'default_region': 'us-west-2',
        'enable_versioning': True,
        'enable_encryption': True,
        'encryption_algorithm': 'AES-256',
        'default_storage_class': 'standard',
        'max_bucket_size_gb': 1000,
        'max_object_size_gb': 5,
        'backup_retention_days': 30,
    },
    
    # Networking service settings
    'networking': {
        'default_region': 'us-west-2',
        'enable_flow_logs': True,
        'cdn_default_ttl': 3600,
        'cdn_max_ttl': 31536000,
        'load_balancer_idle_timeout': 60,
        'health_check_interval': 30,
    },
}

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'atonixcorp_services',
        'USER': 'postgres',
        'PASSWORD': 'your-password',
        'HOST': 'localhost',
        'PORT': '5432',
        'ATOMIC_REQUESTS': True,
        'CONN_MAX_AGE': 600,
    }
}

# ============================================================================
# CACHING CONFIGURATION (for metrics & temporary data)
# ============================================================================

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'CONNECTION_POOL_KWARGS': {'max_connections': 50},
        },
        'KEY_PREFIX': 'atonix',
        'TIMEOUT': 300,  # 5 minutes default
    }
}

# ============================================================================
# CELERY CONFIGURATION (for async tasks)
# ============================================================================

# Celery settings for background task processing
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes

# Celery task routing
CELERY_TASK_ROUTES = {
    'services.tasks.create_instance': {'queue': 'compute'},
    'services.tasks.create_bucket': {'queue': 'storage'},
    'services.tasks.create_vpc': {'queue': 'networking'},
}

# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s'
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'logs/services.log',
            'maxBytes': 1024 * 1024 * 10,  # 10MB
            'backupCount': 5,
            'formatter': 'json',
        },
        'file_errors': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'logs/services_errors.log',
            'maxBytes': 1024 * 1024 * 10,  # 10MB
            'backupCount': 5,
            'formatter': 'json',
            'level': 'ERROR',
        },
    },
    'loggers': {
        'services': {
            'handlers': ['console', 'file', 'file_errors'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'rest_framework': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# ============================================================================
# SECURITY SETTINGS
# ============================================================================

# HTTPS enforcement
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Content Security Policy
SECURE_CONTENT_SECURITY_POLICY = {
    'default-src': ("'self'",),
    'script-src': ("'self'", "'unsafe-inline'"),
    'style-src': ("'self'", "'unsafe-inline'"),
    'img-src': ("'self'", "data:", "https:"),
}

# CORS headers
CORS_EXPOSE_HEADERS = [
    'Content-Type',
    'X-CSRFToken',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
]

# ============================================================================
# API KEY SETTINGS
# ============================================================================

# API Key expiration (in days, None = never expires)
API_KEY_EXPIRATION_DAYS = 90

# API Key scopes available
API_KEY_SCOPES = [
    'compute:read',
    'compute:write',
    'storage:read',
    'storage:write',
    'networking:read',
    'networking:write',
    'admin',
]

# API Key creation restrictions
API_KEY_MAX_PER_USER = 5

# ============================================================================
# ROLE-BASED ACCESS CONTROL (RBAC)
# ============================================================================

RBAC_ROLES = {
    'admin': [
        'create_instance', 'delete_instance', 'create_bucket', 'delete_bucket',
        'create_vpc', 'delete_vpc', 'manage_users', 'view_logs'
    ],
    'developer': [
        'create_instance', 'modify_instance', 'create_bucket',
        'create_vpc', 'create_security_group'
    ],
    'viewer': [
        'list_instances', 'view_instance', 'list_buckets', 'view_bucket',
        'list_vpcs', 'view_vpc'
    ],
}

# ============================================================================
# MONITORING & METRICS
# ============================================================================

# Prometheus metrics collection
PROMETHEUS_METRICS_ENABLED = True
PROMETHEUS_METRICS_PORT = 9090

# CloudWatch/equivalent integration
METRICS_BACKEND = 'services.metrics.PrometheusBackend'
METRICS_INTERVAL = 60  # seconds

# Tracing (Jaeger)
JAEGER_ENABLED = True
JAEGER_CONFIG = {
    'sampler': {
        'type': 'const',
        'param': 1,
    },
    'local_agent': {
        'reporting_host': 'localhost',
        'reporting_port': 6831,
    },
}

# ============================================================================
# RESOURCE QUOTAS
# ============================================================================

DEFAULT_RESOURCE_QUOTAS = {
    'Instance': {
        'limit': 100,
        'warning_threshold': 80,  # percent
    },
    'StorageBucket': {
        'limit': 50,
        'warning_threshold': 80,
    },
    'VPC': {
        'limit': 10,
        'warning_threshold': 80,
    },
    'LoadBalancer': {
        'limit': 20,
        'warning_threshold': 80,
    },
}

# ============================================================================
# WEBHOOK CONFIGURATION
# ============================================================================

# Enable webhooks
WEBHOOKS_ENABLED = True

# Webhook timeout (seconds)
WEBHOOK_TIMEOUT = 30

# Webhook retry settings
WEBHOOK_MAX_RETRIES = 3
WEBHOOK_RETRY_DELAY = 300  # seconds

# ============================================================================
# FEATURE FLAGS
# ============================================================================

FEATURE_FLAGS = {
    'enable_auto_scaling': True,
    'enable_gpu_instances': True,
    'enable_spot_instances': False,  # Coming soon
    'enable_reserved_instances': False,  # Coming soon
    'enable_dedicated_hosts': False,  # Coming soon
}

# ============================================================================
# URLS CONFIGURATION
# ============================================================================

# In your main urls.py:
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/services/', include(('services.urls', 'services'), namespace='services')),
]
"""
