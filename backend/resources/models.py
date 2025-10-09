from django.db import models
from django.utils import timezone


class ResourceCategory(models.Model):
    """Categories for resources"""
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = "Resource Categories"

    def __str__(self):
        return self.name


class Resource(models.Model):
    """Model for resources like guidelines, documentation, etc."""
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    category = models.ForeignKey(ResourceCategory, on_delete=models.CASCADE, related_name='resources')
    description = models.TextField()
    content = models.TextField(blank=True)
    resource_type = models.CharField(
        max_length=20,
        choices=[
            ('guideline', 'Guideline'),
            ('documentation', 'Documentation'),
            ('tutorial', 'Tutorial'),
            ('template', 'Template'),
            ('tool', 'Tool'),
            ('link', 'External Link'),
        ],
        default='guideline'
    )
    external_url = models.URLField(blank=True)
    file_attachment = models.FileField(upload_to='resources/', blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)
    is_featured = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', '-created_at']

    def __str__(self):
        return self.title


class CommunityLink(models.Model):
    """Social media and community links"""
    platform = models.CharField(max_length=100)
    name = models.CharField(max_length=200)
    url = models.URLField()
    icon = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'platform']

    def __str__(self):
        return f"{self.platform} - {self.name}"


class FAQ(models.Model):
    """Frequently Asked Questions"""
    question = models.CharField(max_length=500)
    answer = models.TextField()
    category = models.CharField(max_length=100, blank=True)
    is_featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', 'order']

    def __str__(self):
        return self.question
