"""
Core Django app for shared utilities and Zookeeper integration.
"""
from django.apps import AppConfig


class CoreConfig(AppConfig):
    """Configuration for the core app."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'
    verbose_name = 'Core'
    
    def ready(self):
        """Initialize core app components."""
        # Import signal handlers or other startup code here if needed
        pass