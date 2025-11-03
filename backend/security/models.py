from django.db import models
from django.core.exceptions import ValidationError
import ipaddress


class BlockedNetwork(models.Model):
    """Represents an IP or CIDR range blocked from auth flows."""
    value = models.CharField(max_length=64, unique=True, help_text="An IP address or CIDR range, e.g. 1.2.3.4 or 203.0.113.0/24")
    is_cidr = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Blocked IP / Network"
        verbose_name_plural = "Blocked IPs & Networks"

    def clean(self):
        # validate value as IPv4/IPv6 or CIDR
        try:
            if '/' in self.value:
                # CIDR
                ipaddress.ip_network(self.value)
                self.is_cidr = True
            else:
                ipaddress.ip_address(self.value)
                self.is_cidr = False
        except ValueError:
            raise ValidationError({
                'value': 'Enter a valid IP address or CIDR range.'
            })

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.value} {'(CIDR)' if self.is_cidr else ''} {'[inactive]' if not self.active else ''}"
