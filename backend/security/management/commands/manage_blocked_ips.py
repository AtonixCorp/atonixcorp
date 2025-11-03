from django.core.management.base import BaseCommand, CommandError
from security.models import BlockedNetwork


class Command(BaseCommand):
    help = 'Manage blocked IPs / CIDR ranges for auth blocking. Usage: add|remove|list <value>'

    def add_arguments(self, parser):
        sub = parser.add_subparsers(dest='cmd')

        add = sub.add_parser('add', help='Add a blocked IP or CIDR')
        add.add_argument('value', help='IP or CIDR to block (e.g. 1.2.3.4 or 203.0.113.0/24)')
        add.add_argument('--note', help='Optional note', default='')

        remove = sub.add_parser('remove', help='Remove a blocked IP or CIDR')
        remove.add_argument('value', help='IP or CIDR to remove')

        sub.add_parser('list', help='List blocked entries')

    def handle(self, *args, **options):
        cmd = options.get('cmd')
        if cmd == 'add':
            value = options['value']
            note = options.get('note', '')
            obj, created = BlockedNetwork.objects.get_or_create(value=value)
            obj.note = note
            obj.active = True
            try:
                obj.save()
                if created:
                    self.stdout.write(self.style.SUCCESS(f'Added blocked entry: {value}'))
                else:
                    self.stdout.write(self.style.SUCCESS(f'Updated blocked entry: {value}'))
            except Exception as e:
                raise CommandError(f'Invalid value or save failure: {e}')

        elif cmd == 'remove':
            value = options['value']
            try:
                obj = BlockedNetwork.objects.get(value=value)
                obj.delete()
                self.stdout.write(self.style.SUCCESS(f'Removed blocked entry: {value}'))
            except BlockedNetwork.DoesNotExist:
                raise CommandError('Entry not found')

        elif cmd == 'list':
            qs = BlockedNetwork.objects.all().order_by('-created_at')
            if not qs.exists():
                self.stdout.write('No blocked entries found')
                return
            for b in qs:
                self.stdout.write(f'{b.value}\tCIDR={b.is_cidr}\tactive={b.active}\tnote={b.note}')

        else:
            raise CommandError('Unknown command. Use add|remove|list')
