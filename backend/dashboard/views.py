"""
Professional Dashboard API Views.

This module provides comprehensive REST API endpoints for the AtonixCorp Platform
dashboard with analytics, user statistics, and activity tracking.
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