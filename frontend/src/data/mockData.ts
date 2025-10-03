// Mock data for projects and teams

import { Project, Team, Technology, FocusArea } from '../types/api';

// Mock Technologies
export const mockTechnologies: Technology[] = [
  { id: 1, name: 'React', description: 'Frontend framework' },
  { id: 2, name: 'Django', description: 'Backend framework' },
  { id: 3, name: 'TypeScript', description: 'Programming language' },
  { id: 4, name: 'Python', description: 'Programming language' },
  { id: 5, name: 'PostgreSQL', description: 'Database' },
  { id: 6, name: 'Docker', description: 'Containerization' },
  { id: 7, name: 'Kubernetes', description: 'Container orchestration' },
  { id: 8, name: 'Nginx', description: 'Web server' },
  { id: 9, name: 'Redis', description: 'In-memory database' },
  { id: 10, name: 'AI/ML', description: 'Artificial Intelligence & Machine Learning' },
  { id: 11, name: 'TensorFlow', description: 'Machine learning framework' },
  { id: 12, name: 'PyTorch', description: 'Machine learning framework' },
  { id: 13, name: 'Go', description: 'Programming language' },
  { id: 14, name: 'Rust', description: 'Systems programming language' },
  { id: 15, name: 'Blockchain', description: 'Distributed ledger technology' },
];

