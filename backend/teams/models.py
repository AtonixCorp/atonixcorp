from django.db import models
from django.utils import timezone


class Team(models.Model):
    """Model for AtonixCorp teams"""
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=200, unique=True)
    mission = models.TextField()
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='teams/', blank=True, null=True)
    color_theme = models.CharField(max_length=7, default='#007bff')  # Hex color
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class TeamMember(models.Model):
    """Team members"""
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='members')
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='team_members/', blank=True, null=True)
    email = models.EmailField(blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    is_lead = models.BooleanField(default=False)
    join_date = models.DateField(default=timezone.now)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-is_lead', 'order', 'name']

    def __str__(self):
        return f"{self.name} - {self.team.name}"


class TeamSkill(models.Model):
    """Skills associated with teams"""
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    proficiency_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
            ('expert', 'Expert'),
        ],
        default='intermediate'
    )

    class Meta:
        unique_together = ['team', 'name']

    def __str__(self):
        return f"{self.team.name} - {self.name}"
