"""
AtonixCorp Multi-Region models.

Provides a queryable registry of cloud regions and availability zones,
with failover pairing and per-region service endpoint tracking.
"""
import uuid
from django.db import models

from ..core.base_models import TimeStampedModel


# ---------------------------------------------------------------------------
# Choices
# ---------------------------------------------------------------------------

REGION_STATUS_CHOICES = [
    ('active',       'Active'),
    ('degraded',     'Degraded'),
    ('maintenance',  'Maintenance'),
    ('unavailable',  'Unavailable'),
]

CLOUD_TYPE_CHOICES = [
    ('public',  'Public Cloud'),
    ('private', 'Private Cloud'),
    ('hybrid',  'Hybrid Cloud'),
]

CONNECTIVITY_TYPE_CHOICES = [
    ('internet',      'Public Internet'),
    ('vpn',           'VPN Tunnel'),
    ('direct_connect','Direct Connect'),
    ('peering',       'Cloud Peering'),
]

# Services available per cloud type — used by the service-catalog endpoint
SERVICE_CATALOG = {
    'public': [
        {'slug': 'compute',     'name': 'Virtual Machines', 'description': 'Self-service VM provisioning with floating IPs and quotas'},
        {'slug': 'storage',     'name': 'Block & Object Storage', 'description': 'Ceph-backed Cinder volumes, Swift object storage'},
        {'slug': 'networking',  'name': 'Virtual Networks', 'description': 'Neutron ML2/VXLAN tenant networks, security groups, floating IPs'},
        {'slug': 'lbaas',       'name': 'Load Balancing', 'description': 'Octavia-backed load balancers with health checks'},
        {'slug': 'dns',         'name': 'DNS Automation', 'description': 'Designate zones and record management integrated with Octavia'},
        {'slug': 'kubernetes',  'name': 'Managed Kubernetes', 'description': 'Multi-tenant k8s clusters via AtonixCorp Operator'},
        {'slug': 'database',    'name': 'Managed Databases', 'description': 'MySQL, PostgreSQL, Redis with automated backups'},
        {'slug': 'cdn',         'name': 'CDN', 'description': 'Edge caching and distribution for public workloads'},
    ],
    'private': [
        {'slug': 'compute',     'name': 'Dedicated VMs', 'description': 'Isolated compute in dedicated OpenStack projects'},
        {'slug': 'storage',     'name': 'Dedicated Volumes', 'description': 'Private Ceph pools for block storage and images'},
        {'slug': 'networking',  'name': 'Isolated Networks', 'description': 'Fully isolated Neutron networks with no shared resources'},
        {'slug': 'images',      'name': 'Private Image Registry', 'description': 'Glance image repository with tenant-scoped access'},
        {'slug': 'kubernetes',  'name': 'Dedicated Kubernetes', 'description': 'Single-tenant k8s clusters on dedicated nodes'},
        {'slug': 'rbac',        'name': 'Role-Based Access', 'description': 'Keystone + LDAP/SAML RBAC with project isolation'},
    ],
    'hybrid': [
        {'slug': 'compute',      'name': 'Burst Compute', 'description': 'Overflow workloads from on-premise to cloud'},
        {'slug': 'storage',      'name': 'Replicated Storage', 'description': 'Cross-region Ceph pool replication'},
        {'slug': 'networking',   'name': 'Hybrid Networking', 'description': 'VPNaaS or Direct Connect to customer datacenters'},
        {'slug': 'orchestration','name': 'Heat Orchestration', 'description': 'Deploy workloads across public/private regions via Heat templates'},
        {'slug': 'workflows',    'name': 'Mistral Workflows', 'description': 'Automated cross-cloud workflow execution'},
        {'slug': 'secrets',      'name': 'Barbican Secrets', 'description': 'TLS certificates, encryption keys, API tokens'},
        {'slug': 'observability','name': 'Unified Observability', 'description': 'Prometheus + Grafana + Loki across all cloud boundaries'},
    ],
}

FAILOVER_MODE_CHOICES = [
    ('active-active',  'Active–Active'),
    ('active-passive', 'Active–Passive'),
    ('cold-standby',   'Cold Standby'),
]

ZONE_STATUS_CHOICES = [
    ('available',    'Available'),
    ('impaired',     'Impaired'),
    ('unavailable',  'Unavailable'),
]


# ---------------------------------------------------------------------------
# CloudRegion
# ---------------------------------------------------------------------------

