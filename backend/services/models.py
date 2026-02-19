# AtonixCorp Services - Model Registry
#
# Re-exports all models from domain-specific files so that
# `from .models import X` works across business_logic, signals, and tasks.

from .base_models import (
    TimeStampedModel,
    ResourceModel,
    Status,
    AuditLog,
    ResourceTag,
    ApiKey,
    ResourceQuota,
    Alert,
)

from .compute_models import (
    Flavor,
    Image,
    Instance,
    InstanceMetric,
    KubernetesCluster,
    KubernetesNode,
    ServerlessFunction,
    ServerlessFunctionTrigger,
    AutoScalingGroup,
    ScalingPolicy,
)

from .storage_models import (
    StorageBucket,
    S3Object,
    StorageVolume,
    StorageSnapshot,
    FileShare,
    FileShareMount,
    EncryptionKey,
    BackupPolicy,
    Backup,
    StorageMetric,
)

from .networking_models import (
    VPC,
    Subnet,
    SecurityGroup,
    SecurityGroupRule,
    LoadBalancer,
    TargetGroup,
    Listener,
    RouteTable,
    Route,
    DNSRecord,
    CDNDistribution,
    VPNGateway,
    CustomerGateway,
    VPNConnection,
    InternetGateway,
    NATGateway,
)

__all__ = [
    # Base
    'TimeStampedModel', 'ResourceModel', 'Status',
    'AuditLog', 'ResourceTag', 'ApiKey', 'ResourceQuota', 'Alert',
    # Compute
    'Flavor', 'Image', 'Instance', 'InstanceMetric',
    'KubernetesCluster', 'KubernetesNode',
    'ServerlessFunction', 'ServerlessFunctionTrigger',
    'AutoScalingGroup', 'ScalingPolicy',
    # Storage
    'StorageBucket', 'S3Object', 'StorageVolume', 'StorageSnapshot',
    'FileShare', 'FileShareMount', 'EncryptionKey',
    'BackupPolicy', 'Backup', 'StorageMetric',
    # Networking
    'VPC', 'Subnet', 'SecurityGroup', 'SecurityGroupRule',
    'LoadBalancer', 'TargetGroup', 'Listener',
    'RouteTable', 'Route',
    'DNSRecord', 'CDNDistribution',
    'VPNGateway', 'CustomerGateway', 'VPNConnection',
    'InternetGateway', 'NATGateway',
]
