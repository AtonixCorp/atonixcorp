from rest_framework import serializers
from .models import Workspace, WorkspaceBinding, ProvisionedResource


class WorkspaceBindingSerializer(serializers.ModelSerializer):
    class Meta:
        model  = WorkspaceBinding
        fields = [
            "id", "workspace", "environment",
            "openstack_project", "openstack_region",
            "quota_vcpus", "quota_ram_gb", "quota_storage_gb",
        ]
        read_only_fields = ["id"]


class WorkspaceSerializer(serializers.ModelSerializer):
    bindings = WorkspaceBindingSerializer(many=True, read_only=True)

    class Meta:
        model  = Workspace
        fields = [
            "id", "workspace_id", "display_name", "description",
            "owner", "members", "is_active", "created_at", "bindings",
        ]
        read_only_fields = ["id", "created_at"]


class ProvisionedResourceSerializer(serializers.ModelSerializer):
    workspace_id = serializers.CharField(source="workspace.workspace_id", read_only=True)

    class Meta:
        model  = ProvisionedResource
        fields = [
            "id", "workspace_id", "environment",
            "resource_type", "resource_id", "resource_name",
            "openstack_project", "region",
            "status", "metadata",
            "created_by", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "workspace_id", "resource_id",
            "openstack_project", "region",
            "created_by", "created_at", "updated_at",
        ]
