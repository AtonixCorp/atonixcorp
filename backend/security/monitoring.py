"""
Security monitoring and alerting system
"""
import logging
import time
import json
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
from collections import defaultdict, deque
from django.core.cache import cache
from django.conf import settings
from django.core.mail import send_mail
from typing import Dict, List, Optional
import threading
import queue

logger = logging.getLogger(__name__)


class SecurityEventType:
    """Security event types for classification"""
    FAILED_LOGIN = 'failed_login'
    SUSPICIOUS_REQUEST = 'suspicious_request'
    RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded'
    IP_BLOCKED = 'ip_blocked'
    MALICIOUS_PATTERN = 'malicious_pattern'
    UNAUTHORIZED_ACCESS = 'unauthorized_access'
    SUSPICIOUS_FILE_ACCESS = 'suspicious_file_access'
    BRUTE_FORCE_ATTACK = 'brute_force_attack'
    SQL_INJECTION_ATTEMPT = 'sql_injection_attempt'
    XSS_ATTEMPT = 'xss_attempt'
    COMMAND_INJECTION = 'command_injection'
    API_ABUSE = 'api_abuse'


class SecurityEvent:
    """Security event data structure"""
    
    def __init__(
        self,
        event_type: str,
        severity: str,
        source_ip: str,
        description: str,
        user_id: Optional[int] = None,
        metadata: Optional[Dict] = None
    ):
        self.event_type = event_type
        self.severity = severity  # low, medium, high, critical
        self.source_ip = source_ip
        self.description = description
        self.user_id = user_id
        self.metadata = metadata or {}
        self.timestamp = datetime.utcnow()
        self.event_id = self._generate_event_id()
    
    def _generate_event_id(self) -> str:
        """Generate unique event ID"""
        import hashlib
        data = f"{self.timestamp.isoformat()}{self.source_ip}{self.event_type}"
        return hashlib.md5(data.encode()).hexdigest()[:16]
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for storage/transmission"""
        return {
            'event_id': self.event_id,
            'event_type': self.event_type,
            'severity': self.severity,
            'source_ip': self.source_ip,
            'description': self.description,
            'user_id': self.user_id,
            'metadata': self.metadata,
            'timestamp': self.timestamp.isoformat(),
        }


class SecurityMonitor:
    """
    Real-time security monitoring and alerting system
    """
    
    def __init__(self):
        self.events_queue = queue.Queue()
        self.ip_trackers = defaultdict(lambda: deque(maxlen=100))
        self.user_trackers = defaultdict(lambda: deque(maxlen=50))
        self.alert_cooldowns = {}
        self.monitoring_active = True
        
        # Start background thread for processing events
        self.processor_thread = threading.Thread(target=self._process_events, daemon=True)
        self.processor_thread.start()
    
    def log_event(
        self,
        event_type: str,
        severity: str,
        source_ip: str,
        description: str,
        user_id: Optional[int] = None,
        metadata: Optional[Dict] = None
    ):
        """Log a security event"""
        event = SecurityEvent(
            event_type=event_type,
            severity=severity,
            source_ip=source_ip,
            description=description,
            user_id=user_id,
            metadata=metadata
        )
        
        # Add to queue for processing
        self.events_queue.put(event)
        
        # Log immediately
        self._log_to_file(event)
        
        # Store in cache for real-time analysis
        self._store_event(event)
    
    def detect_brute_force(self, source_ip: str, event_type: str) -> bool:
        """Detect brute force attacks"""
        if event_type != SecurityEventType.FAILED_LOGIN:
            return False
        
        # Check recent failed login attempts from this IP
        recent_events = self.ip_trackers[source_ip]
        
        # Count failed logins in last 5 minutes
        cutoff_time = datetime.utcnow() - timedelta(minutes=5)
        failed_attempts = sum(
            1 for timestamp in recent_events
            if timestamp > cutoff_time
        )
        
        # Threshold for brute force detection
        threshold = getattr(settings, 'BRUTE_FORCE_THRESHOLD', 10)
        
        if failed_attempts >= threshold:
            self.log_event(
                SecurityEventType.BRUTE_FORCE_ATTACK,
                'high',
                source_ip,
                f'Brute force attack detected: {failed_attempts} failed attempts in 5 minutes',
                metadata={'failed_attempts': failed_attempts}
            )
            return True
        
        return False
    
    def detect_distributed_attack(self) -> List[str]:
        """Detect distributed attacks from multiple IPs"""
        suspicious_ips = []
        cutoff_time = datetime.utcnow() - timedelta(minutes=10)
        
        # Check for coordinated attacks
        total_events = 0
        active_ips = 0
        
        for ip, events in self.ip_trackers.items():
            recent_events = sum(
                1 for timestamp in events
                if timestamp > cutoff_time
            )
            
            if recent_events > 5:  # Suspicious activity threshold
                active_ips += 1
                total_events += recent_events
                suspicious_ips.append(ip)
        
        # If we have many IPs with moderate activity, it might be distributed
        if active_ips > 5 and total_events > 50:
            self.log_event(
                SecurityEventType.SUSPICIOUS_REQUEST,
                'high',
                'multiple',
                f'Distributed attack pattern detected: {active_ips} IPs, {total_events} events',
                metadata={
                    'active_ips': active_ips,
                    'total_events': total_events,
                    'suspicious_ips': suspicious_ips[:10]  # Limit to first 10
                }
            )
        
        return suspicious_ips
    
    def get_security_dashboard_data(self) -> Dict:
        """Get data for security dashboard"""
        now = datetime.utcnow()
        
        # Get events from last 24 hours
        events_24h = self._get_events_since(now - timedelta(hours=24))
        
        # Get events from last hour
        events_1h = self._get_events_since(now - timedelta(hours=1))
        
        # Analyze by type
        event_types_24h = defaultdict(int)
        event_types_1h = defaultdict(int)
        severity_counts = defaultdict(int)
        top_ips = defaultdict(int)
        
        for event in events_24h:
            event_types_24h[event.event_type] += 1
            severity_counts[event.severity] += 1
            top_ips[event.source_ip] += 1
        
        for event in events_1h:
            event_types_1h[event.event_type] += 1
        
        return {
            'total_events_24h': len(events_24h),
            'total_events_1h': len(events_1h),
            'event_types_24h': dict(event_types_24h),
            'event_types_1h': dict(event_types_1h),
            'severity_distribution': dict(severity_counts),
            'top_ips': dict(sorted(top_ips.items(), key=lambda x: x[1], reverse=True)[:10]),
            'last_updated': now.isoformat(),
        }
    
    def generate_security_report(self, hours: int = 24) -> Dict:
        """Generate comprehensive security report"""
        start_time = datetime.utcnow() - timedelta(hours=hours)
        events = self._get_events_since(start_time)
        
        if not events:
            return {'message': 'No security events in the specified period'}
        
        # Analyze events
        analysis = {
            'period': f'Last {hours} hours',
            'total_events': len(events),
            'unique_ips': len(set(event.source_ip for event in events)),
            'event_types': defaultdict(int),
            'severity_breakdown': defaultdict(int),
            'hourly_distribution': defaultdict(int),
            'top_threats': [],
            'recommendations': []
        }
        
        for event in events:
            analysis['event_types'][event.event_type] += 1
            analysis['severity_breakdown'][event.severity] += 1
            hour = event.timestamp.hour
            analysis['hourly_distribution'][hour] += 1
        
        # Identify top threats
        critical_events = [e for e in events if e.severity == 'critical']
        high_events = [e for e in events if e.severity == 'high']
        
        analysis['top_threats'] = [
            {
                'description': event.description,
                'source_ip': event.source_ip,
                'severity': event.severity,
                'timestamp': event.timestamp.isoformat()
            }
            for event in (critical_events + high_events)[:10]
        ]
        
        # Generate recommendations
        analysis['recommendations'] = self._generate_recommendations(analysis)
        
        return analysis
    
    def _process_events(self):
        """Background thread for processing security events"""
        while self.monitoring_active:
            try:
                # Get event from queue (blocks until available)
                event = self.events_queue.get(timeout=1)
                
                # Process the event
                self._analyze_event(event)
                
                # Check for patterns
                if event.severity in ['high', 'critical']:
                    self._check_alert_conditions(event)
                
                # Mark task as done
                self.events_queue.task_done()
                
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"Error processing security event: {e}")
    
    def _analyze_event(self, event: SecurityEvent):
        """Analyze individual security event"""
        # Track by IP
        self.ip_trackers[event.source_ip].append(event.timestamp)
        
        # Track by user if available
        if event.user_id:
            self.user_trackers[event.user_id].append(event.timestamp)
        
        # Detect patterns
        if event.event_type == SecurityEventType.FAILED_LOGIN:
            self.detect_brute_force(event.source_ip, event.event_type)
        
        # Check for distributed attacks every 50 events
        if len(self.ip_trackers) % 50 == 0:
            self.detect_distributed_attack()
    
    def _check_alert_conditions(self, event: SecurityEvent):
        """Check if alert should be sent"""
        alert_key = f"{event.event_type}:{event.source_ip}"
        
        # Check cooldown
        if alert_key in self.alert_cooldowns:
            if datetime.utcnow() < self.alert_cooldowns[alert_key]:
                return  # Still in cooldown
        
        # Send alert
        self._send_alert(event)
        
        # Set cooldown (15 minutes)
        self.alert_cooldowns[alert_key] = datetime.utcnow() + timedelta(minutes=15)
    
    def _send_alert(self, event: SecurityEvent):
        """Send security alert"""
        try:
            subject = f"Security Alert: {event.event_type}"
            message = f"""
