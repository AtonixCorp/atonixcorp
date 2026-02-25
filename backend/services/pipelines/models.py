from django.db import models
from django.contrib.auth.models import User
from ..core.base_models import TimeStampedModel, Status
import uuid


class Project(TimeStampedModel):
    """Represents a user project that can have multiple repositories."""
    id = models.CharField(max_length=50, primary_key=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'projects'
        indexes = [
            models.Index(fields=['owner', 'name']),
        ]

    def __str__(self):
        return f"{self.owner.username}/{self.name}"


class Repository(TimeStampedModel):
    """Represents a connected repository (GitHub, GitLab, Bitbucket)."""
    id = models.CharField(max_length=50, primary_key=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='repositories')
    provider = models.CharField(max_length=20, choices=[
        ('github', 'GitHub'),
        ('gitlab', 'GitLab'),
        ('bitbucket', 'Bitbucket'),
    ])
    repo_name = models.CharField(max_length=100)
    default_branch = models.CharField(max_length=100, default='main')

    class Meta:
        db_table = 'repositories'
        unique_together = ['project', 'provider', 'repo_name']
        indexes = [
            models.Index(fields=['project', 'provider']),
        ]

    def __str__(self):
        return f"{self.provider}/{self.repo_name}"


class PipelineFile(TimeStampedModel):
    """Represents a pipeline configuration file found in a repository."""
    id = models.CharField(max_length=50, primary_key=True)
    repo = models.ForeignKey(Repository, on_delete=models.CASCADE, related_name='pipeline_files')
    path = models.CharField(max_length=500)
    file_type = models.CharField(max_length=20, default='atonix')

    class Meta:
        db_table = 'pipeline_files'
        unique_together = ['repo', 'path']
        indexes = [
            models.Index(fields=['repo', 'file_type']),
        ]

    def __str__(self):
        return f"{self.repo}:{self.path}"


class Pipeline(TimeStampedModel):
    """Represents a single pipeline run."""
    id = models.CharField(max_length=50, primary_key=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='pipelines')
    repo = models.ForeignKey(Repository, on_delete=models.CASCADE, related_name='pipelines')
    pipeline_name = models.CharField(max_length=100)
    pipeline_file = models.CharField(max_length=500)
    branch = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ], default='pending')
    triggered_by = models.CharField(max_length=100)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'pipelines'
        indexes = [
            models.Index(fields=['project', 'status']),
            models.Index(fields=['repo', 'branch']),
            models.Index(fields=['status', 'started_at']),
        ]

    def __str__(self):
        return f"{self.pipeline_name} ({self.status})"


class PipelineJob(TimeStampedModel):
    """Represents a job within a pipeline (e.g., install, build, test)."""
    id = models.CharField(max_length=50, primary_key=True)
    pipeline = models.ForeignKey(Pipeline, on_delete=models.CASCADE, related_name='jobs')
    name = models.CharField(max_length=100)
    stage = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ], default='pending')
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'pipeline_jobs'
        indexes = [
            models.Index(fields=['pipeline', 'status']),
            models.Index(fields=['status', 'started_at']),
        ]

    def __str__(self):
        return f"{self.pipeline.pipeline_name}:{self.name} ({self.status})"


class JobLog(models.Model):
    """Stores streaming logs for each job."""
    id = models.AutoField(primary_key=True)
    job = models.ForeignKey(PipelineJob, on_delete=models.CASCADE, related_name='logs')
    log = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'job_logs'
        indexes = [
            models.Index(fields=['job', 'timestamp']),
        ]

    def __str__(self):
        return f"Log for {self.job} at {self.timestamp}"


class PipelineApproval(models.Model):
    """Tracks approvals for protected pipelines."""
    id = models.AutoField(primary_key=True)
    pipeline = models.ForeignKey(Pipeline, on_delete=models.CASCADE, related_name='approvals')
    approved_by = models.CharField(max_length=100)
    approved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pipeline_approvals'
        indexes = [
            models.Index(fields=['pipeline', 'approved_at']),
        ]

    def __str__(self):
        return f"Approval by {self.approved_by} for {self.pipeline}"


class PipelineRule(TimeStampedModel):
    """Platform-level rules for pipelines (e.g., protected branches)."""
    id = models.AutoField(primary_key=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='pipeline_rules')
    rule_type = models.CharField(max_length=50)  # e.g., 'protected_branch', 'required_approval'
    rule_value = models.CharField(max_length=200)  # e.g., 'main', 'production'

    class Meta:
        db_table = 'pipeline_rules'
        indexes = [
            models.Index(fields=['project', 'rule_type']),
        ]

    def __str__(self):
        return f"{self.project}:{self.rule_type}={self.rule_value}"


class Environment(TimeStampedModel):
    """Represents deployment environments."""
    id = models.CharField(max_length=50, primary_key=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='environments')
    name = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    is_protected = models.BooleanField(default=False)

    class Meta:
        db_table = 'environments'
        unique_together = ['project', 'name']
        indexes = [
            models.Index(fields=['project', 'is_protected']),
        ]

    def __str__(self):
        return f"{self.project.name}:{self.name}"


class PipelineArtifact(TimeStampedModel):
    """Stores information about build artifacts."""
    id = models.CharField(max_length=50, primary_key=True)
    job = models.ForeignKey(PipelineJob, on_delete=models.CASCADE, related_name='artifacts')
    artifact_path = models.CharField(max_length=500)
    storage_url = models.URLField()

    class Meta:
        db_table = 'pipeline_artifacts'
        indexes = [
            models.Index(fields=['job']),
        ]

    def __str__(self):
        return f"Artifact {self.artifact_path} for {self.job}"
