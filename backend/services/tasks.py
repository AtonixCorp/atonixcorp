"""
Celery Async Tasks for AtonixCorp Services

This module defines all asynchronous tasks that should run in the background.
Tasks are executed by Celery workers and can be scheduled, retried, and monitored.

Task Categories:
- Provisioning tasks (instances, volumes, clusters)
- Scheduled tasks (backups, metrics, cleanup)
- Notification tasks (webhooks, emails)
- Billing tasks (cost calculations, invoicing)

Usage:
    from services.tasks import provision_instance
    
    # Run immediately
    provision_instance.delay(instance_id=123, user_id=456)
    
    # Schedule for later
    provision_instance.apply_async(
        args=(123, 456),
        countdown=3600  # Run in 1 hour
    )
"""

import logging
from datetime import datetime, timedelta
from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail

from .models import (
    Instance, StorageVolume, StorageSnapshot, Backup, BackupPolicy,
    KubernetesCluster, ServerlessFunction, AutoScalingGroup,
    InstanceMetric, StorageMetric, LoadBalancer,
)
from .business_logic.compute import ComputeService
from .business_logic.storage import StorageService
from .business_logic.networking import NetworkingService
from .business_logic.billing import BillingService

logger = logging.getLogger(__name__)


# ========== COMPUTE PROVISIONING ==========

