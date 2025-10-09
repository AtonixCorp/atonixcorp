# Generated migration stub — add UUID PK to ScheduleItem
from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    initial = False

    dependencies = [
        # Update with the real last migration for scheduling app
        ('scheduling', '0001_initial'),
    ]

    operations = [
        # This migration assumes the model currently has an integer PK.
        # If your model already has UUID PK, adjust accordingly.
        # We add a new UUID field, populate it, and then (optionally) set it as primary key.

        migrations.AddField(
            model_name='scheduleitem',
            name='uuid_temp',
            field=models.UUIDField(default=uuid.uuid4, editable=False, null=True),
        ),

        # Data migration to populate 'uuid_temp' for existing records should be implemented in a separate RunPython step.

        # NOTE: Do NOT drop or alter primary key automatically here. After verifying data and updating code to use the UUID, a follow-up migration can change the PK.
    ]
