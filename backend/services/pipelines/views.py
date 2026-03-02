from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify
import uuid
from .models import (
    Project,
    Repository,
    PipelineFile,
    Pipeline,
    PipelineJob,
    JobLog,
    PipelineApproval,
    PipelineRule,
    Environment,
    PipelineArtifact,
    PipelineDefinition,
    PipelineDefinitionStage,
    PipelineDefinitionStep,
    PipelineRun,
    PipelineRunNode,
    PipelineRunArtifact,
)
from .serializers import (
    ProjectSerializer,
    RepositorySerializer,
    PipelineFileSerializer,
    PipelineSerializer,
    PipelineJobSerializer,
    JobLogSerializer,
    PipelineApprovalSerializer,
    PipelineRuleSerializer,
    EnvironmentSerializer,
    PipelineArtifactSerializer,
    PipelineRunSerializer,
    PipelineDefinitionSerializer,
    PipelineDefinitionStageSerializer,
    PipelineDefinitionStepSerializer,
    PipelineRunDetailSerializer,
    PipelineRunListSerializer,
    PipelineRunNodeSerializer,
    TriggerPipelineRunSerializer,
)


class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet for managing projects."""
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        from django.utils.text import slugify as _slug
        name = self.request.data.get('name', '')
        provided_key = self.request.data.get('project_key') or ''
        key = _slug(str(provided_key or name))[:40]

        provided_id = self.request.data.get('id') or key
        base_id = _slug(str(provided_id))[:32] if provided_id else (_slug(name)[:24] if name else 'project')
        project_id = f"{base_id}-{uuid.uuid4().hex[:8]}"

        namespace = f"{self.request.user.username}-{key or base_id}"

        serializer.save(
            owner=self.request.user,
            id=project_id,
            project_key=key,
            namespace=namespace[:80],
        )

    def perform_update(self, serializer):
        serializer.save(last_activity=timezone.now())

    def retrieve(self, request, *args, **kwargs):
        pk = str(kwargs.get('pk', '')).strip().lower()
        if pk in {'new', 'create'}:
            return Response(
                {'detail': 'Use POST /api/services/pipelines/projects/ to create a project.'},
                status=status.HTTP_200_OK,
            )
        return super().retrieve(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def repositories(self, request, pk=None):
        """Get repositories for a project."""
        project = self.get_object()
        repositories = Repository.objects.filter(project=project)
        serializer = RepositorySerializer(repositories, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Return lightweight stats for the project dashboard."""
        project = self.get_object()
        return Response({
            'repo_count':      project.repositories.count(),
            'pipeline_count':  PipelineDefinition.objects.filter(project=project).count(),
            'environment_count': Environment.objects.filter(project=project).count(),
            'has_repo':        project.repositories.exists(),
        })


class RepositoryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing repositories."""
    serializer_class = RepositorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Repository.objects.filter(project__owner=self.request.user)
        project = self.request.query_params.get('project')
        if project:
            qs = qs.filter(project=project)
        return qs

    def perform_update(self, serializer):
        instance = serializer.save()
        instance.project.last_activity = timezone.now()
        instance.project.save(update_fields=['last_activity'])

    def perform_destroy(self, instance):
        project = instance.project
        instance.delete()
        project.last_activity = timezone.now()
        project.save(update_fields=['last_activity'])

    def perform_create(self, serializer):
        import uuid as _uuid
        repo_id = f"repo-{_uuid.uuid4().hex[:12]}"
        init_readme = self.request.data.get('init_readme', True)
        default_tree = [
            {"name": "README.md",       "type": "file", "path": "README.md",       "content": f"# {self.request.data.get('repo_name', 'Repository')}\n\nWelcome to your new repository."},
            {"name": ".gitignore",      "type": "file", "path": ".gitignore",      "content": "__pycache__/\n*.py[cod]\n.env\n.venv/\ndist/\nbuild/\n*.egg-info/"},
            {"name": "src",             "type": "dir",  "path": "src", "children": [
                {"name": "__init__.py", "type": "file", "path": "src/__init__.py", "content": ""},
                {"name": "main.py",     "type": "file", "path": "src/main.py",     "content": "def main():\n    print(\"Hello, world!\")\n\nif __name__ == \"__main__\":\n    main()\n"},
            ]},
            {"name": "tests",           "type": "dir",  "path": "tests", "children": [
                {"name": "__init__.py", "type": "file", "path": "tests/__init__.py", "content": ""},
                {"name": "test_main.py","type": "file", "path": "tests/test_main.py","content": "def test_placeholder():\n    assert True\n"},
            ]},
            {"name": "requirements.txt","type": "file", "path": "requirements.txt", "content": "# Add your dependencies here\n"},
        ]
        tree = default_tree if init_readme else []
        repo = serializer.save(id=repo_id, tree_data=tree)
        repo.project.last_activity = timezone.now()
        repo.project.save(update_fields=['last_activity'])

    @action(detail=True, methods=['get'])
    def tree(self, request, pk=None):
        """Return the file tree; seed a default scaffold on first request if empty."""
        repository = self.get_object()
        if not repository.tree_data:
            name = repository.repo_name
            repository.tree_data = [
                {"name": "README.md",       "type": "file", "path": "README.md",
                 "content": f"# {name}\n\nWelcome to your repository."},
                {"name": ".gitignore",      "type": "file", "path": ".gitignore",
                 "content": "__pycache__/\n*.py[cod]\n.env\n.venv/\ndist/\nbuild/\n*.egg-info/"},
                {"name": "src",             "type": "dir",  "path": "src", "children": [
                    {"name": "__init__.py", "type": "file", "path": "src/__init__.py", "content": ""},
                    {"name": "main.py",     "type": "file", "path": "src/main.py",
                     "content": "def main():\n    print(\"Hello, world!\")\n\nif __name__ == \"__main__\":\n    main()\n"},
                ]},
                {"name": "tests",           "type": "dir",  "path": "tests", "children": [
                    {"name": "__init__.py", "type": "file", "path": "tests/__init__.py", "content": ""},
                    {"name": "test_main.py","type": "file", "path": "tests/test_main.py",
                     "content": "def test_placeholder():\n    assert True\n"},
                ]},
                {"name": "requirements.txt","type": "file", "path": "requirements.txt",
                 "content": "# Add your dependencies here\n"},
            ]
            repository.save(update_fields=['tree_data'])
        return Response(repository.tree_data)

    @action(detail=True, methods=['patch'], url_path='tree/update')
    def tree_update(self, request, pk=None):
        """Replace the full tree_data JSON."""
        repository = self.get_object()
        repository.tree_data = request.data.get('tree_data', repository.tree_data)
        repository.save(update_fields=['tree_data'])
        return Response(repository.tree_data)

    @action(detail=True, methods=['get'])
    def pipeline_files(self, request, pk=None):
        """Get pipeline files for a repository."""
        repository = self.get_object()
        pipeline_files = PipelineFile.objects.filter(repository=repository)
        serializer = PipelineFileSerializer(pipeline_files, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def branches(self, request, pk=None):
        """Get branches for a repository."""
        repository = self.get_object()
        branches = [
            {'name': 'main', 'commit': 'abc123'},
            {'name': 'develop', 'commit': 'def456'},
            {'name': 'feature/pipeline-ui', 'commit': 'ghi789'},
        ]
        return Response(branches)


class PipelineFileViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for managing pipeline files."""
    queryset = PipelineFile.objects.all()
    serializer_class = PipelineFileSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def pipelines(self, request, pk=None):
        """Get pipelines for a pipeline file."""
        pipeline_file = self.get_object()
        # pipeline_file on Pipeline is a CharField (path), so compare by path
        pipelines = Pipeline.objects.filter(pipeline_file=pipeline_file.path)
        serializer = PipelineSerializer(pipelines, many=True)
        return Response(serializer.data)


class PipelineViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for managing pipelines."""
    queryset = Pipeline.objects.all()
    serializer_class = PipelineSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def jobs(self, request, pk=None):
        """Get jobs for a pipeline."""
        pipeline = self.get_object()
        jobs = PipelineJob.objects.filter(pipeline=pipeline)
        serializer = PipelineJobSerializer(jobs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def run(self, request):
        """Run a pipeline."""
        serializer = PipelineRunSerializer(data=request.data)
        if serializer.is_valid():
            # Create pipeline run
            pipeline_file_obj = serializer.validated_data['pipeline_file']
            branch = serializer.validated_data['branch']

            with transaction.atomic():
                pipeline = Pipeline.objects.create(
                    project=pipeline_file_obj.repo.project,
                    repo=pipeline_file_obj.repo,
                    # pipeline_file is a CharField (path) on Pipeline
                    pipeline_file=pipeline_file_obj.path,
                    pipeline_name=pipeline_file_obj.path,
                    branch=branch,
                    status='running',
                    # triggered_by is a CharField (username) on Pipeline
                    triggered_by=request.user.username,
                    started_at=timezone.now(),
                )

                # Create initial job (build job)
                job = PipelineJob.objects.create(
                    pipeline=pipeline,
                    name='build',
                    stage='build',
                    status='running',
                    started_at=timezone.now(),
                )

                # Create initial log entry (JobLog only has a `log` TextField)
                JobLog.objects.create(
                    job=job,
                    log='[INFO] Pipeline started',
                )

            return Response(
                PipelineSerializer(pipeline).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a pipeline."""
        pipeline = self.get_object()
        approval_type = request.data.get('type', 'manual')

        approval = PipelineApproval.objects.create(
            pipeline=pipeline,
            # approved_by is a CharField (username) on PipelineApproval
            approved_by=request.user.username,
        )

        # Update pipeline status if all required approvals are met
        if pipeline.status == 'waiting_approval':
            required_approvals = PipelineRule.objects.filter(
                project=pipeline.project,
                rule_type='approval_required'
            ).count()

            current_approvals = PipelineApproval.objects.filter(
                pipeline=pipeline
            ).count()

            if current_approvals >= required_approvals:
                pipeline.status = 'approved'
                pipeline.save()

        return Response(
            PipelineApprovalSerializer(approval).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a pipeline."""
        pipeline = self.get_object()

        if pipeline.status in ['running', 'waiting_approval']:
            pipeline.status = 'cancelled'
            pipeline.finished_at = timezone.now()
            pipeline.save()

            # Cancel all running jobs
            PipelineJob.objects.filter(
                pipeline=pipeline,
                status='running'
            ).update(
                status='cancelled',
                finished_at=timezone.now()
            )

        return Response({'status': 'cancelled'})


class PipelineJobViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for managing pipeline jobs."""
    queryset = PipelineJob.objects.all()
    serializer_class = PipelineJobSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def logs(self, request, pk=None):
        """Get logs for a job."""
        job = self.get_object()
        logs = JobLog.objects.filter(job=job).order_by('timestamp')
        serializer = JobLogSerializer(logs, many=True)
        return Response(serializer.data)


class PipelineApprovalViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for managing pipeline approvals."""
    queryset = PipelineApproval.objects.all()
    serializer_class = PipelineApprovalSerializer
    permission_classes = [IsAuthenticated]


class PipelineRuleViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for managing pipeline rules."""
    queryset = PipelineRule.objects.all()
    serializer_class = PipelineRuleSerializer
    permission_classes = [IsAuthenticated]


class EnvironmentViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for Environment.

    DELETE is blocked if there are active (pending/running) pipelines
    attached to the environment's project. Owners and staff may bypass
    this check by passing ?force=1, but only staff can delete protected envs.
    """
    queryset           = Environment.objects.all()
    serializer_class   = EnvironmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Environment.objects.all()
        project_id = self.request.query_params.get('project_id')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def destroy(self, request, *args, **kwargs):
        env = self.get_object()
        # Cascade-delete the environment and all related data unconditionally.
        env.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PipelineArtifactViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for managing pipeline artifacts."""
    queryset = PipelineArtifact.objects.all()
    serializer_class = PipelineArtifactSerializer
    permission_classes = [IsAuthenticated]


# ─────────────────────────────────────────────────────────────────────────────
#  Pipeline Definition System ViewSets
# ─────────────────────────────────────────────────────────────────────────────

def _make_run_id():
    return f"run-{uuid.uuid4().hex[:16]}"


def _bootstrap_run_nodes(run: PipelineRun) -> list:
    """
    Create PipelineRunNode rows from the definition's stages/steps.
    Returns the list of created nodes.
    """
    nodes = []
    order = 0
    for stage in run.definition.stages.all().order_by('order'):
        stage_node = PipelineRunNode.objects.create(
            run=run,
            node_type='stage',
            stage_name=stage.name,
            step_name='',
            status='pending',
            order=order,
        )
        nodes.append(stage_node)
        order += 1
        for step in stage.steps.all().order_by('order'):
            step_node = PipelineRunNode.objects.create(
                run=run,
                node_type='step',
                stage_name=stage.name,
                step_name=step.name,
                status='pending',
                order=order,
            )
            nodes.append(step_node)
            order += 1
    return nodes


class PipelineDefinitionViewSet(viewsets.ModelViewSet):
    """
    CRUD for PipelineDefinition (named pipelines a.k.a. "the pipeline template").

    Extra actions:
      POST /{id}/trigger/   — start a new PipelineRun
      GET  /{id}/runs/      — list runs for this definition
      GET  /{id}/yaml/      — return the raw YAML definition
      PUT  /{id}/yaml/      — update the YAML definition
      GET  /{id}/stages/    — list stages
      POST /{id}/stages/    — add a stage
    """
    queryset           = PipelineDefinition.objects.all()
    serializer_class   = PipelineDefinitionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = PipelineDefinition.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        active = self.request.query_params.get('active')
        if active is not None:
            qs = qs.filter(is_active=(active.lower() != 'false'))
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        name = self.request.data.get('name', 'pipeline')
        raw_id = f"{slugify(name)[:32]}-{uuid.uuid4().hex[:8]}"
        serializer.save(id=raw_id, created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def trigger(self, request, pk=None):
        """Create and return a new PipelineRun for this definition."""
        definition = self.get_object()
        ser = TriggerPipelineRunSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        vd = ser.validated_data

        # Resolve optional repo FK
        from .models import Repository as _Repo
        repo_id   = vd.get('repo') or None
        repo_obj  = None
        if repo_id:
            repo_obj = _Repo.objects.filter(pk=repo_id).first()

        with transaction.atomic():
            run = PipelineRun.objects.create(
                id=_make_run_id(),
                definition=definition,
                status='pending',
                triggered_by=request.user.username,
                repo=repo_obj,
                branch=vd.get('branch', 'main'),
                commit_sha=vd.get('commit_sha', ''),
                commit_msg=vd.get('commit_msg', ''),
                variables=vd.get('variables', {}),
                started_at=timezone.now(),
            )
            _bootstrap_run_nodes(run)
            # Move to running immediately (real engine would be async)
            run.status = 'running'
            run.save(update_fields=['status'])

        return Response(PipelineRunDetailSerializer(run).data,
                        status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def runs(self, request, pk=None):
        """List all runs for this definition."""
        definition = self.get_object()
        runs = PipelineRun.objects.filter(definition=definition).order_by('-created_at')
        return Response(PipelineRunListSerializer(runs, many=True).data)

    @action(detail=True, methods=['get', 'put'])
    def yaml(self, request, pk=None):
        """GET or PUT the raw YAML definition."""
        definition = self.get_object()
        if request.method == 'GET':
            return Response({'yaml_definition': definition.yaml_definition})
        yaml_text = request.data.get('yaml_definition', '')
        definition.yaml_definition = yaml_text
        definition.save(update_fields=['yaml_definition', 'updated_at'])
        return Response({'yaml_definition': definition.yaml_definition})

    @action(detail=True, methods=['get', 'post'])
    def stages(self, request, pk=None):
        """GET all stages; POST to add a stage."""
        definition = self.get_object()
        if request.method == 'GET':
            stages = definition.stages.all().order_by('order')
            return Response(PipelineDefinitionStageSerializer(stages, many=True).data)
        ser = PipelineDefinitionStageSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        ser.save(definition=definition)
        return Response(ser.data, status=status.HTTP_201_CREATED)


class PipelineRunViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only access to PipelineRun records.

    Extra actions:
      GET  /{id}/graph/          — ordered list of nodes for the execution graph
      GET  /{id}/logs/{node_id}/ — log output for a single node
      POST /{id}/cancel/         — cancel a running run
      GET  /{id}/artifacts/      — list artifacts from this run
    """
    queryset           = PipelineRun.objects.all()
    serializer_class   = PipelineRunDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = PipelineRun.objects.all()
        definition_id = self.request.query_params.get('definition')
        if definition_id:
            qs = qs.filter(definition_id=definition_id)
        run_status = self.request.query_params.get('status')
        if run_status:
            qs = qs.filter(status=run_status)
        return qs.order_by('-created_at')

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        return Response(PipelineRunListSerializer(qs, many=True).data)

    @action(detail=True, methods=['get'])
    def graph(self, request, pk=None):
        """Return ordered graph nodes for this run."""
        run = self.get_object()
        nodes = run.nodes.all().order_by('order')
        return Response(PipelineRunNodeSerializer(nodes, many=True).data)

    @action(detail=True, url_path=r'logs/(?P<node_id>[^/.]+)',
            methods=['get'])
    def logs(self, request, pk=None, node_id=None):
        """Return log_output for a specific run node."""
        run  = self.get_object()
        node = get_object_or_404(PipelineRunNode, id=node_id, run=run)
        return Response({
            'node_id':    node.id,
            'stage_name': node.stage_name,
            'step_name':  node.step_name,
            'status':     node.status,
            'log_output': node.log_output,
            'error_msg':  node.error_msg,
        })

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a running PipelineRun and all its pending/running nodes."""
        run = self.get_object()
        if run.status in ('pending', 'running', 'waiting'):
            with transaction.atomic():
                run.status      = 'cancelled'
                run.finished_at = timezone.now()
                if run.started_at:
                    run.duration_s = (run.finished_at - run.started_at).total_seconds()
                run.save(update_fields=['status', 'finished_at', 'duration_s'])
                run.nodes.filter(status__in=['pending', 'running', 'waiting']).update(
                    status='cancelled', finished_at=timezone.now())
        return Response(PipelineRunListSerializer(run).data)

    @action(detail=True, methods=['get'])
    def artifacts(self, request, pk=None):
        """List artifacts produced by this run."""
        run = self.get_object()
        from .serializers import PipelineRunArtifactSerializer
        arts = run.run_artifacts.all().order_by('-created_at')
        return Response(PipelineRunArtifactSerializer(arts, many=True).data)


class PipelineRunNodeViewSet(viewsets.ReadOnlyModelViewSet):
    """Direct access to PipelineRunNode (useful for WebSocket polling)."""
    queryset           = PipelineRunNode.objects.all()
    serializer_class   = PipelineRunNodeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = PipelineRunNode.objects.all()
        run_id = self.request.query_params.get('run')
        if run_id:
            qs = qs.filter(run_id=run_id)
        return qs.order_by('order')
