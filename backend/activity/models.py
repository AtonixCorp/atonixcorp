from django.db import models
from django.conf import settings


class ActivityLog(models.Model):
    """Stores user activity events captured from the frontend or other clients."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='+'
    )
    event_type = models.CharField(max_length=128, db_index=True)
    event_name = models.CharField(max_length=256, blank=True)
    payload = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Activity Log"
        verbose_name_plural = "Activity Logs"

    def __str__(self):
        user = self.user.username if self.user else 'anonymous'
        return f"{self.created_at.isoformat()} {user} {self.event_type} {self.event_name}"
