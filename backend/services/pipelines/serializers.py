from rest_framework import serializers
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


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model."""

    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ('owner', 'created_at', 'updated_at')
        # id is a CharField pk; allow the view's perform_create to supply it
        extra_kwargs = {
            'id': {'required': False, 'allow_blank': True},
        }


class RepositorySerializer(serializers.ModelSerializer):
    """Serializer for Repository model."""
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = Repository
        fields = '__all__'


class PipelineFileSerializer(serializers.ModelSerializer):
    """Serializer for PipelineFile model."""
    # FK is named `repo`, not `repository`
    repo_name = serializers.CharField(source='repo.repo_name', read_only=True)
    project_name = serializers.CharField(source='repo.project.name', read_only=True)

    class Meta:
        model = PipelineFile
        fields = '__all__'


class PipelineSerializer(serializers.ModelSerializer):
    """Serializer for Pipeline model.

    Note: pipeline_file and triggered_by are CharFields on the model
    (path string and username string respectively), *not* FK relations.
    """

    class Meta:
        model = Pipeline
        fields = '__all__'


class PipelineJobSerializer(serializers.ModelSerializer):
    """Serializer for PipelineJob model."""
    pipeline_name = serializers.CharField(source='pipeline.pipeline_name', read_only=True)

    class Meta:
        model = PipelineJob
        fields = '__all__'


class JobLogSerializer(serializers.ModelSerializer):
    """Serializer for JobLog model."""
    job_name = serializers.CharField(source='job.name', read_only=True)

    class Meta:
        model = JobLog
        fields = '__all__'


class PipelineApprovalSerializer(serializers.ModelSerializer):
    """Serializer for PipelineApproval model.

    approved_by is a CharField (username string), not a User FK.
    """
    pipeline_name = serializers.CharField(source='pipeline.pipeline_name', read_only=True)

    class Meta:
        model = PipelineApproval
        fields = '__all__'


class PipelineRuleSerializer(serializers.ModelSerializer):
    """Serializer for PipelineRule model."""
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = PipelineRule
        fields = '__all__'


class EnvironmentSerializer(serializers.ModelSerializer):
    """Serializer for Environment model."""
    owner_username = serializers.CharField(source='owner.username', read_only=True, default=None)
    has_active_processes = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Environment
        fields = [
            'id', 'name', 'region', 'description',
            'is_protected', 'auto_deploy', 'deployment_strategy',
            'require_approval', 'notify_email',
            'owner', 'owner_username', 'has_active_processes',
            'project', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'owner_username', 'has_active_processes', 'created_at', 'updated_at']

    def get_has_active_processes(self, obj):
        """Return True if there are running/pending pipelines that target this project."""
        return Pipeline.objects.filter(
            project=obj.project,
            status__in=['pending', 'running'],
        ).exists()

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['owner'] = request.user
        return super().create(validated_data)


class PipelineArtifactSerializer(serializers.ModelSerializer):
    """Serializer for PipelineArtifact model."""
    job_name = serializers.CharField(source='job.name', read_only=True)
    pipeline_name = serializers.CharField(source='job.pipeline.pipeline_name', read_only=True)

    class Meta:
        model = PipelineArtifact
        fields = '__all__'


class PipelineRunSerializer(serializers.Serializer):
    """Serializer for pipeline run request."""
    pipeline_file = serializers.PrimaryKeyRelatedField(
        queryset=PipelineFile.objects.all()
    )
    branch = serializers.CharField(max_length=255)
    environment = serializers.PrimaryKeyRelatedField(
        queryset=Environment.objects.all(),
        required=False,
        allow_null=True,
    )
    parameters = serializers.JSONField(required=False)