// Mock Focus Areas
export const mockFocusAreas: FocusArea[] = [
  {
    id: 1,
    name: 'Infrastructure & DevOps',
    slug: 'infrastructure',
    description: 'Core platform infrastructure and DevOps solutions for scalable, reliable systems',
    detailed_description: 'Building robust, scalable infrastructure solutions that power enterprise applications. Our expertise spans cloud architecture, container orchestration, CI/CD pipelines, and infrastructure automation. We focus on creating resilient systems that can handle massive scale while maintaining security and performance.',
    icon: 'cloud',
      website_url: 'https://platform.atonixcorp.org',
    color_theme: '#1976d2',
      documentation_url: 'https://docs.atonixcorp.org/platform',
    order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    technologies: [
      {
        id: 1,
        name: 'Docker',
        description: 'Containerization platform for application deployment',
        icon: 'docker',
        website_url: 'https://docker.com'
      },
      {
        id: 2,
        name: 'Kubernetes',
        description: 'Container orchestration and management',
        icon: 'kubernetes',
        website_url: 'https://kubernetes.io'
      },
      {
        id: 3,
        name: 'Terraform',
        description: 'Infrastructure as Code tool',
        icon: 'terraform',
        website_url: 'https://terraform.io'
      },
      documentation_url: 'https://docs.atonixcorp.org/tmsvic-discovery',
        id: 4,
        name: 'AWS/Azure/GCP',
        description: 'Cloud platform services',
        icon: 'cloud',
        website_url: 'https://aws.amazon.com'
      }
    ],
    solutions: [
      {
        id: 1,
        title: 'Cloud-Native Architecture',
        description: 'Design and implement cloud-native applications with microservices architecture, ensuring scalability and resilience.',
        benefits: ['99.9% uptime SLA', 'Auto-scaling capabilities', 'Cost optimization', 'Global distribution'],
        use_cases: ['E-commerce platforms', 'SaaS applications', 'Enterprise systems', 'IoT backends'],
        order: 1
      },
      {
        id: 2,
        title: 'CI/CD Pipeline Automation',
        description: 'Streamline development workflows with automated testing, building, and deployment processes.',
        benefits: ['Faster deployments', 'Reduced errors', 'Consistent environments', 'Better collaboration'],
        use_cases: ['Software development teams', 'DevOps transformation', 'Quality assurance', 'Release management'],
        order: 2
      },
      {
      documentation_url: 'https://docs.atonixcorp.org/osrovnet',
        title: 'Infrastructure Monitoring',
        description: 'Comprehensive monitoring and alerting systems for proactive infrastructure management.',
        benefits: ['Real-time insights', 'Predictive analytics', 'Automated remediation', 'Performance optimization'],
        use_cases: ['Production systems', 'Performance tuning', 'Capacity planning', 'Incident response'],
        order: 3
      }
    ]
  },
  {
    id: 2,
    name: 'Medical Research & AI',
    slug: 'medical-research',
    description: 'AI-powered medical research and healthcare technology solutions',
    detailed_description: 'Leveraging artificial intelligence and machine learning to advance medical research and improve healthcare outcomes. Our solutions include drug discovery platforms, medical imaging analysis, patient data analytics, and clinical decision support systems.',
    icon: 'medical',
    image: '/images/focus-areas/medical-research.jpg',
    color_theme: '#4caf50',
    is_active: true,
    order: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    technologies: [
      {
        id: 5,
        name: 'TensorFlow',
        description: 'Machine learning framework for AI models',
        icon: 'tensorflow',
        website_url: 'https://tensorflow.org'
      },
      {
        id: 6,
        name: 'PyTorch',
        description: 'Deep learning research platform',
        icon: 'pytorch',
        website_url: 'https://pytorch.org'
      },
      {
        id: 7,
        name: 'OpenCV',
        description: 'Computer vision and image processing',
        icon: 'opencv',
        website_url: 'https://opencv.org'
      },
      {
        id: 8,
        name: 'DICOM',
        description: 'Medical imaging standards and protocols',
        icon: 'medical',
        website_url: 'https://dicom.nema.org'
      }
    ],
    solutions: [
      {
        id: 4,
        title: 'Drug Discovery Platform',
        description: 'AI-powered platform for identifying and analyzing potential drug compounds using machine learning algorithms.',
        benefits: ['Accelerated research', 'Cost reduction', 'Higher success rates', 'Predictive modeling'],
        use_cases: ['Pharmaceutical companies', 'Research institutions', 'Biotech startups', 'Academic research'],
        order: 1
      },
      {
        id: 5,
        title: 'Medical Image Analysis',
        description: 'Advanced computer vision systems for analyzing medical images and assisting in diagnosis.',
        benefits: ['Improved accuracy', 'Faster diagnosis', 'Early detection', 'Reduced human error'],
        use_cases: ['Radiology departments', 'Pathology labs', 'Screening programs', 'Telemedicine'],
        order: 2
      },
      {
        id: 6,
        title: 'Clinical Decision Support',
        description: 'AI-driven systems that provide evidence-based recommendations to healthcare professionals.',
        benefits: ['Better outcomes', 'Standardized care', 'Risk reduction', 'Knowledge sharing'],
        use_cases: ['Hospitals', 'Clinics', 'Emergency departments', 'Specialized care'],
        order: 3
      }
    ]
  },
  {
    id: 3,
    name: 'Cybersecurity & Network Protection',
    slug: 'security',
    description: 'Advanced cybersecurity solutions and network protection systems',
    detailed_description: 'Comprehensive cybersecurity solutions designed to protect organizations from evolving threats. Our expertise includes network security, threat detection, incident response, and security automation. We build systems that can identify, analyze, and respond to security threats in real-time.',
    icon: 'security',
    image: '/images/focus-areas/security.jpg',
    color_theme: '#f44336',
    is_active: true,
    order: 3,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    technologies: [
      {
        id: 9,
        name: 'Elasticsearch',
        description: 'Search and analytics engine for security logs',
        icon: 'elasticsearch',
        website_url: 'https://elastic.co'
      },
      {
        id: 10,
        name: 'Wireshark',
        description: 'Network protocol analyzer',
        icon: 'network',
        website_url: 'https://wireshark.org'
      },
      {
        id: 11,
        name: 'OWASP',
        description: 'Web application security standards',
        icon: 'security',
        website_url: 'https://owasp.org'
      },
      {
        id: 12,
        name: 'Metasploit',
        description: 'Penetration testing framework',
        icon: 'security',
        website_url: 'https://metasploit.com'
      }
    ],
    solutions: [
      {
        id: 7,
        title: 'Threat Detection & Response',
        description: 'Real-time threat detection system with automated response capabilities for network security.',
        benefits: ['24/7 monitoring', 'Automated response', 'Threat intelligence', 'Compliance reporting'],
        use_cases: ['Enterprise networks', 'Financial institutions', 'Government agencies', 'Healthcare systems'],
        order: 1
      },
      {
        id: 8,
        title: 'Security Analytics Platform',
        description: 'Advanced analytics platform for security data analysis and threat hunting.',
        benefits: ['Behavioral analysis', 'Anomaly detection', 'Forensic capabilities', 'Risk assessment'],
        use_cases: ['SOC teams', 'Incident response', 'Compliance audits', 'Risk management'],
        order: 2
      },
      {
        id: 9,
        title: 'Penetration Testing Suite',
        description: 'Comprehensive penetration testing tools and methodologies for security assessment.',
        benefits: ['Vulnerability identification', 'Risk prioritization', 'Compliance validation', 'Security posture'],
        use_cases: ['Security assessments', 'Compliance testing', 'Red team exercises', 'Security audits'],
        order: 3
      }
    ]
  },
  {
    id: 4,
    name: 'Smart Agriculture & IoT',
    slug: 'agriculture',
    description: 'Smart farming solutions and agricultural technology innovation',
    detailed_description: 'Revolutionizing agriculture through IoT, AI, and data analytics. Our solutions help farmers optimize crop yields, monitor environmental conditions, manage resources efficiently, and make data-driven decisions for sustainable farming practices.',
    icon: 'agriculture',
    image: '/images/focus-areas/agriculture.jpg',
    color_theme: '#8bc34a',
    is_active: true,
    order: 4,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    technologies: [
      {
        id: 13,
        name: 'IoT Sensors',
        description: 'Environmental monitoring and data collection',
        icon: 'sensor',
        website_url: 'https://iot.com'
      },
      {
        id: 14,
        name: 'LoRaWAN',
        description: 'Long-range wireless communication protocol',
        icon: 'wireless',
        website_url: 'https://lora-alliance.org'
      },
      {
        id: 15,
        name: 'MQTT',
        description: 'Lightweight messaging protocol for IoT',
        icon: 'messaging',
        website_url: 'https://mqtt.org'
      },
      {
        id: 16,
        name: 'Machine Learning',
        description: 'Predictive analytics for crop management',
        icon: 'ai',
        website_url: 'https://ml.com'
      }
    ],
    solutions: [
      {
        id: 10,
        title: 'Precision Farming Platform',
        description: 'IoT-enabled platform for precision agriculture with real-time monitoring and automated control systems.',
        benefits: ['Increased yields', 'Resource optimization', 'Cost reduction', 'Environmental sustainability'],
        use_cases: ['Large farms', 'Greenhouse operations', 'Livestock management', 'Crop monitoring'],
        order: 1
      },
      {
        id: 11,
        title: 'Crop Health Monitoring',
        description: 'AI-powered system for monitoring crop health using satellite imagery and ground sensors.',
        benefits: ['Early disease detection', 'Optimal irrigation', 'Pest management', 'Yield prediction'],
        use_cases: ['Field crops', 'Orchard management', 'Vineyard monitoring', 'Research farms'],
        order: 2
      },
      {
        id: 12,
        title: 'Supply Chain Optimization',
        description: 'End-to-end supply chain management system for agricultural products.',
        benefits: ['Traceability', 'Quality assurance', 'Reduced waste', 'Market insights'],
        use_cases: ['Food distributors', 'Retail chains', 'Export companies', 'Cooperatives'],
        order: 3
      }
    ]
  },
  {
    id: 5,
    name: 'Fintech & Blockchain',
    slug: 'fintech',
    description: 'Financial technology and blockchain-based solutions',
    detailed_description: 'Building the future of finance with innovative blockchain technology, digital payments, and financial services platforms. Our solutions include cryptocurrency systems, smart contracts, DeFi protocols, and secure financial transaction platforms.',
    icon: 'finance',
    image: '/images/focus-areas/fintech.jpg',
    color_theme: '#ff9800',
    is_active: true,
    order: 5,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    technologies: [
      {
        id: 17,
        name: 'Ethereum',
        description: 'Blockchain platform for smart contracts',
        icon: 'ethereum',
        website_url: 'https://ethereum.org'
      },
      {
        id: 18,
        name: 'Solidity',
        description: 'Smart contract programming language',
        icon: 'code',
        website_url: 'https://soliditylang.org'
      },
      {
        id: 19,
        name: 'Web3.js',
        description: 'JavaScript library for blockchain interaction',
        icon: 'javascript',
        website_url: 'https://web3js.org'
      },
      {
        id: 20,
        name: 'Hyperledger',
        description: 'Enterprise blockchain framework',
        icon: 'blockchain',
        website_url: 'https://hyperledger.org'
      }
    ],
    solutions: [
      {
        id: 13,
        title: 'Digital Payment Platform',
        description: 'Secure, scalable digital payment system with multi-currency support and real-time processing.',
        benefits: ['Instant transactions', 'Low fees', 'Global reach', 'High security'],
        use_cases: ['E-commerce', 'Remittances', 'Micropayments', 'B2B transactions'],
        order: 1
      },
      {
        id: 14,
        title: 'Smart Contract Solutions',
        description: 'Automated contract execution and management system using blockchain technology.',
        benefits: ['Transparency', 'Reduced costs', 'Automation', 'Trust without intermediaries'],
        use_cases: ['Insurance claims', 'Supply chain', 'Real estate', 'Intellectual property'],
        order: 2
      },
      {
        id: 15,
        title: 'DeFi Protocol Development',
        description: 'Decentralized finance protocols for lending, borrowing, and yield farming.',
        benefits: ['Decentralization', 'Programmable money', 'Yield generation', 'Financial inclusion'],
        use_cases: ['Lending platforms', 'DEX protocols', 'Yield farming', 'Synthetic assets'],
        order: 3
      }
    ]
  },
  {
    id: 6,
    name: 'Big Data & Analytics',
    slug: 'big-data',
    description: 'Advanced data analytics and business intelligence solutions',
    detailed_description: 'Transforming raw data into actionable insights through advanced analytics, machine learning, and business intelligence platforms. We help organizations harness the power of their data to make informed decisions and drive growth.',
    icon: 'analytics',
    image: '/images/focus-areas/big-data.jpg',
    color_theme: '#9c27b0',
    is_active: true,
    order: 6,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    technologies: [
      {
        id: 21,
        name: 'Apache Spark',
        description: 'Unified analytics engine for big data processing',
        icon: 'spark',
        website_url: 'https://spark.apache.org'
      },
      {
        id: 22,
        name: 'Hadoop',
        description: 'Distributed storage and processing framework',
        icon: 'hadoop',
        website_url: 'https://hadoop.apache.org'
      },
      {
        id: 23,
        name: 'Apache Kafka',
        description: 'Distributed streaming platform',
        icon: 'kafka',
        website_url: 'https://kafka.apache.org'
      },
      {
        id: 24,
        name: 'Tableau',
        description: 'Data visualization and business intelligence',
        icon: 'tableau',
        website_url: 'https://tableau.com'
      }
    ],
    solutions: [
      {
        id: 16,
        title: 'Real-time Analytics Platform',
        description: 'Stream processing platform for real-time data analytics and decision making.',
        benefits: ['Real-time insights', 'Scalable processing', 'Low latency', 'Event-driven architecture'],
        use_cases: ['Financial trading', 'IoT monitoring', 'Fraud detection', 'Operational analytics'],
        order: 1
      },
      {
        id: 17,
        title: 'Business Intelligence Suite',
        description: 'Comprehensive BI platform with data warehousing, reporting, and visualization capabilities.',
        benefits: ['Data-driven decisions', 'Interactive dashboards', 'Self-service analytics', 'Performance monitoring'],
        use_cases: ['Executive reporting', 'KPI tracking', 'Market analysis', 'Operational metrics'],
        order: 2
      },
      {
        id: 18,
        title: 'Predictive Analytics Engine',
        description: 'Machine learning-powered platform for predictive modeling and forecasting.',
        benefits: ['Future insights', 'Risk assessment', 'Optimization', 'Automated recommendations'],
        use_cases: ['Demand forecasting', 'Risk modeling', 'Customer analytics', 'Maintenance prediction'],
        order: 3
      }
    ]
  }
];

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 1,
    name: 'AtonixCorp Platform',
    slug: 'atonixcorp-platform',
    overview: 'The backbone of AtonixCorp\'s infrastructure strategy.',
    description: 'This modular stack powers scalable services, persistent data layers, and distributed orchestration across domains like medicine, agriculture, security, and advanced analytics. It\'s not just a system—it\'s the foundation of our technical sovereignty.',
    image: '/images/projects/atonixcorp-platform.jpg',
    technologies: [
      { id: 1, name: 'React' },
      { id: 2, name: 'Django' },
      { id: 3, name: 'TypeScript' },
      { id: 4, name: 'Python' },
      { id: 5, name: 'PostgreSQL' },
      { id: 6, name: 'Docker' },
      { id: 7, name: 'Kubernetes' },
      { id: 8, name: 'Nginx' },
      { id: 9, name: 'Redis' }
    ],
    status: 'active',
  website_url: 'https://platform.atonixcorp.org',
  github_url: 'https://github.com/AtonixCorp/atonixcorp-platform',
  documentation_url: 'https://docs.atonixcorp.org/platform',
    is_featured: true,
    focus_areas: [mockFocusAreas[0]],
    start_date: '2024-01-01',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2025-09-20T00:00:00Z',
    features: [],
    images: []
  },
  {
    id: 2,
    name: 'TMSVIC Discovery',
    slug: 'tmsvic-discovery',
    overview: 'AI-powered medical research platform for drug discovery.',
    description: 'TMSVIC Discovery leverages machine learning and natural language processing to accelerate pharmaceutical research, analyzing vast datasets to identify promising drug compounds and predict their efficacy.',
    image: '/images/projects/tmsvic-discovery.jpg',
    technologies: [
      { id: 4, name: 'Python' },
      { id: 10, name: 'AI/ML' },
      { id: 11, name: 'TensorFlow' },
      { id: 12, name: 'PyTorch' },
      { id: 5, name: 'PostgreSQL' },
      { id: 6, name: 'Docker' }
    ],
    status: 'active',
    github_url: 'https://github.com/AtonixCorp/tmsvic-discovery',
  documentation_url: 'https://docs.atonixcorp.org/tmsvic-discovery',
    is_featured: true,
    focus_areas: [mockFocusAreas[1]],
    start_date: '2024-02-01',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2025-09-20T00:00:00Z',
    features: [],
    images: []
  },
  {
    id: 3,
    name: 'OSRovNet',
    slug: 'osrovnet',
    overview: 'Open-source network security and threat analysis platform.',
    description: 'OSRovNet provides comprehensive network monitoring, threat detection, and security analytics for enterprise environments. Built with scalability and real-time analysis in mind.',
    image: '/images/projects/osrovnet.jpg',
    technologies: [
      { id: 4, name: 'Python' },
      { id: 13, name: 'Go' },
      { id: 14, name: 'Rust' },
      { id: 5, name: 'PostgreSQL' },
      { id: 6, name: 'Docker' },
      { id: 7, name: 'Kubernetes' }
    ],
    status: 'active',
    github_url: 'https://github.com/AtonixCorp/osrovnet',
  documentation_url: 'https://docs.atonixcorp.org/osrovnet',
    is_featured: true,
    focus_areas: [mockFocusAreas[2]],
    start_date: '2024-03-01',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2025-09-20T00:00:00Z',
    features: [],
    images: []
  },
  {
    id: 4,
    name: 'AgroTech Suite',
    slug: 'agrotech-suite',
    overview: 'Smart farming and agricultural management platform.',
    description: 'Comprehensive IoT-enabled agricultural management system that helps farmers optimize crop yields, monitor soil conditions, and manage resources efficiently using data-driven insights.',
    image: '/images/projects/agrotech-suite.jpg',
    technologies: [
      { id: 4, name: 'Python' },
      { id: 1, name: 'React' },
      { id: 10, name: 'AI/ML' },
      { id: 6, name: 'Docker' }
    ],
    status: 'development',
  github_url: 'https://github.com/AtonixCorp/agrotech-suite',
    is_featured: false,
    focus_areas: [mockFocusAreas[3]],
    start_date: '2024-04-01',
    created_at: '2024-04-01T00:00:00Z',
    updated_at: '2025-09-20T00:00:00Z',
    features: [],
    images: []
  },
  {
    id: 5,
    name: 'FinSecure Blockchain',
    slug: 'finsecure-blockchain',
    overview: 'Secure blockchain-based financial transaction platform.',
    description: 'Next-generation financial infrastructure built on blockchain technology, providing secure, transparent, and efficient financial transactions with smart contract capabilities.',
    image: '/images/projects/finsecure-blockchain.jpg',
    technologies: [
      { id: 15, name: 'Blockchain' },
      { id: 13, name: 'Go' },
      { id: 14, name: 'Rust' },
      { id: 1, name: 'React' },
      { id: 3, name: 'TypeScript' }
    ],
    status: 'development',
  github_url: 'https://github.com/AtonixCorp/finsecure-blockchain',
    is_featured: false,
    focus_areas: [mockFocusAreas[4]],
    start_date: '2024-05-01',
    created_at: '2024-05-01T00:00:00Z',
    updated_at: '2025-09-20T00:00:00Z',
    features: [],
    images: []
  }
];