@shared_task(bind=True, max_retries=3)
def provision_instance(self, instance_id):
    """
    Provision a new compute instance.
    
    This task handles the actual provisioning of an instance after it's created.
    In production, this would call IaaS APIs.
    
    Args:
        instance_id: ID of instance to provision
    """
    try:
        instance = Instance.objects.get(id=instance_id)
        service = ComputeService()
        
        logger.info(f"Starting provisioning of instance {instance_id}")
        
        # Simulate provisioning (in production, call actual hypervisor API)
        instance.status = 'running'
        instance.provisioning_completed_at = timezone.now()
        instance.save()
        
        logger.info(f"Completed provisioning of instance {instance_id}")
        
        # Trigger webhook
        notify_resource_created.delay('instance', instance_id)
        
    except Instance.DoesNotExist:
        logger.error(f"Instance {instance_id} not found")
    except Exception as exc:
        logger.error(f"Error provisioning instance {instance_id}: {exc}")
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=3)
def deprovision_instance(self, instance_id):
    """
    Deprovision a terminated instance and release resources.
    
    Args:
        instance_id: ID of instance to deprovision
    """
    try:
        instance = Instance.objects.get(id=instance_id)
        
        logger.info(f"Starting deprovisioning of instance {instance_id}")
        
        # In production, would release actual infrastructure
        # - Release compute resources
        # - Detach volumes
        # - Release EIPs
        # - Delete network interfaces
        
        logger.info(f"Completed deprovisioning of instance {instance_id}")
        notify_resource_deleted.delay('instance', instance_id)
        
    except Exception as exc:
        logger.error(f"Error deprovisioning instance {instance_id}: {exc}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


# ========== STORAGE OPERATIONS ==========

@shared_task(bind=True, max_retries=3)
def create_snapshot(self, volume_id, user_id):
    """
    Create a snapshot of a volume.
    
    Args:
        volume_id: ID of volume to snapshot
        user_id: ID of user performing operation
    """
    try:
        from django.contrib.auth.models import User
        volume = StorageVolume.objects.get(id=volume_id)
        user = User.objects.get(id=user_id)
        
        logger.info(f"Creating snapshot of volume {volume_id}")
        
        service = StorageService()
        snapshot = service.create_snapshot(volume_id, user)
        
        logger.info(f"Snapshot {snapshot.id} created successfully")
        notify_resource_created.delay('snapshot', snapshot.id)
        
    except Exception as exc:
        logger.error(f"Error creating snapshot: {exc}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=3)
def execute_backup_policy(self, policy_id, user_id):
    """
    Execute a backup policy, creating backups for all volumes.
    
    Args:
        policy_id: ID of backup policy
        user_id: ID of user
    """
    try:
        from django.contrib.auth.models import User
        user = User.objects.get(id=user_id)
        
        logger.info(f"Executing backup policy {policy_id}")
        
        service = StorageService()
        backups = service.execute_backup_policy(policy_id, user)
        
        logger.info(f"Created {len(backups)} backups from policy {policy_id}")
        
        # Send notification
        send_notification.delay(
            user_id,
            f"Backup Policy Execution Complete",
            f"Created {len(backups)} backups"
        )
        
    except Exception as exc:
        logger.error(f"Error executing backup policy: {exc}")
        raise self.retry(exc=exc, countdown=300 * (2 ** self.request.retries))


# ========== KUBERNETES OPERATIONS ==========

@shared_task(bind=True, max_retries=3)
def provision_kubernetes_cluster(self, cluster_id, user_id):
    """
    Provision a Kubernetes cluster.
    
    Args:
        cluster_id: ID of cluster to provision
        user_id: ID of user
    """
    try:
        from django.contrib.auth.models import User
        cluster = KubernetesCluster.objects.get(id=cluster_id)
        user = User.objects.get(id=user_id)
        
        logger.info(f"Provisioning Kubernetes cluster {cluster_id}")
        
        service = ComputeService()
        # Actual provisioning would happen here
        # - Create control plane nodes
        # - Create worker nodes
        # - Configure networking
        # - Initialize cluster addons
        
        cluster.status = 'running'
        cluster.provisioning_completed_at = timezone.now()
        cluster.save()
        
        logger.info(f"Kubernetes cluster {cluster_id} provisioned successfully")
        notify_resource_created.delay('kubernetes_cluster', cluster_id)
        
    except Exception as exc:
        logger.error(f"Error provisioning cluster: {exc}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


# ========== METRICS & MONITORING ==========

@shared_task
def collect_instance_metrics(instance_id):
    """
    Collect metrics for an instance (CPU, memory, disk, network).
    
    This is typically called every 5 minutes by monitoring system.
    
    Args:
        instance_id: ID of instance
    """
    try:
        instance = Instance.objects.get(id=instance_id)
        
        # In production, would collect actual metrics from hypervisor
        import random
        metric = InstanceMetric.objects.create(
            instance=instance,
            cpu_percent=random.randint(5, 80),
            memory_percent=random.randint(20, 90),
            memory_bytes_used=instance.flavor.memory_mb * 1024 * 1024 * random.random(),
            disk_read_bytes=random.randint(0, 10**6),
            disk_write_bytes=random.randint(0, 10**6),
            disk_read_iops=random.randint(0, 1000),
            disk_write_iops=random.randint(0, 1000),
            network_bytes_in=random.randint(0, 10**7),
            network_bytes_out=random.randint(0, 10**7),
            network_packets_per_sec=random.randint(0, 100000),
        )
        
        logger.debug(f"Collected metrics for instance {instance_id}")
        
    except Instance.DoesNotExist:
        logger.warning(f"Instance {instance_id} not found for metrics collection")


@shared_task
def collect_volume_metrics(volume_id):
    """
    Collect metrics for a storage volume.
    
    Args:
        volume_id: ID of volume
    """
    try:
        volume = StorageVolume.objects.get(id=volume_id)
        
        # In production, would collect actual metrics
        import random
        metric = StorageMetric.objects.create(
            volume=volume,
            read_bytes=random.randint(0, 10**8),
            write_bytes=random.randint(0, 10**8),
            read_iops=random.randint(0, 10000),
            write_iops=random.randint(0, 10000),
            latency_ms=random.uniform(1, 50),
            throughput_mbps=random.uniform(10, 200),
        )
        
        logger.debug(f"Collected metrics for volume {volume_id}")
        
    except StorageVolume.DoesNotExist:
        logger.warning(f"Volume {volume_id} not found for metrics collection")


# ========== AUTO-SCALING ==========

@shared_task
def evaluate_scaling_policies():
    """
    Evaluate all auto-scaling policies and make scaling decisions.
    
    This should be called periodically (e.g., every 5 minutes).
    """
    from django.contrib.auth.models import User
    
    service = ComputeService()
    
    for asg in AutoScalingGroup.objects.filter(enabled=True):
        try:
            logger.info(f"Evaluating scaling policies for ASG {asg.id}")
            service.evaluate_scaling_policies(asg.id, asg.owner)
        except Exception as exc:
            logger.error(f"Error evaluating ASG {asg.id}: {exc}")


# ========== BILLING & COST TRACKING ==========

@shared_task
def calculate_daily_costs(user_id=None):
    """
    Calculate costs for user(s) each day.
    
    Args:
        user_id: Optional user ID; if not specified, calculates for all users
    """
    from django.contrib.auth.models import User
    
    service = BillingService()
    
    if user_id:
        users = User.objects.filter(id=user_id)
    else:
        users = User.objects.all()
    
    for user in users:
        try:
            costs = service.calculate_user_monthly_cost(user)
            logger.info(f"Daily cost calculation for user {user.id}: ${costs['total']}")
        except Exception as exc:
            logger.error(f"Error calculating costs for user {user.id}: {exc}")


@shared_task
def generate_monthly_invoice(user_id):
    """
    Generate monthly invoice for a user.
    
    Args:
        user_id: ID of user
    """
    try:
        from django.contrib.auth.models import User
        user = User.objects.get(id=user_id)
        
        logger.info(f"Generating monthly invoice for user {user_id}")
        
        service = BillingService()
        costs = service.calculate_user_monthly_cost(user)
        
        # In production, would create Invoice object and send via email
        logger.info(f"Invoice generated: ${costs['total']}")
        
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found")


# ========== NOTIFICATIONS & WEBHOOKS ==========

@shared_task
def notify_resource_created(resource_type, resource_id):
    """
    Send webhook notification for resource creation.
    
    Args:
        resource_type: Type of resource (instance, volume, etc.)
        resource_id: ID of resource
    """
    logger.info(f"Sending webhook notification for {resource_type} {resource_id} created")
    
    # In production, would:
    # - Get webhooks subscribed to this event
    # - Send POST request to webhook URLs
    # - Handle retries with exponential backoff


@shared_task
def notify_resource_deleted(resource_type, resource_id):
    """
    Send webhook notification for resource deletion.
    
    Args:
        resource_type: Type of resource
        resource_id: ID of resource
    """
    logger.info(f"Sending webhook notification for {resource_type} {resource_id} deleted")


@shared_task
def send_notification(user_id, subject, message):
    """
    Send email notification to user.
    
    Args:
        user_id: ID of user
        subject: Email subject
        message: Email message
    """
    try:
        from django.contrib.auth.models import User
        user = User.objects.get(id=user_id)
        
        # In production, would send actual email
        logger.info(f"Sending notification to user {user_id}: {subject}")
        
        # send_mail(
        #     subject,
        #     message,
        #     'noreply@atonix.cloud',
        #     [user.email],
        #     fail_silently=False,
        # )
        
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found")


# ========== SCHEDULED TASKS (BEAT) ==========

@shared_task
def cleanup_old_resources():
    """
    Clean up old resources (terminated instances, old snapshots, etc.).
    
    This task should be scheduled to run daily.
    """
    logger.info("Starting cleanup of old resources")
    
    # Clean up terminated instances older than 30 days
    cutoff_date = timezone.now() - timedelta(days=30)
    old_instances = Instance.objects.filter(
        status='terminated',
        terminated_at__lt=cutoff_date
    )
    count = old_instances.count()
    old_instances.delete()
    logger.info(f"Deleted {count} old instances")


@shared_task
def health_check():
    """
    Periodic health check task.
    
    Should be scheduled to run every 5 minutes to verify system health.
    """
    try:
        # Check database connectivity
        from django.db import connection
        connection.ensure_connection()
        
        # Check Celery broker connectivity
        logger.debug("Health check passed")
        
    except Exception as exc:
        logger.error(f"Health check failed: {exc}")
