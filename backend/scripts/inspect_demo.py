from django.contrib.auth import get_user_model
from enterprises.models import Enterprise, EnterpriseTeam
from teams.models import TeamMembership

U = get_user_model()
try:
    u = U.objects.get(username='dev')
except Exception:
    print('No user dev found')
    raise

print('User:', u.username, 'id=', u.id)

ents = list(Enterprise.objects.filter(enterprise_teams__team__memberships__user=u).values_list('slug', flat=True))
print('enterprises_for_user:', ents)

members = list(TeamMembership.objects.filter(user__username='dev').values('id','team_id','team__slug','membership_type'))
print('team_memberships:', members)

links = list(EnterpriseTeam.objects.filter(team__slug='demo-team').values('id','enterprise__slug','team__slug'))
print('enterprise_team_links:', links)