class CloudRegion(TimeStampedModel):
    """
    A distinct geographic region offered by the platform.
    Data is seeded via the ``0001_initial`` migration and can be
    extended dynamically through the API.
    """
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code         = models.CharField(max_length=32, unique=True, db_index=True,
                                    help_text='Short unique code, e.g. us-east-1')
    name         = models.CharField(max_length=128, help_text='Human-readable name')
    country      = models.CharField(max_length=64, blank=True)
    city         = models.CharField(max_length=64, blank=True)
    continent    = models.CharField(max_length=32, blank=True)
    latitude     = models.FloatField(null=True, blank=True)
    longitude    = models.FloatField(null=True, blank=True)
    status       = models.CharField(max_length=20, choices=REGION_STATUS_CHOICES, default='active', db_index=True)
    cloud_type   = models.CharField(
        max_length=16,
        choices=CLOUD_TYPE_CHOICES,
        default='public',
        db_index=True,
        help_text='Deployment model: public multi-tenant, private dedicated, or hybrid',
    )
    connectivity_type = models.CharField(
        max_length=20,
        choices=CONNECTIVITY_TYPE_CHOICES,
        default='internet',
        help_text='How this region is accessed from other regions or customer datacenters',
    )
    vpn_gateway_ip = models.GenericIPAddressField(
        null=True, blank=True,
        help_text='VPN gateway IP for hybrid/private connectivity',
    )
    tenant_isolation = models.BooleanField(
        default=False,
        help_text='Enforce strict per-project resource isolation (private/hybrid)',
    )
    is_default   = models.BooleanField(default=False,
                                       help_text='Whether this is the default region for new resources')
    # Availability stats (updated periodically by a background task)
    uptime_30d_pct  = models.FloatField(default=100.0)
    latency_ms      = models.FloatField(null=True, blank=True,
                                        help_text='Average inter-region latency observed from this region')
    # Services enabled in this region (JSON array of service slugs)
    enabled_services = models.JSONField(default=list,
                                        help_text='e.g. ["compute","storage","database","kubernetes"]')
    # API endpoint for this region
    api_endpoint  = models.URLField(blank=True)

    class Meta:
        ordering = ['continent', 'code']
        verbose_name = 'Cloud Region'

    def __str__(self):
        return f"{self.code} ({self.name})"


# ---------------------------------------------------------------------------
# AvailabilityZone
# ---------------------------------------------------------------------------

class AvailabilityZone(TimeStampedModel):
    """
    An isolated fault domain within a CloudRegion.
    """
    id      = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    region  = models.ForeignKey(CloudRegion, on_delete=models.CASCADE, related_name='zones')
    code    = models.CharField(max_length=8, help_text='e.g. a, b, c')
    name    = models.CharField(max_length=64, help_text='e.g. us-east-1a')
    status  = models.CharField(max_length=20, choices=ZONE_STATUS_CHOICES, default='available')

    class Meta:
        ordering = ['region__code', 'code']
        unique_together = ('region', 'code')
        verbose_name = 'Availability Zone'

    def __str__(self):
        return self.name if self.name else f"{self.region.code}{self.code}"


# ---------------------------------------------------------------------------
# RegionPeer
# ---------------------------------------------------------------------------

class RegionPeer(TimeStampedModel):
    """
    A directional failover relationship between two CloudRegions.

    ``primary`` fails over to ``secondary`` when the primary enters a
    degraded / unavailable state.
    """
    id               = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    primary          = models.ForeignKey(CloudRegion, on_delete=models.CASCADE,
                                         related_name='failover_pairs_as_primary')
    secondary        = models.ForeignKey(CloudRegion, on_delete=models.CASCADE,
                                         related_name='failover_pairs_as_secondary')
    mode             = models.CharField(max_length=20, choices=FAILOVER_MODE_CHOICES, default='active-passive')
    rto_minutes      = models.PositiveIntegerField(default=15,
                                                   help_text='Recovery Time Objective in minutes')
    rpo_minutes      = models.PositiveIntegerField(default=5,
                                                   help_text='Recovery Point Objective in minutes')
    is_active        = models.BooleanField(default=True)
    last_tested_at   = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('primary', 'secondary')
        verbose_name = 'Region Peer'

    def __str__(self):
        return f"{self.primary.code} → {self.secondary.code} [{self.mode}]"
