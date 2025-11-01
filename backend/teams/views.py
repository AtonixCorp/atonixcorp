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
from .models import Team, TeamMember, TeamSkill, TeamMembership, TeamInvitation
from .serializers import (
    TeamSerializer, TeamListSerializer,
    TeamMemberSerializer, TeamSkillSerializer,
    TeamMembershipSerializer, TeamInvitationSerializer,
    UserTeamMembershipSerializer, TeamJoinSerializer, TeamLoginSerializer
)


class TeamViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Team.objects.filter(is_active=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'mission', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'list':
            return TeamListSerializer
        return TeamSerializer

    @action(detail=True, methods=['get'])
    def members(self, request, slug=None):
        """Get team members"""
        team = self.get_object()
        members = team.members.all()
        serializer = TeamMemberSerializer(members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def skills(self, request, slug=None):
        """Get team skills"""
        team = self.get_object()
        skills = team.skills.all()
        serializer = TeamSkillSerializer(skills, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def join(self, request, slug=None):
        """Join a team"""
        team = self.get_object()
        serializer = TeamJoinSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Check if user is already a member
        existing_membership = TeamMembership.objects.filter(
            user=request.user, team=team, is_active=True
        ).first()

        if existing_membership:
            return Response(
                {'detail': 'You are already a member of this team.'},
                status=status.HTTP_400_BAD_REQUEST
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
        return Response(membership_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def membership(self, request, slug=None):
        """Get user's membership in this team"""
        team = self.get_object()
        membership = TeamMembership.objects.filter(
            user=request.user, team=team, is_active=True
        ).first()

        if not membership:
            return Response(
                {'detail': 'You are not a member of this team.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = TeamMembershipSerializer(membership)
        return Response(serializer.data)


class TeamMemberViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['team', 'is_lead']
    search_fields = ['name', 'role', 'bio']


class TeamSkillViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TeamSkill.objects.all()
    serializer_class = TeamSkillSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['team', 'proficiency_level']


class TeamMembershipViewSet(viewsets.ReadOnlyModelViewSet):
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
        """Get all user's team memberships"""
        memberships = self.get_queryset()
        serializer = UserTeamMembershipSerializer(memberships, many=True)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def team_login(request):
    """Team-specific login endpoint"""
    serializer = TeamLoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    username = serializer.validated_data['username']
    password = serializer.validated_data['password']
    team_slug = serializer.validated_data['team_slug']

    # Authenticate user
    user = authenticate(username=username, password=password)
    if not user:
        return Response(
            {'detail': 'Invalid credentials.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Check if user is a member of the team
    team = get_object_or_404(Team, slug=team_slug, is_active=True)
    membership = TeamMembership.objects.filter(
        user=user, team=team, is_active=True
    ).first()

    if not membership:
        return Response(
            {'detail': 'You are not a member of this team.'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Update last login
    membership.last_login = timezone.now()
    membership.save()

    # Get or create auth token
    token, created = Token.objects.get_or_create(user=user)

    return Response({
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
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_team(request, team_slug):
    """Leave a team"""
    team = get_object_or_404(Team, slug=team_slug, is_active=True)
    membership = TeamMembership.objects.filter(
        user=request.user, team=team, is_active=True
    ).first()

    if not membership:
        return Response(
            {'detail': 'You are not a member of this team.'},
            status=status.HTTP_404_NOT_FOUND
        )

    membership.is_active = False
    membership.save()

    return Response({'detail': 'Successfully left the team.'})
