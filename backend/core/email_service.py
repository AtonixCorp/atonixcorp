"""
Email service module for sending and managing emails.
"""
import os
import logging
import smtplib
from typing import Dict, List, Optional, Any, Union
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime
from pathlib import Path

from django.core.mail import EmailMultiAlternatives, get_connection
from django.template.loader import render_to_string
from django.template import Context, Template
from django.conf import settings
from django.contrib.auth.models import User
from django.utils.html import strip_tags

# Optional imports for enhanced functionality
try:
    from premailer import transform
    PREMAILER_AVAILABLE = True
except ImportError:
    PREMAILER_AVAILABLE = False

try:
    import html2text
    HTML2TEXT_AVAILABLE = True
except ImportError:
    HTML2TEXT_AVAILABLE = False

logger = logging.getLogger(__name__)


class EmailTemplate:
    """Email template class for managing HTML and text templates."""
    
    def __init__(self, template_name: str, template_dir: Optional[str] = None):
        self.template_name = template_name
        self.template_dir = template_dir or getattr(settings, 'EMAIL_TEMPLATE_DIR', 'templates/emails')
        
    def render(self, context: Dict[str, Any], use_html: bool = True) -> Dict[str, str]:
        """Render email template with context."""
        try:
            html_template_path = f"{self.template_dir}/{self.template_name}.html"
            text_template_path = f"{self.template_dir}/{self.template_name}.txt"
            
            result = {}
            
            # Render HTML template
            if use_html:
                try:
                    html_content = render_to_string(html_template_path, context)
                    
                    # Apply CSS inlining if premailer is available
                    if PREMAILER_AVAILABLE:
                        html_content = transform(html_content)
                    
                    result['html'] = html_content
                    
                    # Generate text version from HTML if no text template exists
                    if not self._template_exists(text_template_path):
                        if HTML2TEXT_AVAILABLE:
                            h = html2text.HTML2Text()
                            h.ignore_links = False
                            result['text'] = h.handle(html_content)
                        else:
                            result['text'] = strip_tags(html_content)
                    
                except Exception as e:
                    logger.error(f"Failed to render HTML template {html_template_path}: {e}")
            
            # Render text template
            if self._template_exists(text_template_path):
                try:
                    result['text'] = render_to_string(text_template_path, context)
                except Exception as e:
                    logger.error(f"Failed to render text template {text_template_path}: {e}")
            
            if not result:
                raise ValueError(f"No valid templates found for {self.template_name}")
            
            return result
            
        except Exception as e:
            logger.error(f"Template rendering failed: {e}")
            raise
    
    def _template_exists(self, template_path: str) -> bool:
        """Check if template file exists."""
        try:
            render_to_string(template_path, {})
            return True
        except:
            return False


