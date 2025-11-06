from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, IsAdminUser
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_spectacular.utils import extend_schema, extend_schema_view
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from datetime import timedelta
from django.utils import timezone
from .models import Enterprise, EnterpriseTeam, EnterpriseGroup, MigrationRun
from .security_models import (
    SecurityFramework, EnterpriseSecurityPolicy, SecurityHardeningChecklist,
    SecurityControl, SecurityAudit, SecurityIncident, ComplianceTracker
)
from .serializers import (
    EnterpriseSerializer, EnterpriseTeamSerializer, EnterpriseTeamCreateSerializer,
    EnterpriseGroupSerializer, MigrationRunSerializer
)
from .security_serializers import (
    SecurityFrameworkSerializer, EnterpriseSecurityPolicySerializer,
    SecurityHardeningChecklistSerializer, SecurityControlSerializer,
    SecurityAuditSerializer, SecurityIncidentSerializer, ComplianceTrackerSerializer
)


@extend_schema_view(
    list=extend_schema(summary="List enterprises", tags=["Enterprises"]),
    retrieve=extend_schema(summary="Get enterprise", tags=["Enterprises"]),
    create=extend_schema(summary="Create enterprise", description="Create an enterprise (staff only)", tags=["Enterprises"]),
)
class EnterpriseViewSet(viewsets.ModelViewSet):
    queryset = Enterprise.objects.all()
    serializer_class = EnterpriseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        # Require staff/admin for write actions: create, update, partial_update, destroy
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdminUser()]
        # For nested POSTs (add_team, groups POST) require authenticated users
        if self.action in ('add_team',) or (self.action == 'groups' and self.request.method == 'POST'):
            return [IsAuthenticated()]
        return [perm() for perm in self.permission_classes]

    @action(detail=True, methods=['get'], url_path='teams')
    def teams(self, request, pk=None):
        enterprise = self.get_object()
        links = EnterpriseTeam.objects.filter(enterprise=enterprise).select_related('team')
        serializer = EnterpriseTeamSerializer(links, many=True)
        return Response({'data': serializer.data})

    @teams.mapping.post
    def add_team(self, request, pk=None):
        enterprise = self.get_object()
        serializer = EnterpriseTeamCreateSerializer(data=request.data, context={'enterprise': enterprise})
        serializer.is_valid(raise_exception=True)
        link = serializer.save()
        out = EnterpriseTeamSerializer(link)
        return Response(out.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'], url_path='groups')
    def groups(self, request, pk=None):
        enterprise = self.get_object()
        if request.method == 'GET':
            groups = EnterpriseGroup.objects.filter(enterprise=enterprise)
            serializer = EnterpriseGroupSerializer(groups, many=True)
            return Response({'data': serializer.data})

        # POST - create group
        serializer = EnterpriseGroupSerializer(data={**request.data, 'enterprise': enterprise.id})
        serializer.is_valid(raise_exception=True)
        group = serializer.save()
        return Response(EnterpriseGroupSerializer(group).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='migration/runs')
    def migration_runs(self, request, pk=None):
        enterprise = self.get_object()
        runs = MigrationRun.objects.filter(enterprise=enterprise).order_by('-started_at')
        serializer = MigrationRunSerializer(runs, many=True)
        return Response({'data': serializer.data})

    @action(detail=True, methods=['get'], url_path='analytics/scores')
    def analytics_scores(self, request, pk=None):
        enterprise = self.get_object()
        days = int(request.query_params.get('days', 30))
        
        # Generate mock analytics data for now
        import random
        from datetime import datetime, timedelta
        
        scores = []
        base_date = datetime.now()
        for i in range(days):
            date = base_date - timedelta(days=i)
            # Generate a score between 0-100 with some variation
            score = min(100, max(0, 50 + 30 * random.sin(i / 4) + (random.random() * 20 - 10)))
            scores.append({
                'date': date.strftime('%Y-%m-%d'),
                'score': round(score, 2)
            })
        
        return Response(scores)


# ============================================================================
# SECURITY ENTERPRISE VIEWSETS
# ============================================================================

class SecurityFrameworkViewSet(viewsets.ReadOnlyModelViewSet):
    """Security framework reference data - read-only"""
    queryset = SecurityFramework.objects.all()
    serializer_class = SecurityFrameworkSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def by_name(self, request):
        """Get framework by name"""
        name = request.query_params.get('name')
        if not name:
            return Response({'error': 'name parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        framework = get_object_or_404(SecurityFramework, name=name)
        serializer = self.get_serializer(framework)
        return Response(serializer.data)


class EnterpriseSecurityPolicyViewSet(viewsets.ModelViewSet):
    """Manage enterprise security policies"""
    serializer_class = EnterpriseSecurityPolicySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['enterprise', 'primary_framework']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-updated_at']
    
    def get_queryset(self):
        user = self.request.user
        # Admin sees all, enterprise members see their enterprise policies
        if user.is_staff:
            return EnterpriseSecurityPolicy.objects.select_related('enterprise', 'primary_framework', 'updated_by').prefetch_related('frameworks')
        # Filter to enterprises where user has membership
        return EnterpriseSecurityPolicy.objects.filter(
            enterprise__enterpriseteam__team__members=user
        ).distinct().select_related('enterprise', 'primary_framework', 'updated_by').prefetch_related('frameworks')
    
    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    @action(detail=True, methods=['get'])
    def compliance_summary(self, request, pk=None):
        """Get compliance summary for a policy"""
        policy = self.get_object()
        
        compliance_data = {
            'policy_id': policy.id,
            'enterprise': policy.enterprise.id,
            'frameworks': [f.display_name for f in policy.frameworks.all()],
            'summary': {
                'mfa_enabled': policy.mfa_required,
                'encryption_enabled': policy.encryption_at_rest,
                'audit_logging': policy.enable_audit_logging,
                'backup_enabled': policy.enable_backups,
                'vulnerability_scanning': policy.enable_vuln_scanning,
            },
            'updated_at': policy.updated_at
        }
        return Response(compliance_data)


class SecurityHardeningChecklistViewSet(viewsets.ModelViewSet):
    """Manage security hardening checklists"""
    serializer_class = SecurityHardeningChecklistSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['enterprise', 'system_type', 'status']
    ordering_fields = ['created_at', 'updated_at', 'completion_percentage']
    ordering = ['-completion_percentage']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return SecurityHardeningChecklist.objects.select_related('enterprise', 'verified_by')
        return SecurityHardeningChecklist.objects.filter(
            enterprise__enterpriseteam__team__members=user
        ).distinct().select_related('enterprise', 'verified_by')
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Mark checklist as verified"""
        checklist = self.get_object()
        checklist.verified_by = request.user
        checklist.last_verified_at = timezone.now()
        checklist.status = 'verified'
        checklist.save()
        
        serializer = self.get_serializer(checklist)
        return Response(serializer.data)


class SecurityControlViewSet(viewsets.ModelViewSet):
    """Manage security controls"""
    serializer_class = SecurityControlSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['enterprise', 'framework', 'status', 'priority']
    search_fields = ['control_id', 'name', 'description']
    ordering_fields = ['created_at', 'updated_at', 'priority']
    ordering = ['priority', '-updated_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return SecurityControl.objects.select_related('enterprise', 'framework', 'verified_by')
        return SecurityControl.objects.filter(
            enterprise__enterpriseteam__team__members=user
        ).distinct().select_related('enterprise', 'framework', 'verified_by')
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Mark control as verified"""
        control = self.get_object()
        control.status = 'verified'
        control.verified_by = request.user
        control.verification_date = timezone.now()
        control.save()
        
        serializer = self.get_serializer(control)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_framework(self, request):
        """Get all controls for a specific framework"""
        framework_id = request.query_params.get('framework_id')
        if not framework_id:
            return Response({'error': 'framework_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(framework_id=framework_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class SecurityAuditViewSet(viewsets.ModelViewSet):
    """Manage security audits"""
    serializer_class = SecurityAuditSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['enterprise', 'audit_type', 'status']
    ordering_fields = ['created_at', 'scheduled_date', 'start_date', 'end_date']
    ordering = ['-scheduled_date']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return SecurityAudit.objects.select_related('enterprise').order_by('-created_at')
        return SecurityAudit.objects.filter(
            enterprise__enterpriseteam__team__members=user
        ).distinct().select_related('enterprise').order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start an audit"""
        audit = self.get_object()
        if audit.status != 'scheduled':
            return Response({'error': 'Only scheduled audits can be started'}, status=status.HTTP_400_BAD_REQUEST)
        
        audit.status = 'in_progress'
        audit.start_date = timezone.now()
        audit.save()
        
        serializer = self.get_serializer(audit)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark audit as complete"""
        audit = self.get_object()
        if audit.status not in ['in_progress', 'scheduled']:
            return Response({'error': 'Audit cannot be completed from current status'}, status=status.HTTP_400_BAD_REQUEST)
        
        audit.status = 'completed'
        audit.end_date = timezone.now()
        
        # Update finding counts from findings_json if provided
        if 'findings_count' in request.data:
            audit.findings_count = request.data.get('findings_count', 0)
            audit.critical_findings = request.data.get('critical_findings', 0)
            audit.high_findings = request.data.get('high_findings', 0)
            audit.medium_findings = request.data.get('medium_findings', 0)
            audit.low_findings = request.data.get('low_findings', 0)
        
        audit.save()
        serializer = self.get_serializer(audit)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming scheduled audits"""
        days_ahead = int(request.query_params.get('days', 30))
        future_date = timezone.now() + timedelta(days=days_ahead)
        
        queryset = self.get_queryset().filter(
            status='scheduled',
            scheduled_date__gte=timezone.now(),
            scheduled_date__lte=future_date
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class SecurityIncidentViewSet(viewsets.ModelViewSet):
    """Manage security incidents"""
    serializer_class = SecurityIncidentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['enterprise', 'severity', 'status']
    ordering_fields = ['created_at', 'reported_at', 'resolved_at', 'severity']
    ordering = ['-reported_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return SecurityIncident.objects.select_related('enterprise').order_by('-reported_at')
        return SecurityIncident.objects.filter(
            enterprise__enterpriseteam__team__members=user
        ).distinct().select_related('enterprise').order_by('-reported_at')
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update incident status"""
        incident = self.get_object()
        new_status = request.data.get('status')
        
        valid_statuses = ['reported', 'investigating', 'contained', 'resolved']
        if new_status not in valid_statuses:
            return Response({'error': f'Invalid status. Must be one of: {valid_statuses}'}, status=status.HTTP_400_BAD_REQUEST)
        
        incident.status = new_status
        
        # Update timestamps
        if new_status == 'investigating' and not incident.detected_at:
            incident.detected_at = timezone.now()
        elif new_status == 'contained' and not incident.contained_at:
            incident.contained_at = timezone.now()
        elif new_status == 'resolved' and not incident.resolved_at:
            incident.resolved_at = timezone.now()
        
        incident.save()
        serializer = self.get_serializer(incident)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active incidents"""
        queryset = self.get_queryset().filter(status__in=['reported', 'investigating', 'contained'])
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_severity(self, request):
        """Get incidents grouped by severity"""
        queryset = self.get_queryset()
        
        severity_groups = {
            'critical': queryset.filter(severity='critical').count(),
            'high': queryset.filter(severity='high').count(),
            'medium': queryset.filter(severity='medium').count(),
            'low': queryset.filter(severity='low').count(),
        }
        
        return Response(severity_groups)


class ComplianceTrackerViewSet(viewsets.ModelViewSet):
    """Manage compliance tracking"""
    serializer_class = ComplianceTrackerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['enterprise', 'framework', 'status']
    search_fields = ['requirement_name', 'description', 'section_reference']
    ordering_fields = ['created_at', 'deadline', 'status_percentage']
    ordering = ['deadline']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return ComplianceTracker.objects.select_related('enterprise', 'framework', 'owner')
        return ComplianceTracker.objects.filter(
            enterprise__enterpriseteam__team__members=user
        ).distinct().select_related('enterprise', 'framework', 'owner')
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue compliance items"""
        queryset = self.get_queryset().filter(
            deadline__lt=timezone.now(),
            status__in=['in_progress', 'not_started']
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_framework(self, request):
        """Get compliance items grouped by framework"""
        framework_id = request.query_params.get('framework_id')
        if not framework_id:
            return Response({'error': 'framework_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(framework_id=framework_id)
        
        summary = {
            'framework_id': framework_id,
            'total': queryset.count(),
            'completed': queryset.filter(status='completed').count(),
            'in_progress': queryset.filter(status='in_progress').count(),
            'not_started': queryset.filter(status='not_started').count(),
            'overall_percentage': sum([t.status_percentage for t in queryset]) / max(queryset.count(), 1),
            'items': ComplianceTrackerSerializer(queryset, many=True).data
        }
        
        return Response(summary)
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Mark compliance item as completed"""
        tracker = self.get_object()
        tracker.status = 'completed'
        tracker.status_percentage = 100
        tracker.completed_date = timezone.now()
        tracker.owner = request.user
        tracker.save()
        
        serializer = self.get_serializer(tracker)
        return Response(serializer.data)
