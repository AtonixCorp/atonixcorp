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


class RepositorySerializer(serializers.ModelSerializer):
    """Serializer for Repository model."""
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = Repository
        fields = '__all__'


class PipelineFileSerializer(serializers.ModelSerializer):
    """Serializer for PipelineFile model."""
    repository_name = serializers.CharField(source='repository.name', read_only=True)
    project_name = serializers.CharField(source='repository.project.name', read_only=True)

    class Meta:
        model = PipelineFile
        fields = '__all__'


class PipelineSerializer(serializers.ModelSerializer):
    """Serializer for Pipeline model."""
    pipeline_file_name = serializers.CharField(source='pipeline_file.name', read_only=True)
    repository_name = serializers.CharField(source='pipeline_file.repository.name', read_only=True)
    project_name = serializers.CharField(source='pipeline_file.repository.project.name', read_only=True)
    triggered_by_username = serializers.CharField(source='triggered_by.username', read_only=True)
    environment_name = serializers.CharField(source='environment.name', read_only=True)

    class Meta:
        model = Pipeline
        fields = '__all__'


class PipelineJobSerializer(serializers.ModelSerializer):
    """Serializer for PipelineJob model."""
    pipeline_name = serializers.CharField(source='pipeline.pipeline_file.name', read_only=True)

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
    """Serializer for PipelineApproval model."""
    pipeline_name = serializers.CharField(source='pipeline.pipeline_file.name', read_only=True)
    approved_by_username = serializers.CharField(source='approved_by.username', read_only=True)

    class Meta:
        model = PipelineApproval
        fields = '__all__'


class PipelineRuleSerializer(serializers.ModelSerializer):
    """Serializer for PipelineRule model."""
    pipeline_file_name = serializers.CharField(source='pipeline_file.name', read_only=True)

    class Meta:
        model = PipelineRule
        fields = '__all__'


class EnvironmentSerializer(serializers.ModelSerializer):
    """Serializer for Environment model."""
    class Meta:
        model = Environment
        fields = '__all__'


class PipelineArtifactSerializer(serializers.ModelSerializer):
    """Serializer for PipelineArtifact model."""
    job_name = serializers.CharField(source='job.name', read_only=True)
    pipeline_name = serializers.CharField(source='job.pipeline.pipeline_file.name', read_only=True)

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
        required=False
    )
    parameters = serializers.JSONField(required=False)
