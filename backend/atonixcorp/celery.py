"""
Celery Configuration for AtonixCorp Platform
"""
import os
from celery import Celery
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'atonixcorp.settings')

app = Celery('atonixcorp')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Configure Celery Beat Schedule
app.conf.beat_schedule = {
    'update-dashboard-stats': {
        'task': 'dashboard.tasks.update_dashboard_stats',
        'schedule': 300.0,  # Run every 5 minutes
    },
    'cleanup-expired-sessions': {
        'task': 'dashboard.tasks.cleanup_expired_sessions',
        'schedule': 3600.0,  # Run every hour
    },
    'send-weekly-digest': {
        'task': 'dashboard.tasks.send_weekly_digest',
        'schedule': 604800.0,  # Run weekly
    },
}

app.conf.timezone = 'UTC'

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')