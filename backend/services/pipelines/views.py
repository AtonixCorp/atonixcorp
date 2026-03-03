from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify
import uuid
import os
import subprocess


def _build_scaffold(project_name: str, repo_name: str, username: str) -> list:
    """Return a full default file tree for a new AtonixCorp repository."""
    return [
        {'name': 'README.md', 'type': 'file', 'path': 'README.md',
         'content': f'# {project_name}\n\nWelcome to **{project_name}** \u2014 powered by AtonixCorp Cloud.\n\n## Getting Started\n\n```bash\ngit clone <repo-url>\ncd {repo_name}\n```\n\n## CI/CD\n\nThis repository is connected to AtonixCorp Pipelines.\nEvery push to `main` or `develop` triggers a build automatically.\n\n## Structure\n\n```\nsrc/          # Application source\ntests/        # Test suite\npipeline.yaml # CI/CD definition\natonixcorp.yaml # Platform config\n```\n'},
        {'name': '.gitignore', 'type': 'file', 'path': '.gitignore',
         'content': '__pycache__/\n*.py[cod]\n.env\n.venv/\ndist/\nbuild/\n*.egg-info/\n.DS_Store\nnode_modules/\n.idea/\n.vscode/\n'},
        {'name': 'atonixcorp.yaml', 'type': 'file', 'path': 'atonixcorp.yaml',
         'content': f'project: {repo_name}\nversion: "1.0"\nruntime: python312\nregion: us-east-1\nowner: {username}\n'},
        {'name': 'pipeline.yaml', 'type': 'file', 'path': 'pipeline.yaml',
         'content': 'name: CI\non:\n  push:\n    branches: [main, develop]\n  pull_request:\n    branches: [main]\njobs:\n  build:\n    runs-on: atonix-runner\n    steps:\n      - uses: atonix/checkout@v2\n      - name: Install dependencies\n        run: pip install -r requirements.txt\n      - name: Run tests\n        run: pytest\n'},
        {'name': 'src', 'type': 'dir', 'path': 'src', 'children': [
            {'name': '__init__.py', 'type': 'file', 'path': 'src/__init__.py', 'content': ''},
            {'name': 'main.py', 'type': 'file', 'path': 'src/main.py',
             'content': f'def main():\n    print("Hello from {project_name}!")\n\n\nif __name__ == "__main__":\n    main()\n'},
        ]},
        {'name': 'tests', 'type': 'dir', 'path': 'tests', 'children': [
            {'name': '__init__.py',  'type': 'file', 'path': 'tests/__init__.py', 'content': ''},
            {'name': 'test_main.py', 'type': 'file', 'path': 'tests/test_main.py',
             'content': 'def test_placeholder():\n    assert True\n'},
        ]},
        {'name': 'requirements.txt', 'type': 'file', 'path': 'requirements.txt',
         'content': '# Add your dependencies here\n# Example:\n# requests>=2.31\n# fastapi>=0.110\n'},
    ]
