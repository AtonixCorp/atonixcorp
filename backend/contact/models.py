from django.db import models
from django.utils import timezone


class ContactPerson(models.Model):
    """Key contact people at AtonixCorp"""
    name = models.CharField(max_length=200)
    title = models.CharField(max_length=200)
    department = models.CharField(max_length=200, blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='contacts/', blank=True, null=True)
    linkedin_url = models.URLField(blank=True)
    is_primary = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-is_primary', 'order', 'name']

    def __str__(self):
        return f"{self.name} - {self.title}"


class ContactMessage(models.Model):
    """Messages sent through contact forms"""
    name = models.CharField(max_length=200)
    email = models.EmailField()
    subject = models.CharField(max_length=300)
    message = models.TextField()
    company = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    message_type = models.CharField(
        max_length=50,
        choices=[
            ('general', 'General Inquiry'),
            ('partnership', 'Partnership'),
            ('support', 'Technical Support'),
            ('career', 'Career Opportunity'),
            ('media', 'Media Inquiry'),
            ('other', 'Other'),
        ],
        default='general'
    )
    priority = models.CharField(
        max_length=20,
        choices=[
            ('low', 'Low'),
            ('normal', 'Normal'),
            ('high', 'High'),
            ('urgent', 'Urgent'),
        ],
        default='normal'
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('new', 'New'),
            ('in_progress', 'In Progress'),
            ('resolved', 'Resolved'),
            ('closed', 'Closed'),
        ],
        default='new'
    )
    assigned_to = models.ForeignKey(
        ContactPerson, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_messages'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.subject}"


class OfficeLocation(models.Model):
    """Office locations"""
    name = models.CharField(max_length=200)
    address_line_1 = models.CharField(max_length=200)
    address_line_2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    is_headquarters = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.city}, {self.country}"
