from django.core.management.base import BaseCommand
from access_control.models import Role, Permission


class Command(BaseCommand):
    help = 'Bootstrap default roles and permissions for the access_control app'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Reset all roles and permissions before creating new ones',
        )

    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write('Resetting all roles and permissions...')
            Role.objects.all().delete()
            Permission.objects.all().delete()

        # Core permissions
        permissions = [
            # Admin permissions
            ('admin:all', 'Administrator: full system access'),
            ('admin:users', 'Manage users and roles'),
            ('admin:system', 'System administration'),
            
            # User management
            ('user:create', 'Create users'),
            ('user:read', 'Read user information'),
            ('user:update', 'Update user information'),
            ('user:delete', 'Delete users'),
            
            # Project permissions
            ('project:create', 'Create projects'),
            ('project:read', 'Read projects'),
            ('project:update', 'Update projects'),
            ('project:delete', 'Delete projects'),
            ('project:manage', 'Manage project settings'),
            
            # Team permissions
            ('team:create', 'Create teams'),
            ('team:read', 'Read team information'),
            ('team:update', 'Update teams'),
            ('team:delete', 'Delete teams'),
            ('team:manage', 'Manage team members'),
            
            # Resource permissions
            ('resource:create', 'Create resources'),
            ('resource:read', 'Read resources'),
            ('resource:update', 'Update resources'),
            ('resource:delete', 'Delete resources'),
            
            # Dashboard and analytics
            ('dashboard:read', 'View dashboard'),
            ('analytics:read', 'View analytics'),
            
            # API access
            ('api:read', 'API read access'),
            ('api:write', 'API write access'),
        ]

        created_permissions = {}
        for code, name in permissions:
            permission, created = Permission.objects.get_or_create(
                code=code,
                defaults={'name': name}
            )
            created_permissions[code] = permission
            status = 'Created' if created else 'Found'
            self.stdout.write(f'{status} permission: {permission.code}')

        # Create roles
        roles_config = [
            {
                'name': 'admin',
                'description': 'Platform administrators with full access',
                'permissions': ['admin:all']
            },
            {
                'name': 'manager',
                'description': 'Project and team managers',
                'permissions': [
                    'project:create', 'project:read', 'project:update', 'project:manage',
                    'team:create', 'team:read', 'team:update', 'team:manage',
                    'resource:create', 'resource:read', 'resource:update',
                    'dashboard:read', 'analytics:read',
                    'api:read', 'api:write'
                ]
            },
            {
                'name': 'developer',
                'description': 'Developers with project access',
                'permissions': [
                    'project:read', 'project:update',
                    'team:read',
                    'resource:create', 'resource:read', 'resource:update',
                    'dashboard:read',
                    'api:read', 'api:write'
                ]
            },
            {
                'name': 'viewer',
                'description': 'Read-only access to projects and resources',
                'permissions': [
                    'project:read',
                    'team:read',
                    'resource:read',
                    'dashboard:read',
                    'api:read'
                ]
            },
            {
                'name': 'user',
                'description': 'Basic authenticated users',
                'permissions': [
                    'project:read',
                    'resource:read',
                    'dashboard:read'
                ]
            }
        ]

        for role_config in roles_config:
            role, created = Role.objects.get_or_create(
                name=role_config['name'],
                defaults={'description': role_config['description']}
            )
            
            # Add permissions to role
            for perm_code in role_config['permissions']:
                if perm_code in created_permissions:
                    role.permissions.add(created_permissions[perm_code])
            
            status = 'Created' if created else 'Updated'
            self.stdout.write(f'{status} role: {role.name} with {len(role_config["permissions"])} permissions')

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully bootstrapped {len(permissions)} permissions and {len(roles_config)} roles'
            )
        )