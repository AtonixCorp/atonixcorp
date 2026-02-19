from django.apps import AppConfig


class ServicesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'services'
    verbose_name = 'AtonixCorp Cloud Services'

    def ready(self):
        """Register signal handlers when app is ready."""
        import services.signals  # noqa: F401
