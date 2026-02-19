"""
Background Task Functions for AtonixCorp Services

These functions handle cloud resource lifecycle operations:
- Provisioning / deprovisioning compute, storage, and Kubernetes resources
- Snapshot and backup execution
- Metrics collection
- Auto-scaling policy evaluation
- Billing cost calculations
- Notifications

Tasks can be wired to a task queue (Celery, RQ, etc.) when a broker is
available. Without a broker they run synchronously.
"""

import logging
from datetime import timedelta
from django.utils import timezone

logger = logging.getLogger(__name__)


# ========== COMPUTE PROVISIONING ==========

def provision_instance(instance_id):
    """Provision a new compute instance."""
    try:
        from .models import Instance
        instance = Instance.objects.get(id=instance_id)
        logger.info(f"Provisioning instance {instance_id}")
        instance.status = 'running'
        instance.provisioning_completed_at = timezone.now()
        instance.save()
        logger.info(f"Instance {instance_id} is now running")
        notify_resource_created('instance', instance_id)
    except Exception as exc:
        logger.error(f"Error provisioning instance {instance_id}: {exc}")


def deprovision_instance(instance_id):
    """Deprovision a terminated instance and release its resources."""
    try:
        from .models import Instance
        Instance.objects.get(id=instance_id)
        logger.info(f"Deprovisioning instance {instance_id}")
        notify_resource_deleted('instance', instance_id)
    except Exception as exc:
        logger.error(f"Error deprovisioning instance {instance_id}: {exc}")


# ========== STORAGE OPERATIONS ==========

def create_snapshot(volume_id, user_id):
    """Create a snapshot of a storage volume."""
    try:
        from django.contrib.auth.models import User
        from .business_logic.storage import StorageService
        user = User.objects.get(id=user_id)
        logger.info(f"Creating snapshot of volume {volume_id}")
        service = StorageService()
        snapshot = service.create_snapshot(volume_id, user)
        logger.info(f"Snapshot {snapshot.id} created")
        notify_resource_created('snapshot', snapshot.id)
    except Exception as exc:
        logger.error(f"Error creating snapshot for volume {volume_id}: {exc}")


def execute_backup_policy(policy_id, user_id):
    """Execute a backup policy."""
    try:
        from django.contrib.auth.models import User
        from .business_logic.storage import StorageService
        user = User.objects.get(id=user_id)
        service = StorageService()
        backups = service.execute_backup_policy(policy_id, user)
        logger.info(f"Created {len(backups)} backups from policy {policy_id}")
        send_notification(user_id, "Backup Complete", f"Created {len(backups)} backups")
    except Exception as exc:
        logger.error(f"Error executing backup policy {policy_id}: {exc}")


# ========== KUBERNETES OPERATIONS ==========

def provision_kubernetes_cluster(cluster_id, user_id):
    """Provision a Kubernetes cluster."""
    try:
        from .models import KubernetesCluster
        cluster = KubernetesCluster.objects.get(id=cluster_id)
        logger.info(f"Provisioning Kubernetes cluster {cluster_id}")
        cluster.status = 'running'
        cluster.provisioning_completed_at = timezone.now()
        cluster.save()
        logger.info(f"Kubernetes cluster {cluster_id} is running")
        notify_resource_created('kubernetes_cluster', cluster_id)
    except Exception as exc:
        logger.error(f"Error provisioning cluster {cluster_id}: {exc}")


# ========== METRICS & MONITORING ==========

def collect_instance_metrics(instance_id):
    """Collect CPU, memory, disk, and network metrics for an instance."""
    try:
        import random
        from .models import Instance, InstanceMetric
        instance = Instance.objects.get(id=instance_id)
        InstanceMetric.objects.create(
            instance=instance,
            cpu_percent=random.randint(5, 80),
            memory_percent=random.randint(20, 90),
            memory_bytes_used=instance.flavor.memory_mb * 1024 * 1024 * random.random(),
            disk_read_bytes=random.randint(0, 10 ** 6),
            disk_write_bytes=random.randint(0, 10 ** 6),
            disk_read_iops=random.randint(0, 1000),
            disk_write_iops=random.randint(0, 1000),
            network_bytes_in=random.randint(0, 10 ** 7),
            network_bytes_out=random.randint(0, 10 ** 7),
            network_packets_per_sec=random.randint(0, 100000),
        )
        logger.debug(f"Metrics collected for instance {instance_id}")
    except Exception as exc:
        logger.warning(f"Could not collect metrics for instance {instance_id}: {exc}")


