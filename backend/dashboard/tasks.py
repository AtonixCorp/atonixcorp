"""
Celery tasks for AtonixCorp Platform
"""
from celery import shared_task
from django.core.mail import send_mail
from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from django.utils import timezone
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

@shared_task
def update_dashboard_stats():
    """
    Update dashboard statistics in cache
    """
    try:
        # Calculate various statistics
        total_users = User.objects.count()
        active_users = User.objects.filter(last_login__gte=timezone.now() - timezone.timedelta(days=30)).count()
        new_users_this_week = User.objects.filter(date_joined__gte=timezone.now() - timezone.timedelta(days=7)).count()
        
        # Store in cache
        cache.set('dashboard_total_users', total_users, 3600)
        cache.set('dashboard_active_users', active_users, 3600)
        cache.set('dashboard_new_users_week', new_users_this_week, 3600)
        
        logger.info(f"Updated dashboard stats: {total_users} total users, {active_users} active users")
        return f"Dashboard stats updated successfully"
        
    except Exception as e:
        logger.error(f"Error updating dashboard stats: {str(e)}")
        return f"Error: {str(e)}"

@shared_task
def cleanup_expired_sessions():
    """
    Clean up expired sessions
    """
    try:
        expired_sessions = Session.objects.filter(expire_date__lt=timezone.now())
        count = expired_sessions.count()
        expired_sessions.delete()
        
        logger.info(f"Cleaned up {count} expired sessions")
        return f"Cleaned up {count} expired sessions"
        
    except Exception as e:
        logger.error(f"Error cleaning up sessions: {str(e)}")
        return f"Error: {str(e)}"

@shared_task
def send_weekly_digest():
    """
    Send weekly digest email to users
    """
    try:
        # Get active users
        active_users = User.objects.filter(
            last_login__gte=timezone.now() - timezone.timedelta(days=30),
            is_active=True
        )
        
        sent_count = 0
        for user in active_users:
            if user.email:
                try:
                    send_mail(
                        'AtonixCorp Weekly Digest',
                        f'Hello {user.first_name}, here\'s what happened this week...',
                        'noreply@atonixcorp.com',
                        [user.email],
                        fail_silently=False,
                    )
                    sent_count += 1
                except Exception as e:
                    logger.error(f"Error sending email to {user.email}: {str(e)}")
        
        logger.info(f"Sent weekly digest to {sent_count} users")
        return f"Weekly digest sent to {sent_count} users"
        
    except Exception as e:
        logger.error(f"Error sending weekly digest: {str(e)}")
        return f"Error: {str(e)}"

@shared_task
def process_user_registration(user_id):
    """
    Process user registration tasks
    """
    try:
        user = User.objects.get(id=user_id)
        
        # Send welcome email
        send_mail(
            'Welcome to AtonixCorp!',
            f'Hello {user.first_name}, welcome to the AtonixCorp community!',
            'noreply@atonixcorp.com',
            [user.email],
            fail_silently=False,
        )
        
        logger.info(f"Processed registration for user {user.username}")
        return f"Registration processed for {user.username}"
        
    except User.DoesNotExist:
        logger.error(f"User with id {user_id} not found")
        return f"User not found"
    except Exception as e:
        logger.error(f"Error processing registration: {str(e)}")
        return f"Error: {str(e)}"