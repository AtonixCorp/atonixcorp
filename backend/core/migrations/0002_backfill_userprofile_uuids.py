# Data migration skeleton to backfill UserProfile uuids for existing users
from django.db import migrations
import uuid


def forwards_func(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    UserProfile = apps.get_model('core', 'UserProfile')

    for user in User.objects.all():
        profile, created = UserProfile.objects.get_or_create(user_id=user.id)
        if created or not profile.uuid:
            profile.uuid = uuid.uuid4()
            profile.save()


def reverse_func(apps, schema_editor):
    # Optional: do not delete UUIDs on reverse
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_add_userprofile_and_editorialasset'),
    ]

    operations = [
        migrations.RunPython(forwards_func, reverse_func),
    ]
