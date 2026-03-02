# Generated migration – 2026-03-02
# Adds GroupResourceRegistry, GroupConfigRegistry; extends group_type choices;
# extends GroupAuditLog action choices.

import django.db.models.deletion
import services.groups.models
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0018_delete_webhook'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # ── Extend group_type choices ─────────────────────────────────────────
        migrations.AlterField(
            model_name='group',
            name='group_type',
            field=models.CharField(
                choices=[
                    ('developer',  'Developer Group'),
                    ('enterprise', 'Enterprise Group'),
                    ('system',     'System Group'),
                    ('production', 'Production Group'),
                    ('marketing',  'Marketing Group'),
                    ('data',       'Data / Science Group'),
                    ('custom',     'Custom Group'),
                ],
                default='developer',
                max_length=30,
            ),
        ),

        # ── Extend GroupAuditLog action choices ───────────────────────────────
        migrations.AlterField(
            model_name='groupauditlog',
            name='action',
            field=models.CharField(
                choices=[
                    ('group_created',   'Group Created'),
                    ('group_updated',   'Group Updated'),
                    ('group_deleted',   'Group Deleted'),
                    ('member_added',    'Member Added'),
                    ('member_removed',  'Member Removed'),
                    ('member_updated',  'Member Role Updated'),
                    ('invite_sent',     'Invitation Sent'),
                    ('invite_accepted', 'Invitation Accepted'),
                    ('token_created',   'Token Created'),
                    ('token_revoked',   'Token Revoked'),
                    ('settings_changed','Settings Changed'),
                    ('resource_linked', 'Resource Linked'),
                    ('resource_removed','Resource Removed'),
                    ('config_indexed',  'Config File Indexed'),
                ],
                max_length=30,
            ),
        ),

        # ── GroupResourceRegistry ─────────────────────────────────────────────
        migrations.CreateModel(
            name='GroupResourceRegistry',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.CharField(
                    default=services.groups.models._uid_registry,
                    editable=False, max_length=40, primary_key=True, serialize=False,
                )),
                ('resource_type', models.CharField(
                    choices=[
                        ('project',       'Project'),
                        ('pipeline',      'CI/CD Pipeline'),
                        ('environment',   'Environment'),
                        ('container',     'Container'),
                        ('k8s_cluster',   'Kubernetes Cluster'),
                        ('secret',        'Secret'),
                        ('env_var',       'Environment Variable'),
                        ('deployment',    'Deployment'),
                        ('metric_stream', 'Metric Stream'),
                        ('log_stream',    'Log Stream'),
                        ('api_key',       'API Key / Token'),
                        ('storage',       'Storage Bucket'),
                        ('domain',        'Domain'),
                    ],
                    max_length=30,
                )),
                ('resource_id',   models.CharField(max_length=255)),
                ('resource_name', models.CharField(max_length=255)),
                ('resource_slug', models.CharField(blank=True, default='', max_length=255)),
                ('status', models.CharField(
                    choices=[
                        ('active',   'Active'),
                        ('inactive', 'Inactive'),
                        ('error',    'Error'),
                        ('pending',  'Pending'),
                    ],
                    default='active', max_length=20,
                )),
                ('region',      models.CharField(blank=True, default='', max_length=64)),
                ('environment', models.CharField(blank=True, default='', max_length=64)),
                ('tags',        models.JSONField(blank=True, default=list)),
                ('metadata',    models.JSONField(blank=True, default=dict)),
                ('discovered_at', models.DateTimeField(blank=True, null=True)),
                ('group', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='resource_registry',
                    to='services.group',
                )),
                ('linked_by', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='group_resource_links',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'db_table': 'groups_resource_registry',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='groupresourceregistry',
            constraint=models.UniqueConstraint(
                fields=['group', 'resource_type', 'resource_id'],
                name='unique_group_resource',
            ),
        ),
        migrations.AddIndex(
            model_name='groupresourceregistry',
            index=models.Index(fields=['group', 'resource_type'], name='grp_reg_type_idx'),
        ),
        migrations.AddIndex(
            model_name='groupresourceregistry',
            index=models.Index(fields=['group', 'status'], name='grp_reg_status_idx'),
        ),

        # ── GroupConfigRegistry ───────────────────────────────────────────────
        migrations.CreateModel(
            name='GroupConfigRegistry',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.CharField(
                    default=services.groups.models._uid_config,
                    editable=False, max_length=40, primary_key=True, serialize=False,
                )),
                ('project_id', models.CharField(blank=True, default='', max_length=255)),
                ('file_type', models.CharField(
                    choices=[
                        ('dockerfile',     'Dockerfile'),
                        ('pipeline_yaml',  'Pipeline YAML'),
                        ('k8s_manifest',   'Kubernetes Manifest'),
                        ('helm_chart',     'Helm Chart'),
                        ('terraform',      'Terraform / HCL'),
                        ('env_template',   '.env Template'),
                        ('buildpack',      'Cloud Buildpack'),
                        ('ansible',        'Ansible Playbook'),
                        ('compose',        'Docker Compose'),
                        ('config_generic', 'Generic Config'),
                    ],
                    max_length=30,
                )),
                ('file_name',        models.CharField(max_length=255)),
                ('file_path',        models.CharField(max_length=1024)),
                ('repo_url',         models.CharField(blank=True, default='', max_length=1024)),
                ('branch',           models.CharField(blank=True, default='main', max_length=255)),
                ('content_preview',  models.TextField(blank=True, default='')),
                ('sha',              models.CharField(blank=True, default='', max_length=64)),
                ('last_indexed_at',  models.DateTimeField(blank=True, null=True)),
                ('tags',             models.JSONField(blank=True, default=list)),
                ('group', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='config_registry',
                    to='services.group',
                )),
            ],
            options={
                'db_table': 'groups_config_registry',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='groupconfigregistry',
            index=models.Index(fields=['group', 'file_type'], name='grp_cfg_type_idx'),
        ),
        migrations.AddIndex(
            model_name='groupconfigregistry',
            index=models.Index(fields=['group', 'project_id'], name='grp_cfg_proj_idx'),
        ),
    ]
