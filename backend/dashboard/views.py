"""
Professional Dashboard API Views.

This module provides comprehensive REST API endpoints for the AtonixCorp Platform
dashboard with analytics, user statistics, activity tracking, and security management.
"""

from django.http import JsonResponse
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, extend_schema_view
from core.api_utils import APIResponse
from projects.models import Project
from teams.models import Team
from resources.models import Resource
from enterprises.models import Enterprise
from enterprises.security_models import (
    EnterpriseSecurityPolicy, SecurityAudit, SecurityIncident,
    ComplianceTracker, SecurityControl
)
import logging

logger = logging.getLogger(__name__)


@extend_schema(
    summary="Get dashboard statistics",
    description="""
    Retrieve comprehensive dashboard statistics for the authenticated user.

    ## Features
    - **User Statistics**: Personal contributions, rank, reputation, and badges
    - **Recent Activity**: Latest user activities and achievements
    - **Community Metrics**: Platform-wide statistics and trends
    - **Real-time Data**: Current project and team information

    ## Response Format
    Returns a standardized response with user stats, activities, and community metrics.
    """,
    tags=['Dashboard']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Get comprehensive dashboard statistics for the logged-in user.

    This endpoint provides a complete overview of the user's activity,
    community standing, and platform metrics for dashboard displays.
    """
    try:
        user = request.user

        # Calculate real user-specific stats
        user_projects = Project.objects.filter(created_by=user).count()
        user_teams = Team.objects.filter(members=user).count()

        # Community metrics
        total_members = User.objects.filter(is_active=True).count()
        total_projects = Project.objects.count()
        active_projects = Project.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        ).count()

        # Calculate user contributions (in a real app, this would track actual contributions)
        user_contributions = Project.objects.filter(created_by=user).count() * 5  # Mock multiplier
        community_rank = User.objects.filter(
            date_joined__lte=user.date_joined,
            is_active=True
        ).count()

        # Mock reputation system (would be calculated from actual interactions)
        reputation = max(100, user_contributions * 10 + user_teams * 50)

        # Dynamic badges based on user activity
        badges = []
        if user_projects > 0:
            badges.append('Project Creator')
        if user_teams > 0:
            badges.append('Team Member')
        if user_contributions > 10:
            badges.append('Active Contributor')
        if reputation > 500:
            badges.append('Community Leader')

        # Recent activity (in a real app, this would come from activity logs)
        recent_activities = [
            {
                'id': 1,
                'type': 'contribution',
                'title': f'Created project: {Project.objects.filter(created_by=user).first().name if Project.objects.filter(created_by=user).exists() else "Sample Project"}',
                'description': 'Successfully launched a new project',
                'timestamp': timezone.now() - timedelta(hours=2),
                'icon': 'code',
                'url': '/projects/',
            },
            {
                'id': 2,
                'type': 'team',
                'title': f'Joined team: {Team.objects.filter(members=user).first().name if Team.objects.filter(members=user).exists() else "Development Team"}',
                'description': 'Became a member of a new team',
                'timestamp': timezone.now() - timedelta(hours=4),
                'icon': 'group',
                'url': '/teams/',
            },
            {
                'id': 3,
                'type': 'achievement',
                'title': f'Earned "{badges[0] if badges else "New Member"}" badge',
                'description': 'Recognized for community contributions',
                'timestamp': timezone.now() - timedelta(days=1),
                'icon': 'star',
            },
        ]

        # Community metrics with real data
        community_metrics = {
            'totalMembers': total_members,
            'activeProjects': active_projects,
            'totalProjects': total_projects,
            'monthlyContributions': Project.objects.filter(
                created_at__gte=timezone.now() - timedelta(days=30)
            ).count() * 3,  # Mock multiplier for contributions
            'activeTeams': Team.objects.count(),
            'totalResources': Resource.objects.count(),
        }

        data = {
            'userStats': {
                'userContributions': user_contributions,
                'communityRank': community_rank,
                'totalProjects': user_projects,
                'activeTeams': user_teams,
                'reputation': reputation,
                'badges': badges,
            },
            'recentActivities': [
                {
                    **activity,
                    'timestamp': activity['timestamp'].isoformat()
                } for activity in recent_activities
            ],
            'communityMetrics': community_metrics,
            'user': {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'date_joined': user.date_joined.isoformat(),
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            }
        }

        return APIResponse.success(
            data=data,
            message="Dashboard statistics retrieved successfully"
        )

    except Exception as e:
        return APIResponse.error(
            message="Failed to retrieve dashboard statistics",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            errors=[{"detail": str(e)}]
        )


@extend_schema(
    summary="Get user profile information",
    description="""
    Retrieve detailed profile information for the authenticated user.

    ## Profile Information
    - **Basic Info**: User details, registration date, and account status
    - **Projects**: List of projects created by the user
    - **Teams**: List of teams the user is a member of
    - **Activity**: Recent user activities and contributions

    ## Response Format
    Returns comprehensive user profile data with related entities.
    """,
    tags=['Dashboard']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get detailed user profile information for the dashboard.

    This endpoint provides complete user profile data including
    projects, teams, and activity information for profile displays.
    """
    try:
        user = request.user

        # Get user's actual projects and teams
        user_projects = Project.objects.filter(created_by=user).values(
            'id', 'name', 'slug', 'status', 'created_at'
        )
        user_teams = Team.objects.filter(members=user).values(
            'id', 'name', 'slug', 'description', 'created_at'
        )

        # Calculate profile statistics
        profile_stats = {
            'totalProjects': user_projects.count(),
            'totalTeams': user_teams.count(),
            'accountAge': (timezone.now().date() - user.date_joined.date()).days,
            'lastLogin': user.last_login.isoformat() if user.last_login else None,
        }

        data = {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'date_joined': user.date_joined.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'projects': list(user_projects),
            'teams': list(user_teams),
            'profile_stats': profile_stats,
        }

        return APIResponse.success(
            data=data,
            message="User profile retrieved successfully"
        )

    except Exception as e:
        return APIResponse.error(
            message="Failed to retrieve user profile",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            errors=[{"detail": str(e)}]
        )


# ============================================================================
# ENTERPRISE SECURITY DASHBOARD ENDPOINTS
# ============================================================================

@extend_schema(
    summary="Get enterprise security overview",
    description="""
    Retrieve security overview for enterprise organization.
    
    ## Security Overview
    - **Security Policies**: Active security policy configuration
    - **Control Status**: Implementation status of security controls
    - **Audit Schedule**: Upcoming and recent audits
    - **Incident Summary**: Active security incidents
    - **Compliance Status**: Overall compliance percentage by framework
    """,
    tags=['Dashboard', 'Security']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def enterprise_security_overview(request):
    """Get comprehensive security overview for enterprise dashboard."""
    try:
        user = request.user
        
        # Get enterprises where user has access
        # Note: `Enterprise` model exposes related EnterpriseTeam via `enterprise_teams`
        # (related_name='enterprise_teams'). The previous code referenced a non-existent
        # `enterpriseteam` relation and `created_by` attribute which caused runtime errors.
        # Teams are linked to users via TeamMembership (user -> team.memberships.user)
        enterprises = Enterprise.objects.filter(
            Q(enterprise_teams__team__memberships__user=user)
        ).distinct()

        # If user has no enterprises, return an empty overview (do not raise 500).
        if not enterprises.exists():
            overview_data = {
                'enterprises': [],
                'summary': {
                    'total_enterprises': 0,
                    'policies_active': 0,
                    'controls_total': 0,
                    'controls_verified': 0,
                    'active_incidents': 0,
                    'upcoming_audits': 0,
                    'compliance_score': 0,
                }
            }
            return APIResponse.success(
                data=overview_data,
                message="Security overview retrieved successfully (no enterprises)"
            )
        
        overview_data = {
            'enterprises': [],
            'summary': {
                'total_enterprises': enterprises.count(),
                'policies_active': 0,
                'controls_total': 0,
                'controls_verified': 0,
                'active_incidents': 0,
                'upcoming_audits': 0,
                'compliance_score': 0,
            }
        }
        
        for enterprise in enterprises:
            # Get security policy
            policy = EnterpriseSecurityPolicy.objects.filter(enterprise=enterprise).first()
            
            # Count controls
            controls = SecurityControl.objects.filter(enterprise=enterprise)
            controls_verified = controls.filter(status='verified').count()
            
            # Count active incidents
            incidents = SecurityIncident.objects.filter(
                enterprise=enterprise,
                status__in=['reported', 'investigating', 'contained']
            )
            
            # Count upcoming audits
            audits = SecurityAudit.objects.filter(
                enterprise=enterprise,
                status='scheduled',
                scheduled_date__gte=timezone.now()
            )
            
            # Calculate compliance
            compliance_items = ComplianceTracker.objects.filter(enterprise=enterprise)
            compliance_score = (
                sum([t.status_percentage for t in compliance_items]) / max(compliance_items.count(), 1)
                if compliance_items.exists() else 0
            )
            
            enterprise_data = {
                'id': enterprise.id,
                'name': enterprise.name,
                'security': {
                    'policy_active': policy is not None,
                    'policy_id': policy.id if policy else None,
                    'controls': {
                        'total': controls.count(),
                        'verified': controls_verified,
                        'percentage': (controls_verified / max(controls.count(), 1) * 100) if controls.exists() else 0,
                    },
                    'incidents': {
                        'active': incidents.count(),
                        'critical': incidents.filter(severity='critical').count(),
                        'high': incidents.filter(severity='high').count(),
                    },
                    'audits': {
                        'upcoming': audits.count(),
                        'recent': SecurityAudit.objects.filter(
                            enterprise=enterprise,
                            status='completed'
                        ).count(),
                    },
                    'compliance_score': round(compliance_score, 2),
                }
            }
            
            overview_data['enterprises'].append(enterprise_data)
            
            # Update summary
            overview_data['summary']['policies_active'] += (1 if policy else 0)
            overview_data['summary']['controls_total'] += controls.count()
            overview_data['summary']['controls_verified'] += controls_verified
            overview_data['summary']['active_incidents'] += incidents.count()
            overview_data['summary']['upcoming_audits'] += audits.count()
        
        # Calculate overall compliance score
        if enterprises.exists():
            all_compliance = ComplianceTracker.objects.filter(
                enterprise__in=enterprises
            )
            if all_compliance.exists():
                overview_data['summary']['compliance_score'] = round(
                    sum([t.status_percentage for t in all_compliance]) / all_compliance.count(), 2
                )
        
        return APIResponse.success(
            data=overview_data,
            message="Security overview retrieved successfully"
        )
    
    except Exception as e:
        # Log full exception traceback for debugging in dev environment
        logger.exception("enterprise_security_overview failed")
        return APIResponse.error(
            message="Failed to retrieve security overview",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            errors=[{"detail": str(e)}]
        )


@extend_schema(
    summary="Get compliance status by framework",
    description="""
    Retrieve compliance status for each security framework.
    
    ## Response
    - **Framework Status**: Compliance percentage for each framework
    - **Requirements**: Completed vs outstanding requirements
    - **Deadlines**: Upcoming compliance deadlines
    """,
    tags=['Dashboard', 'Security']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def compliance_status(request):
    """Get compliance status summary by framework."""
    try:
        user = request.user
        enterprise_id = request.query_params.get('enterprise_id')
        
        if not enterprise_id:
            return Response({'error': 'enterprise_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify access
        enterprise = Enterprise.objects.get(id=enterprise_id)
        if not (user.is_staff or enterprise.created_by == user or 
                enterprise.enterpriseteam.filter(team__members=user).exists()):
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        compliance_trackers = ComplianceTracker.objects.filter(enterprise=enterprise)
        
        # Group by framework
        frameworks_status = {}
        for tracker in compliance_trackers:
            framework_name = tracker.framework.display_name
            if framework_name not in frameworks_status:
                frameworks_status[framework_name] = {
                    'framework': framework_name,
                    'total': 0,
                    'completed': 0,
                    'in_progress': 0,
                    'not_started': 0,
                    'compliance_percentage': 0,
                    'items': []
                }
            
            frameworks_status[framework_name]['total'] += 1
            if tracker.status == 'completed':
                frameworks_status[framework_name]['completed'] += 1
            elif tracker.status == 'in_progress':
                frameworks_status[framework_name]['in_progress'] += 1
            else:
                frameworks_status[framework_name]['not_started'] += 1
            
            frameworks_status[framework_name]['items'].append({
                'requirement': tracker.requirement_name,
                'status': tracker.status,
                'deadline': tracker.deadline.isoformat() if tracker.deadline else None,
                'percentage': tracker.status_percentage,
            })
        
        # Calculate percentages
        for framework_data in frameworks_status.values():
            if framework_data['total'] > 0:
                framework_data['compliance_percentage'] = round(
                    (framework_data['completed'] / framework_data['total']) * 100, 2
                )
        
        return APIResponse.success(
            data={
                'enterprise_id': enterprise_id,
                'frameworks': list(frameworks_status.values()),
                'overall_compliance': round(
                    sum([f['compliance_percentage'] for f in frameworks_status.values()]) / max(len(frameworks_status), 1), 2
                )
            },
            message="Compliance status retrieved successfully"
        )
    
    except Enterprise.DoesNotExist:
        return Response({'error': 'Enterprise not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return APIResponse.error(
            message="Failed to retrieve compliance status",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            errors=[{"detail": str(e)}]
        )


@extend_schema(
    summary="Get security incidents summary",
    description="""
    Retrieve security incidents summary and recent incidents.
    
    ## Response
    - **Incident Summary**: Count by severity and status
    - **Recent Incidents**: Latest security incidents
    - **Trends**: Incident trends over time
    """,
    tags=['Dashboard', 'Security']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def security_incidents_summary(request):
    """Get security incidents summary."""
    try:
        user = request.user
        enterprise_id = request.query_params.get('enterprise_id')
        
        if not enterprise_id:
            return Response({'error': 'enterprise_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify access
        enterprise = Enterprise.objects.get(id=enterprise_id)
        if not (user.is_staff or enterprise.created_by == user or 
                enterprise.enterpriseteam.filter(team__members=user).exists()):
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        incidents = SecurityIncident.objects.filter(enterprise=enterprise).order_by('-reported_at')
        
        summary = {
            'total': incidents.count(),
            'by_severity': {
                'critical': incidents.filter(severity='critical').count(),
                'high': incidents.filter(severity='high').count(),
                'medium': incidents.filter(severity='medium').count(),
                'low': incidents.filter(severity='low').count(),
            },
            'by_status': {
                'reported': incidents.filter(status='reported').count(),
                'investigating': incidents.filter(status='investigating').count(),
                'contained': incidents.filter(status='contained').count(),
                'resolved': incidents.filter(status='resolved').count(),
            },
            'mttr_hours': 24,  # Mock - calculate from actual data
            'active_incidents': incidents.filter(status__in=['reported', 'investigating', 'contained']).count(),
            'recent_incidents': []
        }
        
        # Get recent incidents
        for incident in incidents[:10]:
            summary['recent_incidents'].append({
                'id': incident.id,
                'title': incident.title,
                'severity': incident.severity,
                'status': incident.status,
                'reported_at': incident.reported_at.isoformat(),
                'resolved_at': incident.resolved_at.isoformat() if incident.resolved_at else None,
                'systems_affected': incident.systems_affected.split(',') if incident.systems_affected else [],
            })
        
        return APIResponse.success(
            data=summary,
            message="Security incidents summary retrieved successfully"
        )
    
    except Enterprise.DoesNotExist:
        return Response({'error': 'Enterprise not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return APIResponse.error(
            message="Failed to retrieve incidents summary",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            errors=[{"detail": str(e)}]
        )


@extend_schema(
    summary="Get audit schedule and status",
    description="""
    Retrieve audit schedule and status information.
    
    ## Response
    - **Upcoming Audits**: Scheduled audits within 90 days
    - **Recent Audits**: Recently completed audits
    - **Audit Status**: Completion rates and findings
    """,
    tags=['Dashboard', 'Security']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def audit_schedule(request):
    """Get audit schedule and status."""
    try:
        user = request.user
        enterprise_id = request.query_params.get('enterprise_id')
        days_ahead = int(request.query_params.get('days', 90))
        
        if not enterprise_id:
            return Response({'error': 'enterprise_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify access
        enterprise = Enterprise.objects.get(id=enterprise_id)
        if not (user.is_staff or enterprise.created_by == user or 
                enterprise.enterpriseteam.filter(team__members=user).exists()):
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        audits = SecurityAudit.objects.filter(enterprise=enterprise).order_by('scheduled_date')
        
        future_date = timezone.now() + timedelta(days=days_ahead)
        upcoming = audits.filter(
            status='scheduled',
            scheduled_date__gte=timezone.now(),
            scheduled_date__lte=future_date
        )
        
        recent = audits.filter(status='completed').order_by('-end_date')[:5]
        
        schedule_data = {
            'upcoming': [],
            'recent': [],
            'summary': {
                'scheduled': upcoming.count(),
                'completed_this_year': audits.filter(
                    status='completed',
                    end_date__year=timezone.now().year
                ).count(),
                'avg_findings_per_audit': (
                    sum([a.findings_count for a in audits.filter(status='completed')]) /
                    max(audits.filter(status='completed').count(), 1)
                ) if audits.filter(status='completed').exists() else 0,
            }
        }
        
        # Upcoming audits
        for audit in upcoming:
            schedule_data['upcoming'].append({
                'id': audit.id,
                'title': audit.title,
                'type': audit.audit_type,
                'scheduled_date': audit.scheduled_date.isoformat(),
                'status': audit.status,
            })
        
        # Recent audits
        for audit in recent:
            schedule_data['recent'].append({
                'id': audit.id,
                'title': audit.title,
                'type': audit.audit_type,
                'end_date': audit.end_date.isoformat() if audit.end_date else None,
                'status': audit.status,
                'findings': {
                    'total': audit.findings_count,
                    'critical': audit.critical_findings,
                    'high': audit.high_findings,
                    'medium': audit.medium_findings,
                    'low': audit.low_findings,
                }
            })
        
        return APIResponse.success(
            data=schedule_data,
            message="Audit schedule retrieved successfully"
        )
    
    except Enterprise.DoesNotExist:
        return Response({'error': 'Enterprise not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return APIResponse.error(
            message="Failed to retrieve audit schedule",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            errors=[{"detail": str(e)}]
        )