// Mock Teams
export const mockTeams: Team[] = [
  {
    id: 1,
    name: 'Pioneers',
    slug: 'pioneers',
    mission: 'Leading innovation in core infrastructure and platform development',
    description: 'The Pioneers team is responsible for building and maintaining the core infrastructure that powers all AtonixCorp projects. We focus on scalability, reliability, and cutting-edge technology solutions.',
    image: '/images/teams/pioneers.jpg',
    color_theme: '#1976d2',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2025-09-20T00:00:00Z',
    members: [
      {
        id: 1,
        name: 'Sarah Chen',
        role: 'Lead Platform Engineer',
        bio: 'Full-stack developer with 8+ years of experience in distributed systems and cloud architecture.',
        avatar: '/images/avatars/sarah-chen.jpg',
        email: 'sarah.chen@atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/sarahchen',
        github_url: 'https://github.com/sarahchen',
        is_lead: true,
        join_date: '2023-01-01',
        order: 1
      },
      {
        id: 2,
        name: 'Marcus Rodriguez',
        role: 'Senior DevOps Engineer',
        bio: 'DevOps specialist focused on container orchestration and CI/CD automation.',
        avatar: '/images/avatars/marcus-rodriguez.jpg',
        email: 'marcus.rodriguez@atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/marcusrodriguez',
        github_url: 'https://github.com/marcusrodriguez',
        is_lead: false,
        join_date: '2023-02-15',
        order: 2
      },
      {
        id: 3,
        name: 'Emily Watson',
        role: 'Frontend Architect',
        bio: 'React and TypeScript expert passionate about user experience and modern web technologies.',
        avatar: '/images/avatars/emily-watson.jpg',
        email: 'emily.watson@atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/emilywatson',
        github_url: 'https://github.com/emilywatson',
        is_lead: false,
        join_date: '2023-03-01',
        order: 3
      },
      {
        id: 4,
        name: 'David Kim',
        role: 'Backend Engineer',
        bio: 'Python and Django specialist with expertise in API design and database optimization.',
        avatar: '/images/avatars/david-kim.jpg',
        email: 'david.kim@atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/davidkim',
        github_url: 'https://github.com/davidkim',
        is_lead: false,
        join_date: '2023-04-10',
        order: 4
      }
    ],
    skills: [
      {
        id: 1,
        name: 'React/TypeScript',
        description: 'Modern frontend development',
        proficiency_level: 'expert'
      },
      {
        id: 2,
        name: 'Python/Django',
        description: 'Backend API development',
        proficiency_level: 'expert'
      },
      {
        id: 3,
        name: 'Docker/Kubernetes',
        description: 'Container orchestration',
        proficiency_level: 'expert'
      },
      {
        id: 4,
        name: 'PostgreSQL',
        description: 'Database design and optimization',
        proficiency_level: 'advanced'
      }
    ]
  },
  {
    id: 2,
    name: 'Unity Developers',
    slug: 'unity-developers',
    mission: 'Creating immersive experiences and game development solutions',
    description: 'The Unity Developers team specializes in game development, AR/VR applications, and interactive simulations. We bring creativity and technical excellence to digital experiences.',
    image: '/images/teams/unity-developers.jpg',
    color_theme: '#9c27b0',
    is_active: true,
    created_at: '2023-02-01T00:00:00Z',
    updated_at: '2025-09-20T00:00:00Z',
    members: [
      {
        id: 5,
        name: 'Alex Thompson',
        role: 'Lead Game Developer',
        bio: 'Unity expert with 10+ years in game development and AR/VR applications.',
        avatar: '/images/avatars/alex-thompson.jpg',
        email: 'alex.thompson@atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/alexthompson',
        github_url: 'https://github.com/alexthompson',
        is_lead: true,
        join_date: '2023-02-01',
        order: 1
      },
      {
        id: 6,
        name: 'Maya Patel',
        role: 'AR/VR Developer',
        bio: 'Specializing in augmented and virtual reality experiences with Unity and Unreal Engine.',
        avatar: '/images/avatars/maya-patel.jpg',
        email: 'maya.patel@atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/mayapatel',
        github_url: 'https://github.com/mayapatel',
        is_lead: false,
        join_date: '2023-03-15',
        order: 2
      },
      {
        id: 7,
        name: 'Jake Morrison',
        role: '3D Artist & Developer',
        bio: 'Creative technologist combining artistic vision with technical implementation.',
        avatar: '/images/avatars/jake-morrison.jpg',
        email: 'jake.morrison@atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/jakemorrison',
        github_url: 'https://github.com/jakemorrison',
        is_lead: false,
        join_date: '2023-04-01',
        order: 3
      }
    ],
    skills: [
      {
        id: 5,
        name: 'Unity 3D',
        description: 'Game engine development',
        proficiency_level: 'expert'
      },
      {
        id: 6,
        name: 'C# Programming',
        description: 'Game logic and scripting',
        proficiency_level: 'expert'
      },
      {
        id: 7,
        name: 'AR/VR Development',
        description: 'Immersive experience creation',
        proficiency_level: 'advanced'
      },
      {
        id: 8,
        name: '3D Modeling',
        description: 'Asset creation and optimization',
        proficiency_level: 'advanced'
      }
    ]
  }
];

// Export mock services
export const mockProjectService = {
  getProjects: async (): Promise<Project[]> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return mockProjects;
  },
  getFeaturedProjects: async (): Promise<Project[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProjects.filter(project => project.is_featured);
  },
  getProjectBySlug: async (slug: string): Promise<Project | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProjects.find(project => project.slug === slug) || null;
  }
};

export const mockTeamService = {
  getTeams: async (): Promise<Team[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockTeams;
  },
  getTeamBySlug: async (slug: string): Promise<Team | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockTeams.find(team => team.slug === slug) || null;
  }
};

export const mockTechnologyService = {
  getTechnologies: async (): Promise<Technology[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockTechnologies;
  }
};

export const mockFocusAreaService = {
  getFocusAreas: async (): Promise<FocusArea[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockFocusAreas;
  }
};