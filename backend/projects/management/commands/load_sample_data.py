from django.core.management.base import BaseCommand
from projects.models import Project, ProjectFeature
from teams.models import Team, TeamMember, TeamSkill
from focus_areas.models import FocusArea, FocusAreaTechnology, FocusAreaSolution
from resources.models import ResourceCategory, Resource, CommunityLink, FAQ
from contact.models import ContactPerson, OfficeLocation


class Command(BaseCommand):
    help = 'Load initial sample data for AtonixCorp platform'

    def handle(self, *args, **options):
        self.stdout.write('Loading sample data...')

        # Create Projects
        atonixcorp_platform, created = Project.objects.get_or_create(
            slug='atonixcorp-platform',
            defaults={
                'name': 'Atonixcorp-Platform',
                'overview': 'The backbone of AtonixCorp\'s infrastructure strategy.',
                'description': 'This modular stack powers scalable services, persistent data layers, and distributed orchestration across domains like medicine, agriculture, security, and advanced analytics. It\'s not just a system—it\'s the foundation of our technical sovereignty.',
                'status': 'active',
                'is_featured': True,
                'technologies': ['Python', 'Django', 'React', 'TypeScript', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'Nginx']
            }
        )

        planivar = Project.objects.create(
            name='Planivar',
            slug='planivar',
            overview='A comprehensive space research platform pioneering sovereign space technologies.',
            description='Planivar is AtonixCorp\'s flagship platform for advanced space research, pioneering sovereign space technologies that advance human understanding, interstellar exploration, and real-time scientific communication.',
            status='active',
            is_featured=True,
            technologies=['Python', 'AI/ML', 'TensorFlow', 'PyTorch', 'Go', 'Docker', 'Kubernetes']
        )

