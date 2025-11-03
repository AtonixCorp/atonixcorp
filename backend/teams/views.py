"""
Professional Team Management API Views.

This module provides comprehensive REST API endpoints for the AtonixCorp Platform
team management system with proper error handling, documentation,
and professional response formatting.
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from core.api_utils import APIResponse
from .models import Team, TeamMember, TeamSkill, TeamMembership, TeamInvitation
from .serializers import (
    TeamSerializer, TeamListSerializer,
    TeamMemberSerializer, TeamSkillSerializer,
    TeamMembershipSerializer, TeamInvitationSerializer,
    UserTeamMembershipSerializer, TeamJoinSerializer, TeamLoginSerializer
)


@extend_schema_view(
    list=extend_schema(
        summary="List all teams",
        description="""
        Retrieve a paginated list of all active teams with filtering and search capabilities.

        ## Features
        - **Search**: Search across team name, mission, and description
        - **Ordering**: Sort by name or creation date
        - **Pagination**: Results are paginated for better performance

        ## Response Format
        Returns a standardized response with team data and pagination metadata.
        """,
        parameters=[
            OpenApiParameter(
                name='search',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Search in team name, mission, and description'
            ),
            OpenApiParameter(
                name='ordering',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Order results by field (name, created_at). Prefix with - for descending order.',
                enum=['name', '-name', 'created_at', '-created_at']
            ),
        ],
        tags=['Teams']
    ),
    retrieve=extend_schema(
        summary="Get team details",
        description="""
        Retrieve detailed information about a specific team including members,
        skills, and related metadata.
        """,
        tags=['Teams']
    ),
    members=extend_schema(
        summary="Get team members",
        description="Retrieve all members of a specific team",
        tags=['Teams']
    ),
    skills=extend_schema(
        summary="Get team skills",
        description="Retrieve all skills associated with a specific team",
        tags=['Teams']
    ),
    join=extend_schema(
        summary="Join a team",
        description="Request to join a team as a new member",
        tags=['Teams']
    ),
    membership=extend_schema(
        summary="Get team membership",
        description="Get the authenticated user's membership details for a team",
        tags=['Teams']
    )
)
class TeamViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Professional API ViewSet for Team management.

    Provides comprehensive read-only access to teams with advanced
    filtering, searching, and membership management capabilities.
    """

    queryset = Team.objects.filter(is_active=True).prefetch_related(
        'members', 'skills'
    )
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'mission', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    lookup_field = 'slug'
    permission_classes = [AllowAny]  # Public read access

    def get_serializer_class(self):
        if self.action == 'list':
            return TeamListSerializer
        return TeamSerializer

    def list(self, request, *args, **kwargs):
        """
        Enhanced list view with professional response formatting.
        """
        try:
            queryset = self.filter_queryset(self.get_queryset())

            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                paginated_response = self.get_paginated_response(serializer.data)

                return APIResponse.paginated(
                    data=paginated_response.data['results'],
                    paginator=self.paginator,
                    message="Teams retrieved successfully"
                )

            serializer = self.get_serializer(queryset, many=True)
            return APIResponse.success(
                data=serializer.data,
                message="Teams retrieved successfully"
            )

        except Exception as e:
            return APIResponse.error(
                message="Failed to retrieve teams",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        """
        Enhanced retrieve view with professional response formatting.
        """
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return APIResponse.success(
                data=serializer.data,
                message=f"Team '{instance.name}' retrieved successfully"
            )
        except Exception as e:
            return APIResponse.error(
                message="Team not found",
                status_code=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def members(self, request, slug=None):
        """
        Get all members of a specific team.
        """
        try:
            team = self.get_object()
            members = team.members.filter(teammembership__is_active=True)
            serializer = TeamMemberSerializer(members, many=True)

            return APIResponse.success(
                data=serializer.data,
                message=f"Retrieved {members.count()} members for team '{team.name}'"
            )
        except Exception as e:
            return APIResponse.error(
                message="Failed to retrieve team members",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def skills(self, request, slug=None):
        """
        Get all skills associated with a specific team.
        """
        try:
            team = self.get_object()
            skills = team.skills.all()
            serializer = TeamSkillSerializer(skills, many=True)

            return APIResponse.success(
                data=serializer.data,
                message=f"Retrieved {skills.count()} skills for team '{team.name}'"
            )
        except Exception as e:
            return APIResponse.error(
                message="Failed to retrieve team skills",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def join(self, request, slug=None):
        """
        Join a team as a new member.
        """
        try:
            team = self.get_object()
            serializer = TeamJoinSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            # Check if user is already a member
            existing_membership = TeamMembership.objects.filter(
                user=request.user, team=team, is_active=True
            ).first()

            if existing_membership:
                return APIResponse.error(
                    message="You are already a member of this team",
                    status_code=status.HTTP_400_BAD_REQUEST
                )

            # Create membership
            membership = TeamMembership.objects.create(
                user=request.user,
                team=team,
                membership_type=serializer.validated_data.get('membership_type', 'free'),
                role=serializer.validated_data.get('role', ''),
                bio=serializer.validated_data.get('bio', '')
            )

            membership_serializer = TeamMembershipSerializer(membership)
            return APIResponse.success(
                data=membership_serializer.data,
                message=f"Successfully joined team '{team.name}'",
                status_code=status.HTTP_201_CREATED
            )

        except Exception as e:
            return APIResponse.error(
                message="Failed to join team",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def membership(self, request, slug=None):
        """
        Get the authenticated user's membership details for this team.
        """
        try:
            team = self.get_object()
            membership = TeamMembership.objects.filter(
                user=request.user, team=team, is_active=True
            ).first()

            if not membership:
                return APIResponse.error(
                    message="You are not a member of this team",
                    status_code=status.HTTP_404_NOT_FOUND
                )

            serializer = TeamMembershipSerializer(membership)
            return APIResponse.success(
                data=serializer.data,
                message="Team membership retrieved successfully"
            )

        except Exception as e:
            return APIResponse.error(
                message="Failed to retrieve team membership",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@extend_schema_view(
    list=extend_schema(
        summary="List team members",
        description="Retrieve team members with filtering capabilities",
        tags=['Team Members']
    ),
    retrieve=extend_schema(
        summary="Get member details",
        description="Retrieve detailed information about a specific team member",
        tags=['Team Members']
    )
)
class TeamMemberViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Professional API ViewSet for Team Members.
    """
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['team', 'is_lead']
    search_fields = ['name', 'role', 'bio']
    permission_classes = [AllowAny]


@extend_schema_view(
    list=extend_schema(
        summary="List team skills",
        description="Retrieve team skills with filtering capabilities",
        tags=['Team Skills']
    ),
    retrieve=extend_schema(
        summary="Get skill details",
        description="Retrieve detailed information about a specific team skill",
        tags=['Team Skills']
    )
)
class TeamSkillViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Professional API ViewSet for Team Skills.
    """
    queryset = TeamSkill.objects.all()
    serializer_class = TeamSkillSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['team', 'proficiency_level']
    permission_classes = [AllowAny]


@extend_schema_view(
    list=extend_schema(
        summary="List team memberships",
        description="Retrieve user's team memberships with filtering",
        tags=['Team Memberships']
    ),
    retrieve=extend_schema(
        summary="Get membership details",
        description="Retrieve detailed information about a specific team membership",
        tags=['Team Memberships']
    ),
    my_memberships=extend_schema(
        summary="Get my memberships",
        description="Retrieve all team memberships for the authenticated user",
        tags=['Team Memberships']
    )
)
class TeamMembershipViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Professional API ViewSet for Team Memberships.
    """
    queryset = TeamMembership.objects.all()
    serializer_class = TeamMembershipSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['team', 'membership_type', 'is_active']
    ordering_fields = ['joined_at', 'last_login']
    ordering = ['-joined_at']

    def get_queryset(self):
        return TeamMembership.objects.filter(user=self.request.user, is_active=True)

    @action(detail=False, methods=['get'])
    def my_memberships(self, request):
        """
        Get all team memberships for the authenticated user.
        """
        try:
            memberships = self.get_queryset()
            serializer = UserTeamMembershipSerializer(memberships, many=True)

            return APIResponse.success(
                data=serializer.data,
                message=f"Retrieved {memberships.count()} team memberships"
            )

        except Exception as e:
            return APIResponse.error(
                message="Failed to retrieve team memberships",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@extend_schema(
    summary="Team login",
    description="""
    Authenticate a user and verify team membership.

    ## Authentication Process
    1. Validate user credentials
    2. Verify user is a member of the specified team
    3. Return authentication token and team membership details

    ## Response Format
    Returns authentication token and user/team information.
    """,
    tags=['Authentication']
)
@api_view(['POST'])
@permission_classes([AllowAny])
def team_login(request):
    """
    Team-specific login endpoint with membership verification.
    """
    try:
        serializer = TeamLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        team_slug = serializer.validated_data['team_slug']

        # Authenticate user
        user = authenticate(username=username, password=password)
        if not user:
            return APIResponse.error(
                message="Invalid credentials",
                status_code=status.HTTP_401_UNAUTHORIZED
            )

        # Check if user is a member of the team
        team = get_object_or_404(Team, slug=team_slug, is_active=True)
        membership = TeamMembership.objects.filter(
            user=user, team=team, is_active=True
        ).first()

        if not membership:
            return APIResponse.error(
                message="You are not a member of this team",
                status_code=status.HTTP_403_FORBIDDEN
            )

        # Update last login
        membership.last_login = timezone.now()
        membership.save()

        # Get or create auth token
        token, created = Token.objects.get_or_create(user=user)

        data = {
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            },
            'team': {
                'id': team.id,
                'name': team.name,
                'slug': team.slug,
                'membership_type': membership.membership_type,
                'role': membership.role,
            }
        }

        return APIResponse.success(
            data=data,
            message="Team login successful"
        )

    except Exception as e:
        return APIResponse.error(
            message="Team login failed",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Leave team",
    description="Remove the authenticated user from a team membership",
    tags=['Teams']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_team(request, team_slug):
    """
    Leave a team by deactivating the user's membership.
    """
    try:
        team = get_object_or_404(Team, slug=team_slug, is_active=True)
        membership = TeamMembership.objects.filter(
            user=request.user, team=team, is_active=True
        ).first()

        if not membership:
            return APIResponse.error(
                message="You are not a member of this team",
                status_code=status.HTTP_404_NOT_FOUND
            )

        membership.is_active = False
        membership.save()

        return APIResponse.success(
            message=f"Successfully left team '{team.name}'"
        )

    except Exception as e:
        return APIResponse.error(
            message="Failed to leave team",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