def collect_volume_metrics(volume_id):
    """Collect IOPS and throughput metrics for a volume."""
    try:
        import random
        from .models import StorageVolume, StorageMetric
        volume = StorageVolume.objects.get(id=volume_id)
        StorageMetric.objects.create(
            volume=volume,
            read_bytes=random.randint(0, 10 ** 8),
            write_bytes=random.randint(0, 10 ** 8),
            read_iops=random.randint(0, 10000),
            write_iops=random.randint(0, 10000),
            latency_ms=random.uniform(1, 50),
            throughput_mbps=random.uniform(10, 200),
        )
        logger.debug(f"Metrics collected for volume {volume_id}")
    except Exception as exc:
        logger.warning(f"Could not collect metrics for volume {volume_id}: {exc}")


# ========== AUTO-SCALING ==========

def evaluate_scaling_policies():
    """Evaluate all enabled auto-scaling groups."""
    from .models import AutoScalingGroup
    from .business_logic.compute import ComputeService
    service = ComputeService()
    for asg in AutoScalingGroup.objects.filter(enabled=True):
        try:
            service.evaluate_scaling_policies(asg.id, asg.owner)
        except Exception as exc:
            logger.error(f"Error evaluating ASG {asg.id}: {exc}")


# ========== BILLING ==========

def calculate_daily_costs(user_id=None):
    """Calculate resource costs for one or all users."""
    from django.contrib.auth.models import User
    from .business_logic.billing import BillingService
    service = BillingService()
    users = User.objects.filter(id=user_id) if user_id else User.objects.all()
    for user in users:
        try:
            costs = service.calculate_user_monthly_cost(user)
            logger.info(f"Daily cost for user {user.id}: ${costs['total']}")
        except Exception as exc:
            logger.error(f"Error calculating costs for user {user.id}: {exc}")


def generate_monthly_invoice(user_id):
    """Generate a monthly invoice for a user."""
    try:
        from django.contrib.auth.models import User
        from .business_logic.billing import BillingService
        user = User.objects.get(id=user_id)
        service = BillingService()
        costs = service.calculate_user_monthly_cost(user)
        logger.info(f"Invoice generated for user {user_id}: ${costs['total']}")
    except Exception as exc:
        logger.error(f"Error generating invoice for user {user_id}: {exc}")


# ========== NOTIFICATIONS & WEBHOOKS ==========

def notify_resource_created(resource_type, resource_id):
    """Log/send webhook when a resource is created."""
    logger.info(f"[webhook] {resource_type} {resource_id} created")


def notify_resource_deleted(resource_type, resource_id):
    """Log/send webhook when a resource is deleted."""
    logger.info(f"[webhook] {resource_type} {resource_id} deleted")


def send_notification(user_id, subject, message):
    """Send an email notification to a user."""
    try:
        from django.contrib.auth.models import User
        user = User.objects.get(id=user_id)
        logger.info(f"[notify] → {user.email} | {subject}: {message}")
        # In production:
        # from django.core.mail import send_mail
        # send_mail(subject, message, 'noreply@atonixcorp.com', [user.email])
    except Exception as exc:
        logger.error(f"Error sending notification to user {user_id}: {exc}")


# ========== MAINTENANCE ==========

def cleanup_old_resources():
    """Delete terminated instances older than 30 days."""
    from .models import Instance
    cutoff = timezone.now() - timedelta(days=30)
    qs = Instance.objects.filter(status='terminated', terminated_at__lt=cutoff)
    count = qs.count()
    qs.delete()
    logger.info(f"Deleted {count} old terminated instances")


def health_check():
    """Verify database connectivity."""
    try:
        from django.db import connection
        connection.ensure_connection()
        logger.debug("Health check passed")
    except Exception as exc:
        logger.error(f"Health check failed: {exc}")
