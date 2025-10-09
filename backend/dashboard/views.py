from django.http import JsonResponse
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from projects.models import Project
from teams.models import Team
from resources.models import Resource


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Get dashboard statistics for the logged-in user
    """
    user = request.user
    
    # Calculate user-specific stats (mock for now since we don't have user-project relationships)
    user_projects = 8  # Mock data
    user_teams = 2  # Mock data
    
    # Community metrics
    total_members = User.objects.filter(is_active=True).count()
    total_projects = Project.objects.count()
    active_projects = Project.objects.filter(
        created_at__gte=timezone.now() - timedelta(days=30)
    ).count()
    
    # Mock user stats (in a real app, these would come from actual user activity)
    user_contributions = 47  # This would be calculated from actual contributions
    community_rank = 156  # This would be calculated based on user activity
    reputation = 2847  # This would be calculated from community interactions
    badges = ['Contributor', 'Code Reviewer', 'Community Helper']
    
    # Recent activity (mock data - in real app, this would come from activity logs)
    recent_activities = [
        {
            'id': 1,
            'type': 'contribution',
            'title': 'Merged PR #234 in SmartCity Platform',
            'description': 'Fixed authentication middleware bug',
            'timestamp': '2 hours ago',
            'icon': 'code',
            'url': '/projects/',
        },
        {
            'id': 2,
            'type': 'discussion',
            'title': 'Replied to "Best practices for microservices"',
            'description': 'Shared insights on container orchestration',
            'timestamp': '4 hours ago',
            'icon': 'forum',
            'url': '/community/',
        },
        {
            'id': 3,
            'type': 'achievement',
            'title': 'Earned "Code Reviewer" badge',
            'description': 'Reviewed 10+ pull requests this month',
            'timestamp': '1 day ago',
            'icon': 'star',
        },
        {
            'id': 4,
            'type': 'project',
            'title': 'Started new project: API Gateway',
            'description': 'Cloud-native API gateway implementation',
            'timestamp': '2 days ago',
            'icon': 'assignment',
            'url': '/projects/',
        },
    ]
    
    # Community metrics
    community_metrics = {
        'totalMembers': total_members,
        'activeProjects': active_projects,
        'monthlyContributions': 156,  # Mock data
        'discussionThreads': 89,  # Mock data
        'codeReviews': 342,  # Mock data
        'releases': 28,  # Mock data
    }
    
    data = {
        'userStats': {
            'userContributions': user_contributions,
            'communityRank': community_rank,
            'totalProjects': user_projects,
            'activeDiscussions': 12,  # Mock data
            'reputation': reputation,
            'badges': badges,
        },
        'recentActivities': recent_activities,
        'communityMetrics': community_metrics,
        'user': {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
        }
    }
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get user profile information for the dashboard
    """
    user = request.user
    
    # Get user's projects and teams (mock data for now)
    user_projects = []  # Mock empty for now
    user_teams = []  # Mock empty for now
    
    data = {
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'date_joined': user.date_joined.isoformat(),
        'projects': [],  # Mock empty for now
        'teams': [],  # Mock empty for now
    }
    
    return Response(data)