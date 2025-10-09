# Generated migration stub — add UserProfile and EditorialAsset
from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    initial = False

    dependencies = [
        # Update these to match your project's migration history
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.OneToOneField(on_delete=models.CASCADE, to='auth.user')),
            ],
        ),
        migrations.CreateModel(
            name='EditorialAsset',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('title', models.CharField(max_length=255)),
                ('content', models.TextField()),
                ('asset_type', models.CharField(default='other', max_length=20)),
                ('author', models.CharField(blank=True, max_length=255)),
                ('published_at', models.DateTimeField(blank=True, null=True)),
                ('tags', models.JSONField(default=list, blank=True)),
                ('metadata', models.JSONField(default=dict, blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),

        # Data migration skeletons could be added here using RunPython
    ]