from .models import (
    Project,
    Repository,
    SSHKey,
    PipelineFile,
    Pipeline,
    PipelineJob,
    JobLog,
    PipelineApproval,
    PipelineRule,
    Environment,
    EnvironmentDeployment,
    EnvironmentService,
    EnvironmentVariable,
    EnvironmentFeatureFlag,
    EnvironmentAuditEntry,
    EnvironmentRelease,
    EnvironmentFile,
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
    EnvironmentDeploymentSerializer,
    EnvironmentServiceSerializer,
    EnvironmentVariableSerializer,
    EnvironmentFeatureFlagSerializer,
    EnvironmentAuditEntrySerializer,
    EnvironmentReleaseSerializer,
    EnvironmentFileSerializer,
    PipelineArtifactSerializer,
    PipelineRunSerializer,
    PipelineDefinitionSerializer,
    PipelineDefinitionStageSerializer,
    PipelineDefinitionStepSerializer,
    PipelineRunDetailSerializer,
    PipelineRunListSerializer,
    PipelineRunNodeSerializer,
    TriggerPipelineRunSerializer,
    SSHKeySerializer,
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

        # Context: workspace / group / personal
        ctx           = self.request.data.get('context', 'personal') or 'personal'
        workspace_id  = self.request.data.get('workspace_id', '') or ''
        workspace_name = self.request.data.get('workspace_name', '') or ''
        group_id      = self.request.data.get('group_id', '') or ''
        group_name    = self.request.data.get('group_name', '') or ''

        project = serializer.save(
            owner=self.request.user,
            created_by=self.request.user,
            id=project_id,
            project_key=key,
            namespace=namespace[:80],
            context=ctx,
            workspace_id=workspace_id,
            workspace_name=workspace_name,
            group_id=group_id,
            group_name=group_name,
        )

        # ── Auto-create AtonixCorp repository ──────────────────────────────
        repo_id   = f"repo-{uuid.uuid4().hex[:12]}"
        repo_name = key or base_id or slugify(name)[:40] or 'repository'
        Repository.objects.create(
            id=repo_id,
            project=project,
            owner=self.request.user,
            created_by=self.request.user,
            provider='atonix',
            repo_name=repo_name,
            default_branch='main',
            tree_data=_build_scaffold(name, repo_name, self.request.user.username),
        )
        project.last_activity = timezone.now()
        project.save(update_fields=['last_activity'])

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

    @action(detail=True, methods=['post'], url_path='init-repo')
    def init_repo(self, request, pk=None):
        """Initialize an AtonixCorp repository for a project that doesn't have one.
        If an existing repo is found, re-runs the scaffold and returns it.
        """
        project = self.get_object()
        name     = request.data.get('repo_name', '') or project.project_key or slugify(project.name)
        name     = slugify(name)[:40] or 'repository'

        existing = project.repositories.first()
        if existing:
            # Re-scaffold if tree is empty
            if not existing.tree_data:
                existing.tree_data = _build_scaffold(project.name, name, request.user.username)
                existing.save(update_fields=['tree_data'])
            return Response(RepositorySerializer(existing).data)

        repo_id = f"repo-{uuid.uuid4().hex[:12]}"
        repo = Repository.objects.create(
            id=repo_id,
            project=project,
            provider='atonix',
            repo_name=name,
            default_branch='main',
            tree_data=_build_scaffold(project.name, name, request.user.username),
        )
        project.last_activity = timezone.now()
        project.save(update_fields=['last_activity'])
        return Response(RepositorySerializer(repo).data, status=status.HTTP_201_CREATED)

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
        user = self.request.user
        from django.db.models import Q

        workspace_id = self.request.query_params.get('workspace_id')
        group_id     = self.request.query_params.get('group_id')
        project      = self.request.query_params.get('project')

        # Workspace-scoped: return only that workspace's repos (no ownership check —
        # permission is enforced at the workspace level)
        if workspace_id:
            return Repository.objects.filter(workspace_id=workspace_id).distinct()

        # Group-scoped: same pattern
        if group_id:
            return Repository.objects.filter(group_id=group_id).distinct()

        # Default (Developer Dashboard): project-linked or standalone repos that
        # belong to the user, but EXCLUDE anything scoped to a workspace or group.
        qs = Repository.objects.filter(
            Q(project__owner=user) | Q(owner=user)
        ).filter(workspace_id='', group_id='').distinct()

        if project:
            qs = qs.filter(project=project)

        return qs

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.project is not None:
            instance.project.last_activity = timezone.now()
            instance.project.save(update_fields=['last_activity'])

    def perform_destroy(self, instance):
        project = instance.project
        instance.delete()
        if project is not None:
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
        project_id = self.request.data.get('project')
        # For standalone repos (no project) assign the requesting user as owner
        extra = {}
        if not project_id:
            extra['owner'] = self.request.user
        extra['workspace_id']   = self.request.data.get('workspace_id', '')
        extra['workspace_name'] = self.request.data.get('workspace_name', '')
        extra['group_id']       = self.request.data.get('group_id', '')
        extra['group_name']     = self.request.data.get('group_name', '')
        repo = serializer.save(id=repo_id, tree_data=tree, created_by=self.request.user, **extra)
        if repo.project is not None:
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
        return Response([
            {'name': repository.default_branch, 'sha': 'a3f9b2c1d5e8f042', 'protected': True,  'ahead': 0, 'behind': 0, 'last_commit_message': 'chore: update deps', 'last_commit_date': '2026-03-02T09:15:00Z'},
            {'name': 'develop',                  'sha': 'b7d4e8f200c1a9e3', 'protected': False, 'ahead': 3, 'behind': 1, 'last_commit_message': 'feat: add logging', 'last_commit_date': '2026-03-01T16:40:00Z'},
            {'name': 'feature/pipeline-ui',      'sha': 'c1a5f9e344b82d71', 'protected': False, 'ahead': 7, 'behind': 0, 'last_commit_message': 'ui: pipeline graph', 'last_commit_date': '2026-02-28T11:00:00Z'},
        ])

    @action(detail=True, methods=['get'])
    def tags(self, request, pk=None):
        """Return list of tags."""
        return Response([
            {'name': 'v1.0.0', 'sha': 'a3f9b2c1', 'message': 'First stable release',  'date': '2026-02-28T10:00:00Z'},
            {'name': 'v0.9.0', 'sha': '9d2e7f3c', 'message': 'Release candidate',      'date': '2026-02-20T08:00:00Z'},
        ])

    @action(detail=True, methods=['get'])
    def commits(self, request, pk=None):
        """Return commit history."""
        repository = self.get_object()
        branch = request.query_params.get('branch', repository.default_branch)
        path   = request.query_params.get('path', '')
        author_map = {
            'a3f9b2c1': {'name': 'Alice Dev',   'email': 'alice@atonixcorp.com', 'avatar': 'AD'},
            'b7d4e8f2': {'name': 'Bob Ops',     'email': 'bob@atonixcorp.com',   'avatar': 'BO'},
            'c1a5f9e3': {'name': 'CI Robot',    'email': 'ci@atonixcorp.com',    'avatar': 'CI'},
            'd9f1c6a4': {'name': 'Alice Dev',   'email': 'alice@atonixcorp.com', 'avatar': 'AD'},
            'e7b3a2d5': {'name': 'Dave Infra',  'email': 'dave@atonixcorp.com',  'avatar': 'DI'},
        }
        commit_list = [
            {'sha': 'c1a5f9e3', 'short_sha': 'c1a5f9e', 'message': 'chore: update dependencies',          'pipeline_status': 'running',  'timestamp': '2026-03-02T09:15:00Z', 'files_changed': 1},
            {'sha': 'b7d4e8f2', 'short_sha': 'b7d4e8f', 'message': 'feat: add structured logging',       'pipeline_status': 'success',  'timestamp': '2026-03-01T16:40:00Z', 'files_changed': 3},
            {'sha': 'e7b3a2d5', 'short_sha': 'e7b3a2d', 'message': 'fix: handle empty response in API',  'pipeline_status': 'success',  'timestamp': '2026-03-01T10:00:00Z', 'files_changed': 2},
            {'sha': 'd9f1c6a4', 'short_sha': 'd9f1c6a', 'message': 'docs: update README with examples',  'pipeline_status': 'success',  'timestamp': '2026-02-28T14:20:00Z', 'files_changed': 1},
            {'sha': 'a3f9b2c1', 'short_sha': 'a3f9b2c', 'message': 'Initial commit',                     'pipeline_status': 'success',  'timestamp': '2026-02-28T10:00:00Z', 'files_changed': 5},
        ]
        for c in commit_list:
            c['author'] = author_map.get(c['sha'], {'name': 'Unknown', 'email': '', 'avatar': '?'})
            c['branch'] = branch
        return Response(commit_list)

    @action(detail=True, methods=['get'])
    def file(self, request, pk=None):
        """Return file content for a given path."""
        repository = self.get_object()
        path = request.query_params.get('path', '')

        def _find(nodes, target):
            for node in nodes:
                if node.get('path') == target:
                    return node
                if node.get('type') == 'dir' and node.get('children'):
                    hit = _find(node['children'], target)
                    if hit:
                        return hit
            return None

        node = _find(repository.tree_data or [], path)
        if not node:
            return Response({'detail': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)
        content = node.get('content', '')
        return Response({
            'path':    node['path'],
            'name':    node['name'],
            'content': content,
            'size':    len(content.encode('utf-8')),
            'lines':   len(content.splitlines()),
            'type':    node.get('type', 'file'),
            'last_commit': {
                'sha': 'b7d4e8f2', 'short_sha': 'b7d4e8f',
                'message': 'feat: add structured logging',
                'author': 'Alice Dev', 'timestamp': '2026-03-01T16:40:00Z',
                'pipeline_status': 'success',
            },
        })

    @action(detail=True, methods=['get'])
    def raw(self, request, pk=None):
        """Return raw file content as plain text."""
        repository = self.get_object()
        path = request.query_params.get('path', '')

        def _find(nodes, target):
            for node in nodes:
                if node.get('path') == target:
                    return node
                if node.get('type') == 'dir' and node.get('children'):
                    hit = _find(node['children'], target)
                    if hit:
                        return hit
            return None

        node = _find(repository.tree_data or [], path)
        if not node:
            return Response({'detail': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)
        from django.http import HttpResponse
        return HttpResponse(node.get('content', ''), content_type='text/plain; charset=utf-8')

    @action(detail=True, methods=['get'])
    def blame(self, request, pk=None):
        """Return blame data for a file."""
        repository = self.get_object()
        path = request.query_params.get('path', '')

        def _find(nodes, target):
            for node in nodes:
                if node.get('path') == target:
                    return node.get('content', '')
                if node.get('type') == 'dir' and node.get('children'):
                    hit = _find(node['children'], target)
                    if hit is not None:
                        return hit
            return None

        content = _find(repository.tree_data or [], path) or ''
        lines = content.splitlines()
        authors = [
            {'sha': 'a3f9b2c1', 'short_sha': 'a3f9b2c', 'name': 'Alice Dev', 'email': 'alice@atonixcorp.com', 'message': 'Initial commit',               'date': '2026-02-28'},
            {'sha': 'b7d4e8f2', 'short_sha': 'b7d4e8f', 'name': 'Bob Ops',   'email': 'bob@atonixcorp.com',   'message': 'feat: add structured logging', 'date': '2026-03-01'},
            {'sha': 'c1a5f9e3', 'short_sha': 'c1a5f9e', 'name': 'CI Robot',  'email': 'ci@atonixcorp.com',    'message': 'chore: update dependencies',   'date': '2026-03-02'},
        ]
        hunks = []
        for i, line in enumerate(lines):
            a = authors[i % len(authors)]
            hunks.append({
                'line_number': i + 1,
                'content': line,
                'sha': a['sha'], 'short_sha': a['short_sha'],
                'author': a['name'], 'email': a['email'],
                'message': a['message'], 'date': a['date'],
            })
        return Response(hunks)

    @action(detail=True, methods=['get'])
    def diff(self, request, pk=None):
        """Return diff between base and head (simulated)."""
        repository = self.get_object()
        base = request.query_params.get('base', repository.default_branch)
        head = request.query_params.get('head', 'develop')
        return Response({
            'base': base, 'head': head,
            'total_additions': 17, 'total_deletions': 3,
            'files': [
                {
                    'path': 'src/main.py', 'additions': 5, 'deletions': 2,
                    'chunks': [{'header': '@@ -1,6 +1,9 @@', 'lines': [
                        {'type': 'context', 'content': 'def main():'},
                        {'type': 'removed', 'content': '    print("Hello, world!")'},
                        {'type': 'added',   'content': '    print("Hello, AtonixCorp!")'},
                        {'type': 'added',   'content': '    setup_logging()'},
                        {'type': 'added',   'content': '    run_server()'},
                        {'type': 'context', 'content': ''},
                        {'type': 'context', 'content': 'if __name__ == "__main__":'},
                        {'type': 'context', 'content': '    main()'},
                    ]}],
                },
                {
                    'path': 'README.md', 'additions': 12, 'deletions': 1,
                    'chunks': [{'header': '@@ -1,3 +1,14 @@', 'lines': [
                        {'type': 'context', 'content': '# Repository'},
                        {'type': 'removed', 'content': 'Welcome to your new repository.'},
                        {'type': 'added',   'content': 'Welcome to the AtonixCorp repository.'},
                        {'type': 'added',   'content': ''},
                        {'type': 'added',   'content': '## Features'},
                        {'type': 'added',   'content': '- CI/CD integration'},
                        {'type': 'added',   'content': '- Workspace support'},
                    ]}],
                },
            ],
        })

    @action(detail=True, methods=['get'])
    def search(self, request, pk=None):
        """Search files and code in the repository."""
        repository = self.get_object()
        query = request.query_params.get('q', '').lower().strip()
        search_type = request.query_params.get('type', 'code')

        if not query:
            return Response([])

        results = []

        def _search(nodes):
            for node in nodes:
                name_lower = node.get('name', '').lower()
                path = node.get('path', '')
                if search_type == 'file':
                    if query in name_lower:
                        results.append({'type': 'file', 'path': path, 'name': node.get('name', ''), 'node_type': node.get('type', 'file')})
                else:
                    if node.get('type') == 'file':
                        content = node.get('content', '')
                        if query in content.lower() or query in name_lower:
                            matches = [{'line': i + 1, 'content': l} for i, l in enumerate(content.splitlines()) if query in l.lower()]
                            results.append({'type': 'code', 'path': path, 'name': node.get('name', ''), 'matches': matches[:5], 'total_matches': len(matches)})
                if node.get('type') == 'dir' and node.get('children'):
                    _search(node['children'])

        _search(repository.tree_data or [])
        return Response(results[:50])

    @action(detail=True, methods=['post'])
    def init(self, request, pk=None):
        """Re-initialize repository with full default scaffold."""
        repository = self.get_object()
        name = repository.repo_name
        repository.tree_data = [
            {'name': 'README.md',        'type': 'file', 'path': 'README.md',        'content': f'# {name}\n\nWelcome to your repository.\n\n## Getting Started\n\nClone and start coding!\n\n## CI/CD\n\nThis repo is connected to AtonixCorp Pipelines.\n'},
            {'name': '.gitignore',       'type': 'file', 'path': '.gitignore',       'content': '__pycache__/\n*.py[cod]\n.env\n.venv/\ndist/\nbuild/\n*.egg-info/\n.DS_Store\nnode_modules/\n'},
            {'name': 'atonixcorp.yaml',  'type': 'file', 'path': 'atonixcorp.yaml',  'content': f'project: {name}\nversion: "1.0"\nruntime: python312\nregion: us-east-1\n'},
            {'name': 'pipeline.yaml',    'type': 'file', 'path': 'pipeline.yaml',    'content': 'name: CI\non:\n  push:\n    branches: [main, develop]\njobs:\n  build:\n    runs-on: atonix-runner\n    steps:\n      - uses: atonix/checkout@v2\n      - run: pip install -r requirements.txt\n      - run: pytest\n'},
            {'name': 'src', 'type': 'dir', 'path': 'src', 'children': [
                {'name': '__init__.py', 'type': 'file', 'path': 'src/__init__.py', 'content': ''},
                {'name': 'main.py',     'type': 'file', 'path': 'src/main.py',     'content': 'def main():\n    print("Hello, world!")\n\nif __name__ == "__main__":\n    main()\n'},
            ]},
            {'name': 'tests', 'type': 'dir', 'path': 'tests', 'children': [
                {'name': '__init__.py',  'type': 'file', 'path': 'tests/__init__.py',  'content': ''},
                {'name': 'test_main.py', 'type': 'file', 'path': 'tests/test_main.py', 'content': 'def test_placeholder():\n    assert True\n'},
            ]},
            {'name': 'requirements.txt', 'type': 'file', 'path': 'requirements.txt', 'content': '# Add your dependencies here\n'},
        ]
        repository.save(update_fields=['tree_data'])
        return Response(repository.tree_data)


    @action(detail=True, methods=['get'], url_path='clone-urls')
    def clone_urls(self, request, pk=None):
        """Return HTTPS and SSH clone URLs for this repository."""
        repo = self.get_object()
        return Response({
            'https': repo.clone_https_url,
            'ssh':   repo.clone_ssh_url,
            'repo_name': repo.repo_name,
        })

    @action(detail=False, methods=['post'], url_path='import')
    def import_repo(self, request):
        """Mirror-clone an external repository into AtonixCorp storage."""
        source_url  = request.data.get('source_url', '').strip()
        repo_name   = request.data.get('repo_name', '').strip()
        project_id  = request.data.get('project_id')
        description = request.data.get('description', '')
        visibility  = request.data.get('visibility', 'private')

        if not source_url:
            return Response({'error': 'source_url is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not repo_name:
            repo_name = source_url.rstrip('/').split('/')[-1].replace('.git', '')

        repo_id   = f"repo-{uuid.uuid4().hex[:12]}"
        repos_root = getattr(__import__('django.conf', fromlist=['settings']).settings, 'GIT_REPOS_ROOT', '/repos')
        disk_path  = os.path.join(repos_root, f"{repo_id}.git")

        # Mirror-clone in background (non-blocking for API response; a real impl would use a Celery task)
        try:
            os.makedirs(repos_root, exist_ok=True)
            subprocess.run(
                ['git', 'clone', '--mirror', source_url, disk_path],
                capture_output=True, timeout=120,
            )
        except Exception as exc:
            return Response({'error': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        project = None
        if project_id:
            try:
                project = Project.objects.get(pk=project_id)
            except Project.DoesNotExist:
                pass

        repo = Repository.objects.create(
            id=repo_id,
            project=project,
            owner=request.user if not project else None,
            provider='atonix',
            repo_name=repo_name,
            repo_description=description,
            visibility=visibility,
            is_bare=True,
            disk_path=disk_path,
        )
        return Response(RepositorySerializer(repo).data, status=status.HTTP_201_CREATED)



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
    Full CRUD for Environment, plus detail sub-resource actions:
      GET  /{id}/health/
      GET  /{id}/deployments/
      POST /{id}/rollback/
      POST /{id}/promote/
      GET  /{id}/services/
      POST /{id}/services/{service_id}/restart/
      POST /{id}/services/{service_id}/scale/
      GET  /{id}/vars/
      POST /{id}/vars/         — upsert a variable
      GET  /{id}/flags/
      POST /{id}/flags/        — upsert a flag
      GET  /{id}/audit/
      GET  /{id}/pipeline-runs/
      GET  /{id}/releases/
    """
    queryset           = Environment.objects.all()
    serializer_class   = EnvironmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Environment.objects.exclude(id='')  # exclude any legacy records with empty id
        project_id = self.request.query_params.get('project_id')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def perform_create(self, serializer):
        name   = self.request.data.get('name', 'env')
        raw_id = f"{slugify(name)[:32]}-{uuid.uuid4().hex[:8]}"
        serializer.save(id=raw_id)

    def destroy(self, request, *args, **kwargs):
        env = self.get_object()
        if env.is_protected:
            return Response(
                {'detail': 'Protected environments cannot be deleted. Unlock it first.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        self._audit(env, 'delete', resource=env.name)
        env.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # ── Audit helper ─────────────────────────────────────────────────────────
    def _audit(self, env, action, resource='', result='success'):
        actor = self.request.user.username if self.request.user.is_authenticated else 'system'
        EnvironmentAuditEntry.objects.create(
            environment=env, action=action,
            actor=actor, resource=resource, result=result,
        )

    # ── Health ────────────────────────────────────────────────────────────────
    @action(detail=True, methods=['get'])
    def health(self, request, pk=None):
        env      = self.get_object()
        services = env.services.all()
        total    = services.count()
        up       = services.filter(status='running').count()
        errored  = services.filter(status='error').count()

        if total == 0:
            svc_status = 'healthy'
        elif errored > 0:
            svc_status = 'critical'
        elif up < total:
            svc_status = 'degraded'
        else:
            svc_status = 'healthy'

        avg_cpu = round(sum(s.cpu_pct for s in services) / total, 1) if total else 0
        avg_ram = round(sum(s.ram_mb  for s in services) / total, 1) if total else 0

        last_dep = env.deployments.filter(status='success').first()
        return Response({
            'status':         svc_status,
            'cpu_pct':        avg_cpu,
            'ram_pct':        min(round(avg_ram / 10, 1), 100),
            'disk_pct':       0,
            'error_rate':     0.0,
            'latency_ms':     0,
            'uptime_pct':     100.0 if svc_status == 'healthy' else 95.0,
            'active_version': last_dep.version if last_dep else 'unknown',
            'last_deploy_ok': last_dep.status == 'success' if last_dep else False,
            'last_deploy_at': last_dep.finished_at.isoformat() if (last_dep and last_dep.finished_at) else None,
            'services_up':    up,
            'services_total': total,
        })

    # ── Deployments ───────────────────────────────────────────────────────────
    @action(detail=True, methods=['get'])
    def deployments(self, request, pk=None):
        env  = self.get_object()
        deps = env.deployments.all()
        return Response(EnvironmentDeploymentSerializer(deps, many=True).data)

    @action(detail=True, methods=['post'])
    def rollback(self, request, pk=None):
        env           = self.get_object()
        deployment_id = request.data.get('deployment_id')
        target        = get_object_or_404(EnvironmentDeployment, id=deployment_id, environment=env)
        EnvironmentDeployment.objects.create(
            environment=env,
            version=target.version,
            status='success',
            triggered_by=request.user.username,
            notes=f'Rollback to {target.version}',
        )
        self._audit(env, 'rollback', resource=target.version)
        return Response({'detail': f'Rolled back to {target.version}.'})

    @action(detail=True, methods=['post'])
    def promote(self, request, pk=None):
        env      = self.get_object()
        to_stage = request.data.get('to_stage', '')
        last_dep = env.deployments.filter(status='success').first()
        version  = last_dep.version if last_dep else 'unknown'
        self._audit(env, 'promote', resource=f'{env.name} → {to_stage}')
        return Response({'detail': f'Promote of {version} to {to_stage} queued.'})

    # ── Services ──────────────────────────────────────────────────────────────
    @action(detail=True, methods=['get'])
    def services(self, request, pk=None):
        env  = self.get_object()
        svcs = env.services.all()
        return Response(EnvironmentServiceSerializer(svcs, many=True).data)

    @action(detail=True, methods=['post'],
            url_path=r'services/(?P<service_id>[^/.]+)/restart')
    def restart_service(self, request, pk=None, service_id=None):
        env = self.get_object()
        svc = get_object_or_404(EnvironmentService, id=service_id, environment=env)
        svc.status   = 'running'
        svc.last_log = 'Restarted by user'
        svc.save(update_fields=['status', 'last_log'])
        self._audit(env, 'restart_service', resource=svc.name)
        return Response({'detail': f'Service {svc.name} restarted.'})

    @action(detail=True, methods=['post'],
            url_path=r'services/(?P<service_id>[^/.]+)/scale')
    def scale_service(self, request, pk=None, service_id=None):
        env      = self.get_object()
        svc      = get_object_or_404(EnvironmentService, id=service_id, environment=env)
        replicas = int(request.data.get('replicas', svc.desired))
        svc.desired   = replicas
        svc.replicas  = replicas
        svc.status    = 'running'
        svc.save(update_fields=['desired', 'replicas', 'status'])
        self._audit(env, 'scale_service', resource=f'{svc.name} → {replicas}')
        return Response({'detail': f'Service {svc.name} scaled to {replicas} replicas.'})

    # ── Config vars ───────────────────────────────────────────────────────────
    @action(detail=True, methods=['get', 'post'])
    def vars(self, request, pk=None):
        env = self.get_object()
        if request.method == 'GET':
            return Response(EnvironmentVariableSerializer(env.variables.all(), many=True).data)
        # POST — upsert
        key    = request.data.get('key', '').strip()
        value  = request.data.get('value', '')
        secret = bool(request.data.get('secret', False))
        if not key:
            return Response({'detail': 'key is required.'}, status=status.HTTP_400_BAD_REQUEST)
        obj, _ = EnvironmentVariable.objects.update_or_create(
            environment=env, key=key,
            defaults={'value': value, 'secret': secret},
        )
        self._audit(env, 'set_var', resource=key)
        return Response(EnvironmentVariableSerializer(obj).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'],
            url_path=r'vars/(?P<var_key>[^/.]+)')
    def delete_var(self, request, pk=None, var_key=None):
        env = self.get_object()
        EnvironmentVariable.objects.filter(environment=env, key=var_key).delete()
        self._audit(env, 'delete_var', resource=var_key)
        return Response(status=status.HTTP_204_NO_CONTENT)

    # ── Feature flags ─────────────────────────────────────────────────────────
    @action(detail=True, methods=['get', 'post'])
    def flags(self, request, pk=None):
        env = self.get_object()
        if request.method == 'GET':
            return Response(EnvironmentFeatureFlagSerializer(env.feature_flags.all(), many=True).data)
        key     = request.data.get('key', '').strip()
        enabled = bool(request.data.get('enabled', False))
        note    = request.data.get('note', '')
        if not key:
            return Response({'detail': 'key is required.'}, status=status.HTTP_400_BAD_REQUEST)
        obj, _ = EnvironmentFeatureFlag.objects.update_or_create(
            environment=env, key=key,
            defaults={'enabled': enabled, 'note': note},
        )
        self._audit(env, 'set_flag', resource=f'{key}={enabled}')
        return Response(EnvironmentFeatureFlagSerializer(obj).data, status=status.HTTP_201_CREATED)

    # ── Audit log ─────────────────────────────────────────────────────────────
    @action(detail=True, methods=['get'])
    def audit(self, request, pk=None):
        env = self.get_object()
        return Response(EnvironmentAuditEntrySerializer(env.audit_entries.all(), many=True).data)

    # ── Pipeline runs targeting this environment ───────────────────────────────
    @action(detail=True, methods=['get'], url_path='pipeline-runs')
    def pipeline_runs(self, request, pk=None):
        env  = self.get_object()
        runs = PipelineRun.objects.filter(
            definition__project=env.project,
            env_deployments__environment=env,
        ).distinct().order_by('-created_at')[:50]
        data = [{
            'id':          r.id,
            'name':        r.definition.name,
            'status':      r.status,
            'version':     r.commit_sha[:8] if r.commit_sha else '',
            'started_at':  r.started_at.isoformat() if r.started_at else None,
            'finished_at': r.finished_at.isoformat() if r.finished_at else None,
        } for r in runs]
        return Response(data)

    # ── Releases ──────────────────────────────────────────────────────────────
    @action(detail=True, methods=['get'])
    def releases(self, request, pk=None):
        env = self.get_object()
        return Response(EnvironmentReleaseSerializer(env.releases.all(), many=True).data)

    # ── Discovered Config Files ───────────────────────────────────────────────
    @action(detail=True, methods=['get'])
    def files(self, request, pk=None):
        """Return all discovered configuration/infra files for this environment."""
        env   = self.get_object()
        qs    = env.files.all()
        ftype = request.query_params.get('type')
        if ftype:
            qs = qs.filter(file_type=ftype)
        return Response(EnvironmentFileSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'])
    def discover(self, request, pk=None):
        """
        Trigger a (simulated) config-file discovery scan for this environment.
        In a real deployment this would fan out to repo scanners; here we seed
        representative sample data so the UI has something to render immediately.
        """
        import random
        from django.utils import timezone as tz
        from datetime import timedelta

        env = self.get_object()

        # Clear stale discovery results so re-runs stay fresh
        env.files.all().delete()

        SAMPLES = [
            ('Dockerfile',                'Dockerfile',                       'dockerfile',  True,  False, 'api-gateway'),
            ('docker-compose.yml',        'docker-compose.yml',               'compose',     True,  False, ''),
            ('.env.production',           '.env.production',                  'env',         True,  False, ''),
            ('values.yaml',               'helm/values.yaml',                 'helm',        True,  False, ''),
            ('deployment.yaml',           'k8s/deployment.yaml',              'k8s',         True,  False, 'api-gateway'),
            ('service.yaml',              'k8s/service.yaml',                 'k8s',         True,  False, 'api-gateway'),
            ('main.tf',                   'terraform/main.tf',                'terraform',   True,  False, ''),
            ('variables.tf',              'terraform/variables.tf',           'terraform',   True,  False, ''),
            ('nginx.conf',                'docker/nginx.conf',                'config',      True,  False, 'nginx'),
            ('application.yaml',          'src/main/resources/application.yaml', 'yaml',    True,  False, ''),
            ('.env.staging',              '.env.staging',                     'env',         False, True,  ''),
            ('Chart.yaml',                'helm/Chart.yaml',                  'helm',        True,  False, ''),
        ]

        created = []
        for file_name, file_path, file_type, is_valid, is_env_specific, svc in SAMPLES:
            has_errors = not is_valid
            f = EnvironmentFile.objects.create(
                environment=env,
                file_name=file_name,
                file_path=file_path,
                file_type=file_type,
                associated_service=svc,
                is_valid=is_valid,
                has_errors=has_errors,
                error_message='Syntax error on line 12' if has_errors else '',
                is_env_specific=is_env_specific,
                last_modified=tz.now() - timedelta(days=random.randint(0, 30)),
            )
            created.append(f)

        self._audit(env, 'discover_files', resource=f'{len(created)} files found')
        return Response({
            'detail': f'Discovery complete. {len(created)} files found.',
            'count':  len(created),
            'files':  EnvironmentFileSerializer(created, many=True).data,
        })


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


class SSHKeyViewSet(viewsets.ModelViewSet):
    """CRUD for user SSH public keys."""
    serializer_class   = SSHKeySerializer
    permission_classes = [IsAuthenticated]
    http_method_names  = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        return SSHKey.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        from django.utils import timezone as tz
        serializer.save(
            id=f"key-{uuid.uuid4().hex[:12]}",
            user=self.request.user,
        )