Security Event Detected

Event Type: {event.event_type}
Severity: {event.severity}
Source IP: {event.source_ip}
Time: {event.timestamp}
Description: {event.description}

Event ID: {event.event_id}

Please investigate immediately.
            """
            
            # Send email alert
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [getattr(settings, 'SECURITY_ALERT_EMAIL', 'admin@atonixcorp.com')],
                fail_silently=False
            )
            
            logger.warning(f"Security alert sent: {event.event_type} from {event.source_ip}")
            
        except Exception as e:
            logger.error(f"Failed to send security alert: {e}")
    
    def _log_to_file(self, event: SecurityEvent):
        """Log event to file"""
        logger.warning(
            f"SECURITY_EVENT:{event.event_type}|{event.severity}|{event.source_ip}|{event.description}"
        )
    
    def _store_event(self, event: SecurityEvent):
        """Store event in cache for analysis"""
        key = f"security_event_{event.event_id}"
        cache.set(key, event.to_dict(), timeout=86400)  # Store for 24 hours
        
        # Add to recent events list
        recent_key = "recent_security_events"
        recent_events = cache.get(recent_key, [])
        recent_events.append(event.event_id)
        
        # Keep only last 1000 events
        if len(recent_events) > 1000:
            recent_events = recent_events[-1000:]
        
        cache.set(recent_key, recent_events, timeout=86400)
    
    def _get_events_since(self, since: datetime) -> List[SecurityEvent]:
        """Get events since specified time"""
        recent_events = cache.get("recent_security_events", [])
        events = []
        
        for event_id in recent_events:
            event_data = cache.get(f"security_event_{event_id}")
            if event_data:
                event_time = datetime.fromisoformat(event_data['timestamp'])
                if event_time >= since:
                    # Convert back to SecurityEvent object
                    event = SecurityEvent(
                        event_data['event_type'],
                        event_data['severity'],
                        event_data['source_ip'],
                        event_data['description'],
                        event_data['user_id'],
                        event_data['metadata']
                    )
                    event.timestamp = event_time
                    event.event_id = event_data['event_id']
                    events.append(event)
        
        return events
    
    def _generate_recommendations(self, analysis: Dict) -> List[str]:
        """Generate security recommendations based on analysis"""
        recommendations = []
        
        # Check for high failed login attempts
        failed_logins = analysis['event_types'].get(SecurityEventType.FAILED_LOGIN, 0)
        if failed_logins > 50:
            recommendations.append(
                "High number of failed login attempts detected. Consider implementing CAPTCHA or temporary account lockouts."
            )
        
        # Check for many unique IPs
        if analysis['unique_ips'] > 100:
            recommendations.append(
                "Large number of unique IPs detected. Consider implementing geographic IP filtering if appropriate."
            )
        
        # Check for critical events
        if analysis['severity_breakdown'].get('critical', 0) > 0:
            recommendations.append(
                "Critical security events detected. Immediate investigation and response required."
            )
        
        # Check for injection attempts
        injection_types = [
            SecurityEventType.SQL_INJECTION_ATTEMPT,
            SecurityEventType.XSS_ATTEMPT,
            SecurityEventType.COMMAND_INJECTION
        ]
        
        injection_count = sum(analysis['event_types'].get(t, 0) for t in injection_types)
        if injection_count > 10:
            recommendations.append(
                "Multiple injection attempts detected. Review input validation and consider implementing Web Application Firewall (WAF)."
            )
        
        if not recommendations:
            recommendations.append("No immediate security concerns detected. Continue monitoring.")
        
        return recommendations


# Global security monitor instance
security_monitor = SecurityMonitor()


# Helper functions for easy integration
def log_security_event(event_type: str, severity: str, request, description: str, **kwargs):
    """Helper function to log security events from Django views"""
    source_ip = request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
    if not source_ip:
        source_ip = request.META.get('REMOTE_ADDR', '')
    
    user_id = request.user.id if hasattr(request, 'user') and request.user.is_authenticated else None
    
    security_monitor.log_event(
        event_type=event_type,
        severity=severity,
        source_ip=source_ip,
        description=description,
        user_id=user_id,
        metadata=kwargs
    )


def log_failed_authentication(request, username: str = None):
    """Log failed authentication attempt"""
    log_security_event(
        SecurityEventType.FAILED_LOGIN,
        'medium',
        request,
        f"Failed login attempt for username: {username}",
        username=username
    )


def log_suspicious_request(request, reason: str):
    """Log suspicious request"""
    log_security_event(
        SecurityEventType.SUSPICIOUS_REQUEST,
        'high',
        request,
        f"Suspicious request detected: {reason}",
        reason=reason,
        path=request.path,
        method=request.method
    )


def log_injection_attempt(request, injection_type: str, payload: str):
    """Log injection attempt"""
    log_security_event(
        injection_type,
        'critical',
        request,
        f"Injection attempt detected: {injection_type}",
        payload=payload[:200],  # Limit payload size
        path=request.path
    )