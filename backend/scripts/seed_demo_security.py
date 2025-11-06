"""
Seed demo enterprise, team, membership and security data for local development.

Run with:
  ./venv/bin/python manage.py shell < backend/scripts/seed_demo_security.py

This script is idempotent: it uses get_or_create for objects.
"""
from datetime import date, timedelta

from django.contrib.auth import get_user_model

from enterprises.models import Enterprise, EnterpriseTeam
from teams.models import Team, TeamMembership
from enterprises.security_models import (
    SecurityFramework,
    EnterpriseSecurityPolicy,
    SecurityControl,
    SecurityIncident,
    SecurityAudit,
    ComplianceTracker,
)

User = get_user_model()

def run():

    print('Creating user dev...')
    user, created = User.objects.get_or_create(username='dev', defaults={'email': 'dev@example.com'})
    if created:
        print('User dev created')
    else:
        print('User dev already exists')
    user.set_password('devpass')
    user.save()

    print('Creating enterprise demo-enterprise...')
    enterprise, ecreated = Enterprise.objects.get_or_create(slug='demo-enterprise', defaults={'name': 'Demo Enterprise', 'description': 'Seeded demo enterprise for development.'})
    print('Enterprise created?' , ecreated)

    print('Creating team demo-team...')
    team, tcreated = Team.objects.get_or_create(slug='demo-team', defaults={'name': 'Demo Team', 'mission':'Demo mission', 'description':'Team for demo enterprise'})
    print('Team created?', tcreated)

    # Ensure membership
    print('Creating TeamMembership...')
    try:
        membership, mcreated = TeamMembership.objects.get_or_create(user=user, team=team, defaults={'membership_type':'admin'})
        print('TeamMembership created?', mcreated)
    except Exception as ex:
        print('Failed to create TeamMembership:', ex)

    # Link team to enterprise
    print('Creating EnterpriseTeam link...')
    try:
        ent_team, etcreated = EnterpriseTeam.objects.get_or_create(enterprise=enterprise, team=team, defaults={'role':'owner'})
        print('EnterpriseTeam created?', etcreated)
    except Exception as ex:
        print('Failed to create EnterpriseTeam:', ex)

    # Create frameworks
    nist, _ = SecurityFramework.objects.get_or_create(name='nist_csf', defaults={'display_name':'NIST CSF','description':'NIST Cybersecurity Framework','version':'1.1'})
    iso, _ = SecurityFramework.objects.get_or_create(name='iso_27001', defaults={'display_name':'ISO 27001','description':'ISO/IEC 27001','version':'2013'})

    # Create enterprise security policy
    policy, _ = EnterpriseSecurityPolicy.objects.get_or_create(enterprise=enterprise, defaults={
        'mfa_required': True,
        'password_min_length': 12,
        'session_timeout_minutes': 30,
        'encryption_at_rest': True,
        'updated_by': user,
    })
    policy.frameworks.add(nist, iso)
    policy.primary_framework = nist
    policy.save()

    # Create some controls
    controls = [
        {'control_id':'AC-2','name':'Account Management','description':'Manage accounts securely','category':'Access Control','status':'verified','priority':'high','framework':nist},
        {'control_id':'IA-2','name':'Identification and Authentication','description':'Use strong authentication','category':'Identity','status':'implemented','priority':'critical','framework':nist},
    ]
    for c in controls:
        SecurityControl.objects.update_or_create(enterprise=enterprise, framework=c['framework'], control_id=c['control_id'], defaults={
            'name': c['name'], 'description': c['description'], 'category': c['category'], 'status': c['status'], 'priority': c['priority']
        })

    # Add an incident
    inc, _ = SecurityIncident.objects.get_or_create(enterprise=enterprise, title='Demo: Unauthorized login attempt', defaults={
        'description':'Multiple failed logins detected from a single IP',
        'severity':'high', 'status':'investigating', 'systems_affected':['web','api'],
    })

    # Add an upcoming audit and a recent completed audit
    SecurityAudit.objects.update_or_create(enterprise=enterprise, title='Quarterly Security Audit', defaults={
        'audit_type':'internal', 'status':'scheduled', 'scope':'Infrastructure and apps', 'scheduled_date': date.today() + timedelta(days=14), 'findings_count':0
    })
    SecurityAudit.objects.update_or_create(enterprise=enterprise, title='Penetration Test - Infra', defaults={
        'audit_type':'pentest', 'status':'completed', 'scope':'Network and infra', 'scheduled_date': date.today() - timedelta(days=40), 'findings_count':3, 'critical_findings':0, 'high_findings':1, 'medium_findings':2
    })

    # Compliance trackers
    ComplianceTracker.objects.update_or_create(enterprise=enterprise, framework=nist, requirement_name='Implement MFA', defaults={
        'description':'Multi-factor authentication for all users', 'status':'completed', 'status_percentage':100, 'deadline': date.today() - timedelta(days=1), 'owner': user
    })
    ComplianceTracker.objects.update_or_create(enterprise=enterprise, framework=iso, requirement_name='Encrypt data at rest', defaults={
        'description':'Ensure database encryption', 'status':'in_progress', 'status_percentage':60, 'deadline': date.today() + timedelta(days=30), 'owner': user
    })

    print('Seeded demo enterprise and security data for', enterprise.slug)

if __name__ == '__main__':
    run()
