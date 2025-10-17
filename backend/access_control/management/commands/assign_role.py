from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from access_control.models import Role, RoleAssignment

User = get_user_model()


class Command(BaseCommand):
    help = 'Assign roles to users'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username to assign role to')
        parser.add_argument('role_name', type=str, help='Role name to assign')
        parser.add_argument(
            '--remove',
            action='store_true',
            help='Remove the role instead of adding it',
        )

    def handle(self, *args, **options):
        username = options['username']
        role_name = options['role_name']
        remove = options['remove']

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'User "{username}" does not exist')
            )
            return

        try:
            role = Role.objects.get(name=role_name)
        except Role.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'Role "{role_name}" does not exist')
            )
            return

        if remove:
            try:
                assignment = RoleAssignment.objects.get(user=user, role=role)
                assignment.delete()
                self.stdout.write(
                    self.style.SUCCESS(f'Removed role "{role_name}" from user "{username}"')
                )
            except RoleAssignment.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f'User "{username}" does not have role "{role_name}"')
                )
        else:
            assignment, created = RoleAssignment.objects.get_or_create(
                user=user,
                role=role
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Assigned role "{role_name}" to user "{username}"')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'User "{username}" already has role "{role_name}"')
                )