# Data migration skeleton to populate schedule uuid_temp values
from django.db import migrations
import uuid


def forwards_func(apps, schema_editor):
    ScheduleItem = apps.get_model('scheduling', 'ScheduleItem')

    for item in ScheduleItem.objects.all():
        if not getattr(item, 'uuid_temp', None):
            item.uuid_temp = uuid.uuid4()
            item.save()


def reverse_func(apps, schema_editor):
    # Optional: cleanup
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('scheduling', '0001_add_uuid_pk'),
    ]

    operations = [
        migrations.RunPython(forwards_func, reverse_func),
    ]