class EmailService:
    """High-level email service for sending various types of emails."""
    
    def __init__(self, connection=None):
        """Initialize email service."""
        self.connection = connection or get_connection()
        self.default_from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com')
        
    def send_email(self, 
                   to_emails: Union[str, List[str]],
                   subject: str,
                   template_name: Optional[str] = None,
                   context: Optional[Dict[str, Any]] = None,
                   html_content: Optional[str] = None,
                   text_content: Optional[str] = None,
                   from_email: Optional[str] = None,
                   cc_emails: Optional[List[str]] = None,
                   bcc_emails: Optional[List[str]] = None,
                   attachments: Optional[List[Dict]] = None,
                   priority: int = 3) -> bool:
        """Send an email with template or content."""
        
        try:
            # Normalize to_emails to list
            if isinstance(to_emails, str):
                to_emails = [to_emails]
            
            # Use template if provided
            if template_name:
                template = EmailTemplate(template_name)
                rendered = template.render(context or {})
                html_content = rendered.get('html')
                text_content = rendered.get('text')
            
            # Create email message
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content or '',
                from_email=from_email or self.default_from_email,
                to=to_emails,
                cc=cc_emails,
                bcc=bcc_emails,
                connection=self.connection
            )
            
            # Add HTML alternative if available
            if html_content:
                email.attach_alternative(html_content, "text/html")
            
            # Add attachments
            if attachments:
                for attachment in attachments:
                    if isinstance(attachment, dict):
                        email.attach(
                            attachment.get('filename', 'attachment'),
                            attachment.get('content', ''),
                            attachment.get('mimetype', 'application/octet-stream')
                        )
                    else:
                        email.attach_file(attachment)
            
            # Set priority headers
            if priority != 3:  # 1=high, 3=normal, 5=low
                priority_map = {1: 'high', 2: 'high', 3: 'normal', 4: 'low', 5: 'low'}
                email.extra_headers['X-Priority'] = str(priority)
                email.extra_headers['X-MSMail-Priority'] = priority_map.get(priority, 'normal')
            
            # Send email
            result = email.send()
            
            if result:
                logger.info(f"Email sent successfully to {', '.join(to_emails)}")
                return True
            else:
                logger.error(f"Failed to send email to {', '.join(to_emails)}")
                return False
                
        except Exception as e:
            logger.error(f"Email sending failed: {e}")
            return False
    
    def send_welcome_email(self, user: User, activation_link: Optional[str] = None) -> bool:
        """Send welcome email to new user."""
        context = {
            'user': user,
            'username': user.username,
            'first_name': user.first_name,
            'activation_link': activation_link,
            'site_name': 'AtonixCorp Platform',
            'support_email': 'support@atonixcorp.com'
        }
        
        return self.send_email(
            to_emails=[user.email],
            subject='Welcome to AtonixCorp Platform',
            template_name='welcome',
            context=context
        )
    
    def send_password_reset_email(self, user: User, reset_link: str) -> bool:
        """Send password reset email."""
        context = {
            'user': user,
            'username': user.username,
            'first_name': user.first_name,
            'reset_link': reset_link,
            'site_name': 'AtonixCorp Platform',
            'support_email': 'support@atonixcorp.com'
        }
        
        return self.send_email(
            to_emails=[user.email],
            subject='Password Reset for AtonixCorp Platform',
            template_name='password_reset',
            context=context,
            priority=2  # High priority
        )
    
    def send_notification_email(self, user: User, notification_type: str, 
                               notification_data: Dict[str, Any]) -> bool:
        """Send notification email."""
        context = {
            'user': user,
            'username': user.username,
            'first_name': user.first_name,
            'notification_type': notification_type,
            'notification_data': notification_data,
            'site_name': 'AtonixCorp Platform'
        }
        
        subject_map = {
            'project_created': 'New Project Created',
            'project_updated': 'Project Updated',
            'team_invitation': 'Team Invitation',
            'task_assigned': 'New Task Assigned',
            'comment_added': 'New Comment Added',
            'mention': 'You were mentioned'
        }
        
        subject = subject_map.get(notification_type, 'Notification from AtonixCorp')
        
        return self.send_email(
            to_emails=[user.email],
            subject=subject,
            template_name='notification',
            context=context
        )
    
    def send_bulk_email(self, recipients: List[Dict[str, Any]], 
                       subject: str, template_name: str,
                       common_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Send bulk emails with personalized content."""
        results = {
            'sent': 0,
            'failed': 0,
            'errors': []
        }
        
        for recipient in recipients:
            try:
                # Merge common context with recipient-specific context
                context = {**(common_context or {}), **recipient.get('context', {})}
                
                success = self.send_email(
                    to_emails=[recipient['email']],
                    subject=subject,
                    template_name=template_name,
                    context=context
                )
                
                if success:
                    results['sent'] += 1
                else:
                    results['failed'] += 1
                    results['errors'].append(f"Failed to send to {recipient['email']}")
                    
            except Exception as e:
                results['failed'] += 1
                results['errors'].append(f"Error sending to {recipient.get('email', 'unknown')}: {e}")
        
        logger.info(f"Bulk email completed: {results['sent']} sent, {results['failed']} failed")
        return results
    
    def send_system_alert(self, alert_type: str, message: str, 
                         recipients: Optional[List[str]] = None) -> bool:
        """Send system alert email to administrators."""
        if not recipients:
            # Get admin users
            admin_users = User.objects.filter(is_staff=True, is_active=True)
            recipients = [user.email for user in admin_users if user.email]
        
        context = {
            'alert_type': alert_type,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'site_name': 'AtonixCorp Platform'
        }
        
        return self.send_email(
            to_emails=recipients,
            subject=f'System Alert: {alert_type}',
            template_name='system_alert',
            context=context,
            priority=1  # High priority
        )


class EmailQueue:
    """Email queue for handling async email sending via RabbitMQ."""
    
    def __init__(self):
        """Initialize email queue."""
        try:
            from core.rabbitmq_client import get_rabbitmq_client, MessagePublisher
            self.rabbitmq_client = get_rabbitmq_client()
            self.publisher = MessagePublisher(self.rabbitmq_client)
            self.queue_enabled = True
        except ImportError:
            logger.warning("RabbitMQ not available, emails will be sent synchronously")
            self.queue_enabled = False
    
    def queue_email(self, email_data: Dict[str, Any], priority: int = 5) -> bool:
        """Queue an email for async sending."""
        if not self.queue_enabled:
            # Fallback to synchronous sending
            return self._send_email_sync(email_data)
        
        try:
            # Add metadata
            email_data['queued_at'] = datetime.utcnow().isoformat()
            email_data['priority'] = priority
            
            # Send to email queue
            routing_key = f"email.send.priority.{priority}"
            success = self.rabbitmq_client.publish_message(routing_key, email_data)
            
            if success:
                logger.info(f"Email queued for {email_data.get('to_emails', 'unknown')}")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to queue email: {e}")
            # Fallback to synchronous sending
            return self._send_email_sync(email_data)
    
    def _send_email_sync(self, email_data: Dict[str, Any]) -> bool:
        """Fallback synchronous email sending."""
        try:
            email_service = EmailService()
            return email_service.send_email(**email_data)
        except Exception as e:
            logger.error(f"Synchronous email sending failed: {e}")
            return False
    
    def process_email_queue(self):
        """Process emails from the queue (for worker processes)."""
        if not self.queue_enabled:
            logger.warning("Email queue processing not available without RabbitMQ")
            return
        
        def email_handler(routing_key: str, data: Dict[str, Any]):
            """Handle queued email."""
            try:
                logger.info(f"Processing queued email from {routing_key}")
                
                # Remove queue metadata
                data.pop('queued_at', None)
                data.pop('priority', None)
                
                # Send email
                email_service = EmailService()
                success = email_service.send_email(**data)
                
                if success:
                    logger.info("Queued email sent successfully")
                else:
                    logger.error("Failed to send queued email")
                    
            except Exception as e:
                logger.error(f"Error processing queued email: {e}")
        
        # Declare email queue
        queue_name = "email_queue"
        self.rabbitmq_client.declare_queue(queue_name, "email.send.*")
        
        # Start consuming
        logger.info("Starting email queue processing...")
        self.rabbitmq_client.consume_messages(queue_name, email_handler)


# Global email service instances
_email_service = None
_email_queue = None


def get_email_service() -> EmailService:
    """Get or create global email service instance."""
    global _email_service
    if _email_service is None:
        _email_service = EmailService()
    return _email_service


def get_email_queue() -> EmailQueue:
    """Get or create global email queue instance."""
    global _email_queue
    if _email_queue is None:
        _email_queue = EmailQueue()
    return _email_queue


# Utility functions
def send_email(to_emails: Union[str, List[str]], subject: str, 
               template_name: Optional[str] = None, **kwargs) -> bool:
    """Convenience function for sending emails."""
    email_service = get_email_service()
    return email_service.send_email(to_emails, subject, template_name, **kwargs)


def queue_email(to_emails: Union[str, List[str]], subject: str,
                template_name: Optional[str] = None, priority: int = 5, **kwargs) -> bool:
    """Convenience function for queuing emails."""
    email_queue = get_email_queue()
    email_data = {
        'to_emails': to_emails,
        'subject': subject,
        'template_name': template_name,
        **kwargs
    }
    return email_queue.queue_email(email_data, priority)