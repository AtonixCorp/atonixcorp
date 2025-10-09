from django.core.management.base import BaseCommand
from projects.models import Project
from teams.models import Team, TeamMember
from focus_areas.models import FocusArea, FocusAreaTechnology, FocusAreaSolution
from resources.models import ResourceCategory, Resource
from contact.models import ContactPerson, OfficeLocation
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Populate the database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Populating database with sample data...')

        # Create sample projects
        self.create_projects()
        
        # Create sample teams
        self.create_teams()
        
        # Create sample focus areas
        self.create_focus_areas()
        
        # Create sample resources
        self.create_resources()
        
        # Create sample contact info
        self.create_contact()

        self.stdout.write(self.style.SUCCESS('Successfully populated database!'))

    def create_projects(self):
        projects_data = [
            {
                'name': 'SmartCity Analytics Platform',
                'slug': 'smartcity-analytics-platform',
                'overview': 'A comprehensive platform for analyzing urban data and improving city services through intelligent insights.',
                'description': 'The SmartCity Analytics Platform is a revolutionary solution that leverages big data, IoT sensors, and machine learning to help cities optimize their services and infrastructure. The platform integrates data from traffic systems, environmental sensors, public utilities, and citizen feedback to provide actionable insights for urban planning and management.',
                'status': 'development',
                'is_featured': True,
                'technologies': ['Python', 'Django', 'React', 'PostgreSQL', 'Redis', 'TensorFlow', 'Apache Kafka'],
                'github_url': 'https://github.com/atonixcorp/smartcity-platform',
                'website_url': 'https://demo.smartcity.atonix.com',
            },
            {
                'name': 'Healthcare Data Integration System',
                'slug': 'healthcare-data-integration',
                'overview': 'Secure platform for integrating and analyzing healthcare data across multiple provider networks.',
                'description': 'A HIPAA-compliant system that enables healthcare providers to securely share and analyze patient data across different networks. Features include real-time data synchronization, advanced analytics for population health insights, and AI-powered diagnostic assistance.',
                'status': 'completed',
                'is_featured': True,
                'technologies': ['Java', 'Spring Boot', 'React Native', 'MySQL', 'Apache Spark', 'FHIR'],
                'github_url': 'https://github.com/atonixcorp/healthcare-integration',
            },
            {
                'name': 'E-commerce Optimization Engine',
                'slug': 'ecommerce-optimization-engine',
                'overview': 'AI-powered engine that optimizes pricing, inventory, and recommendations for e-commerce platforms.',
                'description': 'An intelligent system that uses machine learning algorithms to optimize various aspects of e-commerce operations including dynamic pricing, inventory management, personalized product recommendations, and customer segmentation.',
                'status': 'development',
                'is_featured': False,
                'technologies': ['Python', 'FastAPI', 'Vue.js', 'MongoDB', 'TensorFlow', 'Apache Airflow'],
                'github_url': 'https://github.com/atonixcorp/ecommerce-optimization',
            },
        ]

        for project_data in projects_data:
            project, created = Project.objects.get_or_create(
                slug=project_data['slug'],
                defaults=project_data
            )
            if created:
                self.stdout.write(f'Created project: {project.name}')

    def create_teams(self):
        teams_data = [
            {
                'name': 'Cloud Infrastructure Team',
                'slug': 'cloud-infrastructure',
                'mission': 'Experts in cloud architecture, DevOps, and scalable infrastructure solutions.',
                'description': 'Our Cloud Infrastructure Team specializes in designing and implementing robust, scalable cloud solutions. With expertise across Google Cloud Platform, Microsoft Azure, and self-hosted solutions, we help organizations modernize their infrastructure and achieve optimal performance and cost efficiency.',
                'is_active': True,
                'color_theme': '#2196F3',
            },
            {
                'name': 'AI & Machine Learning Team',
                'slug': 'ai-machine-learning',
                'mission': 'Cutting-edge AI and ML solutions for complex business challenges.',
                'description': 'Our AI & Machine Learning Team develops sophisticated algorithms and models to solve complex business problems. From natural language processing to computer vision and predictive analytics, we leverage the latest in AI technology to drive innovation.',
                'is_active': True,
                'color_theme': '#4CAF50',
            },
            {
                'name': 'Frontend Development Team',
                'slug': 'frontend-development',
                'mission': 'Creating beautiful, responsive, and user-friendly web applications.',
                'description': 'Our Frontend Development Team crafts exceptional user experiences using modern frameworks and design principles. We specialize in React, Vue.js, and Angular development, ensuring our applications are both beautiful and performant.',
                'is_active': True,
                'color_theme': '#FF5722',
            },
        ]

        for team_data in teams_data:
            team, created = Team.objects.get_or_create(
                slug=team_data['slug'],
                defaults=team_data
            )
            if created:
                self.stdout.write(f'Created team: {team.name}')

    def create_focus_areas(self):
        # Create focus areas
        focus_areas_data = [
            {
                'name': 'Cloud Computing',
                'slug': 'cloud-computing',
                'description': 'Scalable cloud infrastructure and services for modern applications.',
                'detailed_description': 'We provide comprehensive cloud computing solutions that enable organizations to leverage the full power of cloud technologies. Our expertise spans across multiple cloud providers and includes architecture design, migration strategies, cost optimization, and ongoing management.',
                'icon': 'cloud',
                'color_theme': '#2196F3',
                'is_active': True,
                'order': 1,
            },
            {
                'name': 'Healthcare Technology',
                'slug': 'healthcare-technology',
                'description': 'Innovative solutions for healthcare data management and patient care.',
                'detailed_description': 'Our healthcare technology solutions focus on improving patient outcomes through better data management, interoperability, and AI-powered insights. We specialize in HIPAA-compliant systems, electronic health records integration, and telemedicine platforms.',
                'icon': 'medical',
                'color_theme': '#4CAF50',
                'is_active': True,
                'order': 2,
            },
        ]

        for area_data in focus_areas_data:
            focus_area, created = FocusArea.objects.get_or_create(
                slug=area_data['slug'],
                defaults=area_data
            )
            if created:
                self.stdout.write(f'Created focus area: {focus_area.name}')

        # Create technologies
        cloud_area = FocusArea.objects.get(slug='cloud-computing')
        technologies_data = [
            {'focus_area': cloud_area, 'name': 'Google Cloud Platform', 'description': 'Google Cloud services and infrastructure'},
            {'focus_area': cloud_area, 'name': 'Azure', 'description': 'Microsoft Azure cloud platform'},
            {'focus_area': cloud_area, 'name': 'Google Cloud', 'description': 'Google Cloud Platform'},
            {'focus_area': cloud_area, 'name': 'Docker', 'description': 'Containerization platform'},
            {'focus_area': cloud_area, 'name': 'Kubernetes', 'description': 'Container orchestration'},
        ]

        healthcare_area = FocusArea.objects.get(slug='healthcare-technology')
        healthcare_techs = [
            {'focus_area': healthcare_area, 'name': 'FHIR', 'description': 'Fast Healthcare Interoperability Resources'},
            {'focus_area': healthcare_area, 'name': 'HL7', 'description': 'Health Level Seven International'},
            {'focus_area': healthcare_area, 'name': 'DICOM', 'description': 'Digital Imaging and Communications in Medicine'},
        ]
        technologies_data.extend(healthcare_techs)

        for tech_data in technologies_data:
            technology, created = FocusAreaTechnology.objects.get_or_create(
                name=tech_data['name'],
                focus_area=tech_data['focus_area'],
                defaults=tech_data
            )
            if created:
                self.stdout.write(f'Created technology: {technology.name}')

        # Create solutions
        cloud_area = FocusArea.objects.get(slug='cloud-computing')
        solutions_data = [
            {
                'focus_area': cloud_area,
                'title': 'Cloud Infrastructure Design',
                'description': 'Design and implement scalable cloud infrastructure solutions for enterprise applications.',
                'benefits': ['Scalable architecture', 'Enhanced security', 'Cost optimization', '99.9% uptime guarantee'],
                'use_cases': ['Enterprise hosting', 'E-commerce platforms', 'Data analytics', 'Development environments'],
                'order': 1,
            },
            {
                'focus_area': cloud_area,
                'title': 'Multi-Cloud Strategy',
                'description': 'Develop strategies for multi-cloud deployments and vendor management.',
                'benefits': ['Reduced vendor lock-in', 'Optimized costs', 'Enhanced reliability', 'Best-of-breed services'],
                'use_cases': ['Global deployments', 'Compliance requirements', 'Cost optimization', 'Risk mitigation'],
                'order': 2,
            },
        ]

        for solution_data in solutions_data:
            solution, created = FocusAreaSolution.objects.get_or_create(
                title=solution_data['title'],
                focus_area=solution_data['focus_area'],
                defaults=solution_data
            )
            if created:
                self.stdout.write(f'Created solution: {solution.title}')

    def create_resources(self):
        # Create resource categories
        categories_data = [
            {'name': 'Documentation', 'slug': 'documentation', 'description': 'Technical documentation and guides'},
            {'name': 'Tools', 'slug': 'tools', 'description': 'Development tools and utilities'},
            {'name': 'Tutorials', 'slug': 'tutorials', 'description': 'Step-by-step learning materials'},
        ]

        for cat_data in categories_data:
            category, created = ResourceCategory.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(f'Created resource category: {category.name}')

        # Create resources
        doc_category = ResourceCategory.objects.get(slug='documentation')
        tools_category = ResourceCategory.objects.get(slug='tools')

        resources_data = [
            {
                'title': 'Cloud Architecture Best Practices',
                'slug': 'cloud-architecture-best-practices',
                'description': 'Comprehensive guide to designing scalable cloud architectures.',
                'content': 'This guide covers essential principles for building robust cloud architectures...',
                'category': doc_category,
                'resource_type': 'guideline',
                'is_featured': True,
                'external_url': 'https://docs.atonix.com/cloud-architecture',
            },
            {
                'title': 'Infrastructure Monitoring Tool',
                'slug': 'infrastructure-monitoring-tool',
                'description': 'Open-source tool for monitoring cloud infrastructure.',
                'content': 'Our monitoring tool provides real-time insights into your infrastructure...',
                'category': tools_category,
                'resource_type': 'tool',
                'is_featured': True,
                'external_url': 'https://github.com/atonixcorp/infrastructure-monitor',
            },
        ]

        for resource_data in resources_data:
            resource, created = Resource.objects.get_or_create(
                slug=resource_data['slug'],
                defaults=resource_data
            )
            if created:
                self.stdout.write(f'Created resource: {resource.title}')

    def create_contact(self):
        # Create office locations
        locations_data = [
            {
                'name': 'Headquarters',
                'address_line_1': '123 Tech Street',
                'city': 'San Francisco',
                'state': 'CA',
                'postal_code': '94105',
                'country': 'USA',
                'phone': '+1 (555) 123-4567',
                'email': 'hq@atonix.com',
                'is_headquarters': True,
                'latitude': 37.7749,
                'longitude': -122.4194,
            },
            {
                'name': 'East Coast Office',
                'address_line_1': '456 Innovation Ave',
                'city': 'New York',
                'state': 'NY',
                'postal_code': '10001',
                'country': 'USA',
                'phone': '+1 (555) 987-6543',
                'email': 'ny@atonix.com',
                'is_headquarters': False,
                'latitude': 40.7128,
                'longitude': -74.0060,
            },
        ]

        for location_data in locations_data:
            location, created = OfficeLocation.objects.get_or_create(
                name=location_data['name'],
                defaults=location_data
            )
            if created:
                self.stdout.write(f'Created office location: {location.name}')

        # Create contact persons
        contacts_data = [
            {
                'name': 'John Smith',
                'title': 'Chief Technology Officer',
                'email': 'john.smith@atonix.com',
                'phone': '+1 (555) 123-4567',
                'department': 'Technology',
                'is_primary': True,
                'linkedin_url': 'https://linkedin.com/in/johnsmith',
            },
            {
                'name': 'Sarah Johnson',
                'title': 'VP of Engineering',
                'email': 'sarah.johnson@atonix.com',
                'phone': '+1 (555) 234-5678',
                'department': 'Engineering',
                'is_primary': False,
                'linkedin_url': 'https://linkedin.com/in/sarahjohnson',
            },
        ]

        for contact_data in contacts_data:
            contact, created = ContactPerson.objects.get_or_create(
                email=contact_data['email'],
                defaults=contact_data
            )
            if created:
                self.stdout.write(f'Created contact person: {contact.name}')