from rest_framework import serializers
from .models import Enterprise, EnterpriseTeam, EnterpriseGroup, MigrationRun
from teams.serializers import TeamSerializer
from teams.models import Team


class EnterpriseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enterprise
        fields = ['id', 'name', 'slug', 'description', 'website', 'created_at', 'updated_at']


class EnterpriseTeamSerializer(serializers.ModelSerializer):
    team = TeamSerializer(read_only=True)

    class Meta:
        model = EnterpriseTeam
        fields = ['id', 'enterprise', 'team', 'role', 'added_at']


class EnterpriseTeamCreateSerializer(serializers.Serializer):
    # Accept payload to create a Team and link it, or link existing team by id
    team_id = serializers.IntegerField(required=False)
    name = serializers.CharField(required=False, allow_blank=True)
    slug = serializers.SlugField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    role = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        if not data.get('team_id') and not data.get('name'):
            raise serializers.ValidationError('Either team_id or name must be provided')
        return data

    def create(self, validated_data):
        enterprise = self.context['enterprise']
        role = validated_data.get('role', '')

        if validated_data.get('team_id'):
            team = Team.objects.get(pk=validated_data['team_id'])
        else:
            # create a new Team
            team = Team.objects.create(
                name=validated_data.get('name'),
                slug=validated_data.get('slug') or validated_data.get('name').lower().replace(' ', '-'),
                mission=validated_data.get('description', ''),
            )

        link, created = EnterpriseTeam.objects.get_or_create(enterprise=enterprise, team=team, defaults={'role': role})
        if not created and role:
            link.role = role
            link.save()
        return link


class EnterpriseGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnterpriseGroup
        fields = ['id', 'enterprise', 'name', 'description', 'created_at']


class MigrationRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = MigrationRun
        fields = ['id', 'enterprise', 'run_id', 'status', 'started_at', 'finished_at', 'details']
