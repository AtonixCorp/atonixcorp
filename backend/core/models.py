from django.db import models
import uuid
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    # GPG fields for per-user keypair
    gpg_fingerprint = models.CharField(max_length=255, blank=True, null=True)
    gpg_public_key = models.TextField(blank=True, null=True)
    # Encrypted private key (store ciphertext, never store plaintext in DB)
    gpg_private_key_encrypted = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profile for {self.user.username}"


class EditorialAsset(models.Model):
    ASSET_TYPES = [
        ('news', 'News Article'),
        ('legal', 'Legal Summary'),
        ('report', 'Report'),
        ('announcement', 'Announcement'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    content = models.TextField()
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPES, default='other')
    author = models.CharField(max_length=255, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)  # List of UUIDs or strings
    metadata = models.JSONField(default=dict, blank=True)  # Additional metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.asset_type})"