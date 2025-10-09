from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('webhooks', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='webhooksubscription',
            name='secret_ref',
            field=models.CharField(max_length=1024, blank=True, default=''),
        ),
    ]
