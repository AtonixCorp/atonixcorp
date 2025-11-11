"""
Security configuration for Django settings
Add these settings to your Django settings.py file
"""

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================

# Encryption settings
ENCRYPTION_KEY = env('ENCRYPTION_KEY', default=None)  # Generate using Fernet.generate_key()
AES_PASSWORD = env('AES_PASSWORD', default='your-secure-aes-password-here')
AES_SALT = env('AES_SALT', default='your-secure-salt-here').encode()

# JWT settings
JWT_SECRET_KEY = env('JWT_SECRET_KEY', default=SECRET_KEY)
JWT_ACCESS_TOKEN_LIFETIME = 900  # 15 minutes
JWT_REFRESH_TOKEN_LIFETIME = 604800  # 7 days
JWT_ISSUER = 'atonixcorp-platform'

# Rate limiting settings
RATE_LIMIT_REQUESTS = 60  # requests per window
RATE_LIMIT_WINDOW = 60  # window in seconds
MAX_REQUEST_SIZE = 10 * 1024 * 1024  # 10MB

# Authentication settings
AUTH_MAX_ATTEMPTS = 5  # max failed login attempts
AUTH_LOCKOUT_TIME = 900  # lockout time in seconds (15 minutes)

# API Key settings
API_KEY_SALT = env('API_KEY_SALT', default='your-api-key-salt-here')

# Admin IP whitelist (empty list = no restrictions)
ADMIN_WHITELIST_IPS = env.list('ADMIN_WHITELIST_IPS', default=[])

# Security middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'security.middleware.SecurityMiddleware',  # Our custom security middleware
    'security.middleware.IPWhitelistMiddleware',  # IP whitelist for admin
    'security.middleware.RequestValidationMiddleware',  # Request validation
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# REST Framework security settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'security.authentication.JWTAuthentication',
        'security.api_keys.APIKeyAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    }
}

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
X_FRAME_OPTIONS = 'DENY'

# HTTPS settings (enable in production)
if env.bool('USE_HTTPS', default=False):
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

# Session security
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Strict'
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_COOKIE_AGE = 3600  # 1 hour

# CSRF protection
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Strict'
CSRF_USE_SESSIONS = True

# CORS settings (restrict in production)
CORS_ALLOW_ALL_ORIGINS = env.bool('CORS_ALLOW_ALL_ORIGINS', default=False)
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
])

# Optionally allow regex origins (useful for subdomains)
CORS_ALLOWED_ORIGIN_REGEXES = env.list('CORS_ALLOWED_ORIGIN_REGEXES', default=[])
# Allow credentials (cookies/auth) to be sent with cross-site requests when needed
CORS_ALLOW_CREDENTIALS = env.bool('CORS_ALLOW_CREDENTIALS', default=True)

# Content Security Policy (CSP) settings - configurable via environment variables.
# These defaults are conservative for a single-origin app. If your frontend needs
# inline scripts/styles or third-party domains (CDNs), add them explicitly via env.
CSP_DEFAULT_SRC = env.list('CSP_DEFAULT_SRC', default=["'self'"])
CSP_SCRIPT_SRC = env.list('CSP_SCRIPT_SRC', default=["'self'", "'unsafe-inline'", "'unsafe-eval'", ])
CSP_STYLE_SRC = env.list('CSP_STYLE_SRC', default=["'self'", "'unsafe-inline'", 'https:'])
CSP_IMG_SRC = env.list('CSP_IMG_SRC', default=["'self'", 'data:', 'https:'])
CSP_FONT_SRC = env.list('CSP_FONT_SRC', default=["'self'", 'data:'])
CSP_CONNECT_SRC = env.list('CSP_CONNECT_SRC', default=["'self'", ])
CSP_FRAME_ANCESTORS = env.list('CSP_FRAME_ANCESTORS', default=["'none'"])

# If your app loads scripts from trusted CDNs, configure them in CSP_SCRIPT_SRC
# For example: CSP_SCRIPT_SRC = ["'self'", 'https://cdn.jsdelivr.net']

# File upload security
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5MB
DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000

# Logging configuration for security events
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'security_file': {
            'level': 'WARNING',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'logs/security.log',
            'maxBytes': 10*1024*1024,  # 10MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'security': {
            'handlers': ['security_file', 'console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'django.security': {
            'handlers': ['security_file', 'console'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}

# Cache settings for security features
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': env('REDIS_URL', default='redis://localhost:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Database security
DATABASES['default']['OPTIONS'] = {
    'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
    'charset': 'utf8mb4',
    'autocommit': True,
}

# Email security (if using email)
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='noreply@atonixcorp.com')

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 12,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Additional security headers
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'