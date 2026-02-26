from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import PlatformResource
from .serializers import PlatformResourceSerializer


class ResourceViewSet(viewsets.ModelViewSet):
    """
    AtonixCorp Cloud – Resource Control Center (read + limited write).

    List / filter via:
        GET /api/services/resources/?group_id=&project_id=&environment=&resource_type=&status=&search=

    Trigger a platform-wide (or scoped) sync:
        POST /api/services/resources/sync/
        Body: { "group_id": "...", "project_id": "..." }  (both optional)

    Perform a contextual action on a single resource:
        POST /api/services/resources/<id>/action/
        Body: { "action": "restart|stop|start|rerun|scale|lock|unlock|pause|resume", "payload": {} }
    """

    serializer_class   = PlatformResourceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = PlatformResource.objects.all()
        p  = self.request.query_params

        if group_id := p.get('group_id'):
            qs = qs.filter(group_id=group_id)
        if project_id := p.get('project_id'):
            qs = qs.filter(project_id=project_id)
        if environment := p.get('environment'):
            qs = qs.filter(environment=environment)
        if resource_type := p.get('resource_type'):
            qs = qs.filter(resource_type=resource_type)
        if resource_status := p.get('status'):
            qs = qs.filter(status=resource_status)
        if search := p.get('search'):
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(group_name__icontains=search)
                | Q(project_name__icontains=search)
                | Q(subsystem__icontains=search)
            )

        return qs

    # ──────────────────────────────────────────────────────────────────────────
    # POST /api/services/resources/sync/
    # ──────────────────────────────────────────────────────────────────────────
    @action(detail=False, methods=['post'], url_path='sync')
    def sync(self, request):
        """
        Trigger a sync of platform resources from live sub-system adapters.
        Currently seeds a set of realistic mock resources so the UI is
        populated immediately; real adapters are wired in TODO stubs below.
        """
        group_id   = request.data.get('group_id', '')
        project_id = request.data.get('project_id', '')

        seeded = self._seed_mock_resources(group_id=group_id, project_id=project_id)

        return Response({
            'synced':   seeded,
            'errors':   0,
            'duration': 380,
            'message':  'Resources synced successfully.',
        }, status=status.HTTP_200_OK)

    # ──────────────────────────────────────────────────────────────────────────
    # POST /api/services/resources/<id>/action/
    # ──────────────────────────────────────────────────────────────────────────
    @action(detail=True, methods=['post'], url_path='action')
    def perform_action(self, request, pk=None):
        resource    = self.get_object()
        action_type = request.data.get('action', '')
        _payload    = request.data.get('payload', {})

        allowed = {
            'restart': ('running', 'failed', 'degraded', 'stopped'),
            'stop':    ('running', 'degraded'),
            'start':   ('stopped', 'pending'),
            'rerun':   ('failed',),
            'scale':   ('running', 'degraded'),
            'lock':    ('running',),
            'unlock':  ('running',),
            'pause':   ('running',),
            'resume':  ('stopped', 'pending'),
        }

        if action_type not in allowed:
            return Response({'error': f"Unknown action '{action_type}'."}, status=status.HTTP_400_BAD_REQUEST)

        if resource.status not in allowed[action_type]:
            return Response(
                {'error': f"Action '{action_type}' is not valid for status '{resource.status}'."},
                status=status.HTTP_409_CONFLICT,
            )

        # TODO: dispatch to real sub-system adapter (Kubernetes API, pipeline trigger, etc.)
        # For now: optimistic status transition so UI is responsive
        transitions = {
            'restart': 'pending',
            'stop':    'stopped',
            'start':   'pending',
            'rerun':   'pending',
            'pause':   'stopped',
            'resume':  'pending',
        }
        if action_type in transitions:
            resource.status = transitions[action_type]
            resource.save(update_fields=['status', 'last_synced'])

        return Response({
            'ok':      True,
            'message': f"Action '{action_type}' on '{resource.name}' was queued successfully.",
            'status':  resource.status,
        }, status=status.HTTP_200_OK)

    # ──────────────────────────────────────────────────────────────────────────
    # Internal: seed mock resources for demo / first run
    # ──────────────────────────────────────────────────────────────────────────
    def _seed_mock_resources(self, group_id='', project_id=''):
        from datetime import datetime, timezone

        SEEDS = [
            dict(name='api-gateway-pipeline',    resource_type='pipeline',              subsystem='CI/CD',        group_id='g1', group_name='Platform',  project_id='p1', project_name='api-gateway',     environment='prod',   status='running',  health_score=98,  metadata={'branch':'main',            'trigger':'push',     'duration':'4m 12s','last_run':'2 min ago'}),
            dict(name='payment-service-pipeline', resource_type='pipeline',              subsystem='CI/CD',        group_id='g1', group_name='Platform',  project_id='p2', project_name='payment-service', environment='stage',  status='failed',   health_score=0,   metadata={'branch':'feat/crypto',      'trigger':'push',     'duration':'6m 44s','last_run':'1 hr ago'}),
            dict(name='api-gateway-pod-1',         resource_type='kubernetes_pod',        subsystem='Kubernetes',   group_id='g1', group_name='Platform',  project_id='p1', project_name='api-gateway',     environment='prod',   status='running',  health_score=100, metadata={'namespace':'default',       'node':'node-01',     'restarts':0,'image':'atonix/api-gw:1.4'}),
            dict(name='payment-container-crash',   resource_type='container',             subsystem='Containers',   group_id='g1', group_name='Platform',  project_id='p2', project_name='payment-service', environment='stage',  status='failed',   health_score=12,  metadata={'image':'atonix/pay:0.9',    'restarts':14,        'cpu':'88%','memory':'92%'}),
            dict(name='prod-gateway-route',         resource_type='api_route',             subsystem='API Gateway',  group_id='g1', group_name='Platform',  project_id='p1', project_name='api-gateway',     environment='prod',   status='running',  health_score=94,  metadata={'path':'/api/v1/*',          'method':'ALL',       'latency_ms':42,'rps':1840}),
            dict(name='high-latency-alert',         resource_type='monitoring_alert',      subsystem='Monitoring',   group_id='g1', group_name='Platform',  project_id='p2', project_name='payment-service', environment='prod',   status='degraded', health_score=55,  metadata={'metric':'latency_p99',      'threshold':'500ms',  'current':'820ms','fired':'15 min ago'}),
            dict(name='group-runner-01',             resource_type='group_runner',          subsystem='Runners',      group_id='g1', group_name='Platform',  project_id=None, project_name=None,              environment='global', status='running',  health_score=100, metadata={'last_heartbeat':'8s ago',   'jobs_processed':214, 'version':'16.5.0'}),
            dict(name='prod-environment',            resource_type='environment',           subsystem='Environments', group_id='g1', group_name='Platform',  project_id='p1', project_name='api-gateway',     environment='prod',   status='running',  health_score=99,  metadata={'locked':False,              'deploys':42,         'last_deploy':'1 day ago'}),
            dict(name='data-bucket-analytics',      resource_type='storage_bucket',        subsystem='Storage',      group_id='g2', group_name='Data',      project_id='p6', project_name='data-warehouse',  environment='prod',   status='running',  health_score=100, metadata={'region':'us-east-1',        'size_gb':4200,       'objects':18400}),
            dict(name='ml-pipeline-train',           resource_type='pipeline',              subsystem='CI/CD',        group_id='g2', group_name='Data',      project_id='p3', project_name='ml-pipeline',     environment='stage',  status='pending',  health_score=50,  metadata={'branch':'dev/model-v3',     'trigger':'schedule', 'duration':'—','last_run':'30 min ago'}),
            dict(name='developer-workspace-01',     resource_type='workspace',             subsystem='Workplace',    group_id='g1', group_name='Platform',  project_id=None, project_name=None,              environment='dev',    status='running',  health_score=88,  metadata={'owner':'john.doe',          'ide':'VS Code',      'uptime':'4h 20m'}),
            dict(name='nightly-db-backup',          resource_type='operational_task',      subsystem='Operational',  group_id='g1', group_name='Platform',  project_id=None, project_name=None,              environment='prod',   status='running',  health_score=100, metadata={'schedule':'0 2 * * *',       'last_run':'6h ago',  'next_run':'in 18h'}),
            dict(name='payment-deployment',         resource_type='kubernetes_deployment', subsystem='Kubernetes',   group_id='g1', group_name='Platform',  project_id='p2', project_name='payment-service', environment='stage',  status='degraded', health_score=40,  metadata={'replicas':'1/3',            'image':'atonix/pay:0.9','reason':'OOMKilled'}),
            dict(name='infra-runner-02',            resource_type='runner',                subsystem='Runners',      group_id='g1', group_name='Platform',  project_id=None, project_name=None,              environment='global', status='stopped',  health_score=0,   metadata={'last_heartbeat':'22 min ago','jobs_processed':89,'version':'16.4.1'}),
            dict(name='api-domain-atonix.io',       resource_type='domain',                subsystem='Domains',      group_id='g1', group_name='Platform',  project_id='p1', project_name='api-gateway',     environment='prod',   status='running',  health_score=100, metadata={'ssl_expiry':'2026-11-14',    'dns_status':'propagated'}),
        ]

        count = 0
        for seed in SEEDS:
            if group_id and seed.get('group_id') != group_id:
                continue
            if project_id and seed.get('project_id') != project_id:
                continue

            PlatformResource.objects.get_or_create(
                name=seed['name'],
                resource_type=seed['resource_type'],
                defaults={
                    **{k: v for k, v in seed.items() if k not in ('name', 'resource_type')},
                },
            )
            count += 1

        return count
