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
        atonixcorp_project, created = Project.objects.get_or_create(
            slug='atonixcorp-project',
            defaults={
                'name': 'Atonixcorp-project',
                'overview': 'The backbone of AtonixCorp\'s infrastructure strategy. This modular stack powers scalable services, persistent data layers, and distributed orchestration across domains like medicine, agriculture, security, and advanced analytics.',
                'description': 'It\'s not just a system—it\'s the foundation of our technical sovereignty.',
                'status': 'active',
                'is_featured': True,
                'technologies': ['Python', 'Django', 'React', 'Docker', 'Kubernetes', 'PostgreSQL']
            }
        )

        tmsvic_discovery = Project.objects.create(
            name='Tmsvic-Discovery',
            slug='tmsvic-discovery',
            overview='A storytelling engine for the future. Tmsvic Discovery explores the cosmos, technology, and sovereign infrastructure through deep science and motivational insight.',
            description='From quantum physics to climate resilience, it\'s a portal to bold ideas and timeless truths that shape tomorrow.',
            status='active',
            is_featured=True,
            technologies=['Python', 'AI/ML', 'Natural Language Processing', 'Data Analytics']
        )

        atonixcorp_security = Project.objects.create(
            name='Osrovnet',
            slug='atonixcorp-security',
            overview='Osrovnet: flagship platform for advanced network security, threat intelligence, and resilient infrastructure design.',
            description='Built for sovereign systems and mission-critical environments, Osrovnet empowers organizations to defend from protocol to perimeter with precision, insight, and autonomy.',
            status='active',
            is_featured=True,
            technologies=['Cybersecurity', 'Network Analysis', 'Threat Intelligence', 'DevSecOps']
        )

        hydrpetro = Project.objects.create(
            name='Hydrpetro',
            slug='hydrpetro',
            overview='Precision engineering for energy evolution. Hydrpetro delivers advanced solutions for oil and gas operations.',
            description='Enhancing safety, efficiency, and sustainability through quantum-aware analytics and intelligent automation.',
            status='development',
            technologies=['IoT', 'Industrial Analytics', 'Energy Systems', 'Automation']
        )

        smarttech = Project.objects.create(
            name='SmartTech Integration',
            slug='smarttech-integration',
            overview='Seamless intelligence in motion. This project develops adaptive systems that integrate with legacy and emerging technologies.',
            description='Boosting operational efficiency, interoperability, and real-time responsiveness across sectors.',
            status='active',
            technologies=['Systems Integration', 'API Development', 'Legacy Modernization', 'IoT']
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
            url='https://twitter.com/AtonixCorp',
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

        self.stdout.write(self.style.SUCCESS('Successfully loaded sample data!'))