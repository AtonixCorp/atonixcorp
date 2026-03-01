# Generated migration: add cloud_type, connectivity_type, vpn_gateway_ip, tenant_isolation fields to CloudRegion

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('regions', '0002_seed_regions'),
    ]

    operations = [
        migrations.AddField(
            model_name='cloudregion',
            name='cloud_type',
            field=models.CharField(
                max_length=16,
                choices=[
                    ('public',  'Public Cloud'),
                    ('private', 'Private Cloud'),
                    ('hybrid',  'Hybrid Cloud'),
                ],
                default='public',
                db_index=True,
                help_text='Deployment model: public multi-tenant, private dedicated, or hybrid',
            ),
        ),
        migrations.AddField(
            model_name='cloudregion',
            name='connectivity_type',
            field=models.CharField(
                max_length=20,
                choices=[
                    ('internet',       'Public Internet'),
                    ('vpn',            'VPN Tunnel'),
                    ('direct_connect', 'Direct Connect'),
                    ('peering',        'Cloud Peering'),
                ],
                default='internet',
                help_text='How this region is accessed from other regions or customer datacenters',
            ),
        ),
        migrations.AddField(
            model_name='cloudregion',
            name='vpn_gateway_ip',
            field=models.GenericIPAddressField(
                null=True,
                blank=True,
                help_text='VPN gateway IP for hybrid/private connectivity',
            ),
        ),
        migrations.AddField(
            model_name='cloudregion',
            name='tenant_isolation',
            field=models.BooleanField(
                default=False,
                help_text='Enforce strict per-project resource isolation (private/hybrid)',
            ),
        ),
    ]
