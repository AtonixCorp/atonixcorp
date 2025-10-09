from django.db import models
from django.utils import timezone


class FocusArea(models.Model):
    """Model for AtonixCorp focus areas"""
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    detailed_description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    image = models.ImageField(upload_to='focus_areas/', blank=True, null=True)
    color_theme = models.CharField(max_length=7, default='#007bff')  # Hex color
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class FocusAreaTechnology(models.Model):
    """Technologies used in focus areas"""
    focus_area = models.ForeignKey(FocusArea, on_delete=models.CASCADE, related_name='technologies')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    website_url = models.URLField(blank=True)

    class Meta:
        unique_together = ['focus_area', 'name']

    def __str__(self):
        return f"{self.focus_area.name} - {self.name}"


class FocusAreaSolution(models.Model):
    """Solutions provided in each focus area"""
    focus_area = models.ForeignKey(FocusArea, on_delete=models.CASCADE, related_name='solutions')
    title = models.CharField(max_length=200)
    description = models.TextField()
    benefits = models.JSONField(default=list, blank=True)
    use_cases = models.JSONField(default=list, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.focus_area.name} - {self.title}"
