from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
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
)


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for managing projects."""
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def repositories(self, request, pk=None):
        """Get repositories for a project."""
        project = self.get_object()
        repositories = Repository.objects.filter(project=project)
        serializer = RepositorySerializer(repositories, many=True)
        return Response(serializer.data)


class RepositoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for managing repositories."""
    queryset = Repository.objects.all()
    serializer_class = RepositorySerializer
    permission_classes = [IsAuthenticated]

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
        # In a real implementation, this would fetch from Git provider
        # For now, return mock branches
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
        pipelines = Pipeline.objects.filter(pipeline_file=pipeline_file)
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
            pipeline_file = serializer.validated_data['pipeline_file']
            branch = serializer.validated_data['branch']
            environment = serializer.validated_data.get('environment')

            with transaction.atomic():
                pipeline = Pipeline.objects.create(
                    pipeline_file=pipeline_file,
                    branch=branch,
                    environment=environment,
                    status='running',
                    triggered_by=request.user,
                    started_at=timezone.now(),
                )

                # Create initial job (build job)
                job = PipelineJob.objects.create(
                    pipeline=pipeline,
                    name='build',
                    status='running',
                    started_at=timezone.now(),
                )

                # Create initial log entry
                JobLog.objects.create(
                    job=job,
                    level='info',
                    message='Pipeline started',
                    timestamp=timezone.now(),
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
            approved_by=request.user,
            approval_type=approval_type,
            approved_at=timezone.now(),
        )

        # Update pipeline status if all required approvals are met
        if pipeline.status == 'waiting_approval':
            required_approvals = PipelineRule.objects.filter(
                pipeline_file=pipeline.pipeline_file,
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


class EnvironmentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for managing environments."""
    queryset = Environment.objects.all()
    serializer_class = EnvironmentSerializer
    permission_classes = [IsAuthenticated]


class PipelineArtifactViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for managing pipeline artifacts."""
    queryset = PipelineArtifact.objects.all()
    serializer_class = PipelineArtifactSerializer
    permission_classes = [IsAuthenticated]