<<<<<<< HEAD
        voltoraiq = Project.objects.create(
            name='Voltoraiq',
            slug='voltoraiq',
            overview='A comprehensive full-stack web application for monitoring and managing solar energy systems.',
            description='Voltoraiq is a comprehensive full-stack web application for monitoring and managing solar energy systems with IoT integration. This system provides real-time monitoring, remote control capabilities, and advanced analytics for solar panels, battery banks, and IoT devices.',
            status='active',
            is_featured=True,
            technologies=['React', 'TypeScript', 'Python', 'Django', 'PostgreSQL', 'Docker', 'AI/ML']
        )

        osrovnet = Project.objects.create(
            name='Osrovnet',
            slug='osrovnet',
            overview='Osrovnet is AtonixCorp\'s flagship platform for advanced network security, threat intelligence, and resilient infrastructure design.',
            description='Osrovnet is AtonixCorp\'s flagship platform for advanced network security, threat intelligence, and resilient infrastructure design. Built for sovereign systems and mission-critical environments, Osrovnet empowers organizations to defend from protocol to perimeter with precision, insight, and autonomy.',
=======
<<<<<<< HEAD
        osrovnet = Project.objects.create(
            name='Osrovnet',
            slug='osrovnet',
            overview='AtonixCorp\'s flagship platform for advanced network security, threat intelligence, and resilient infrastructure design.',
=======
        atonixcorp_security = Project.objects.create(
            name='Osrovnet',
            slug='atonixcorp-security',
            overview='Osrovnet: flagship platform for advanced network security, threat intelligence, and resilient infrastructure design.',
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
            description='Built for sovereign systems and mission-critical environments, Osrovnet empowers organizations to defend from protocol to perimeter with precision, insight, and autonomy.',
>>>>>>> cf817c2f425914921dfacd00e49554c630584992
            status='active',
            is_featured=True,
            technologies=['Python', 'Go', 'Rust', 'PostgreSQL', 'Docker', 'Kubernetes', 'AI/ML']
        )

        tujengepay = Project.objects.create(
            name='TujengePay',
            slug='tujengepay',
            overview='A comprehensive, modern financial platform built with cutting-edge technologies.',
            description='TujengePay is a comprehensive, modern financial platform built with cutting-edge technologies. It provides a seamless experience for digital transactions, currency exchange, and wallet management across web and mobile platforms.',
            status='active',
            is_featured=True,
            technologies=['React', 'TypeScript', 'Python', 'Django', 'Blockchain', 'PostgreSQL', 'Docker', 'Kubernetes']
        )

        # Create Teams
        pioneers = Team.objects.create(
            name='Pioneers',
            slug='pioneers',
            mission='The Pioneers team embodies the spirit of exploration and innovation, developing cutting-edge solutions that set new benchmarks in the industry.',
            description='Our team focuses on breakthrough technologies and disruptive innovations.',
            color_theme='#2196f3',
            is_active=True
        )

        unity_developers = Team.objects.create(
            name='Unity Developers',
            slug='unity-developers',
            mission='The Unity Developers team is dedicated to fostering collaboration and harmony in software development.',
            description='Our mission is to create cutting-edge software that meets and exceeds the needs of our clients.',
            color_theme='#ff5722',
            is_active=True
        )

        # Create Focus Areas
        agriculture = FocusArea.objects.create(
            name='Agriculture',
            slug='agriculture',
            description='Leveraging IoT and big data to transform agricultural practices, increase yield, and ensure sustainable farming.',
            color_theme='#4caf50',
            order=1
        )

        fintech = FocusArea.objects.create(
            name='Fintech',
            slug='fintech',
            description='Developing secure and efficient financial technologies to enhance digital transactions and financial services.',
            color_theme='#ff9800',
            order=2
        )

        medical_research = FocusArea.objects.create(
            name='Medical Research',
            slug='medical-research',
            description='Advancing medical research through innovative data analytics and IoT solutions to improve patient outcomes.',
            color_theme='#e91e63',
            order=3
        )

        security = FocusArea.objects.create(
            name='Security',
            slug='security',
            description='Creating robust security solutions to protect sensitive data and ensure privacy in the digital age.',
            color_theme='#f44336',
            order=4
        )

        big_data = FocusArea.objects.create(
            name='Big Data',
            slug='big-data',
            description='Harnessing the power of big data to derive actionable insights and drive strategic decisions.',
            color_theme='#9c27b0',
            order=5
        )

        cloud_computing = FocusArea.objects.create(
            name='Cloud Computing',
            slug='cloud-computing',
            description='Utilizing cloud technologies to provide scalable, flexible, and cost-effective computing resources.',
            color_theme='#2196f3',
            order=6
        )

        # Create Resource Categories and Resources
        dev_guidelines = ResourceCategory.objects.create(
            name='Development Guidelines',
            slug='development-guidelines',
            description='Best practices, coding standards, and development tools.',
            order=1
        )

        Resource.objects.create(
            title='Contributing Guide',
            slug='contributing-guide',
            category=dev_guidelines,
            description='Learn how to contribute to AtonixCorp projects.',
            resource_type='guideline',
            is_featured=True
        )

        # Create Community Links
        CommunityLink.objects.create(
            platform='Twitter',
            name='@AtonixCorp',
<<<<<<< HEAD
            url='https://twitter.com/AtonixCorp',
=======
            url='https://x.com/AtonixCorp',
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
            icon='twitter',
            order=1
        )

        CommunityLink.objects.create(
            platform='GitHub',
            name='AtonixCorp on GitHub',
            url='https://github.com/AtonixCorp',
            icon='github',
            order=2
        )

        CommunityLink.objects.create(
            platform='LinkedIn',
            name='AtonixCorp on LinkedIn',
            url='https://linkedin.com/company/atonixcorp',
            icon='linkedin',
            order=3
        )

        # Create Contact Person
        ContactPerson.objects.create(
            name='Samuel',
            title='Project Manager & Technical Lead',
            email='guxegdsa@atonixcorp.com',
            department='Management',
            is_primary=True,
            is_active=True,
            bio='Leading AtonixCorp\'s technical strategy and project management initiatives.'
        )

        # Create FAQ
        FAQ.objects.create(
            question='What is AtonixCorp\'s main focus?',
            answer='AtonixCorp focuses on building secure, scalable, and autonomous cloud solutions across various domains including agriculture, fintech, medical research, security, big data, and cloud computing.',
            is_featured=True,
            order=1
        )

<<<<<<< HEAD
        self.stdout.write(self.style.SUCCESS('Successfully loaded sample data!'))
=======
        self.stdout.write(self.style.SUCCESS('Successfully loaded sample data!'))
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
