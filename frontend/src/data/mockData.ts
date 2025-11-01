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
    color_theme: '#1976d2',
    is_active: true,
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
      {
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
        id: 3,
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
    name: 'Atonixcorp-Platform',
    slug: 'atonixcorp-platform',
    overview: 'The backbone of AtonixCorp\'s infrastructure strategy.',
    description: 'This modular stack powers scalable services, persistent data layers, and distributed orchestration across domains like medicine, agriculture, security, and advanced analytics. It\'s not just a system—it\'s the foundation of our technical sovereignty.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
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
    updated_at: '2025-10-31T00:00:00Z',
    features: [],
    images: []
  },
  {
    id: 2,
    name: 'Planivar',
    slug: 'planivar',
    overview: 'A comprehensive space research platform pioneering sovereign space technologies.',
    description: 'Planivar is AtonixCorp\'s flagship platform for advanced space research, pioneering sovereign space technologies that advance human understanding, interstellar exploration, and real-time scientific communication.',
    image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80',
    technologies: [
      { id: 4, name: 'Python' },
      { id: 10, name: 'AI/ML' },
      { id: 11, name: 'TensorFlow' },
      { id: 12, name: 'PyTorch' },
      { id: 13, name: 'Go' },
      { id: 6, name: 'Docker' },
      { id: 7, name: 'Kubernetes' }
    ],
    status: 'active',
    github_url: 'https://github.com/AtonixCorp/planivar',
    documentation_url: 'https://docs.atonixcorp.org/planivar',
    is_featured: true,
    focus_areas: [mockFocusAreas[5]], // Big Data & Analytics
    start_date: '2024-02-01',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2025-10-31T00:00:00Z',
    features: [],
    images: []
  },
  {
    id: 3,
    name: 'Voltoraiq',
    slug: 'voltoraiq',
    overview: 'A comprehensive full-stack web application for monitoring and managing solar energy systems.',
    description: 'Voltoraiq is a comprehensive full-stack web application for monitoring and managing solar energy systems with IoT integration. This system provides real-time monitoring, remote control capabilities, and advanced analytics for solar panels, battery banks, and IoT devices.',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    technologies: [
      { id: 1, name: 'React' },
      { id: 3, name: 'TypeScript' },
      { id: 4, name: 'Python' },
      { id: 2, name: 'Django' },
      { id: 5, name: 'PostgreSQL' },
      { id: 6, name: 'Docker' },
      { id: 10, name: 'AI/ML' }
    ],
    status: 'active',
    github_url: 'https://github.com/AtonixCorp/voltoraiq',
    documentation_url: 'https://docs.atonixcorp.org/voltoraiq',
    is_featured: true,
    focus_areas: [mockFocusAreas[3]], // Smart Agriculture & IoT
    start_date: '2024-03-01',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2025-10-31T00:00:00Z',
    features: [],
    images: []
  },
  {
    id: 4,
    name: 'Osrovnet',
    slug: 'osrovnet',
    overview: 'Osrovnet is AtonixCorp\'s flagship platform for advanced network security, threat intelligence, and resilient infrastructure design.',
    description: 'Osrovnet is AtonixCorp\'s flagship platform for advanced network security, threat intelligence, and resilient infrastructure design. Built for sovereign systems and mission-critical environments, Osrovnet empowers organizations to defend from protocol to perimeter with precision, insight, and autonomy.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    technologies: [
      { id: 4, name: 'Python' },
      { id: 13, name: 'Go' },
      { id: 14, name: 'Rust' },
      { id: 5, name: 'PostgreSQL' },
      { id: 6, name: 'Docker' },
      { id: 7, name: 'Kubernetes' },
      { id: 10, name: 'AI/ML' }
    ],
    status: 'active',
    github_url: 'https://github.com/AtonixCorp/osrovnet',
    documentation_url: 'https://docs.atonixcorp.org/osrovnet',
    is_featured: true,
    focus_areas: [mockFocusAreas[2]], // Cybersecurity & Network Protection
    start_date: '2024-04-01',
    created_at: '2024-04-01T00:00:00Z',
    updated_at: '2025-10-31T00:00:00Z',
    features: [],
    images: []
  },
  {
    id: 5,
    name: 'TujengePay',
    slug: 'tujengepay',
    overview: 'A comprehensive, modern financial platform built with cutting-edge technologies.',
    description: 'TujengePay is a comprehensive, modern financial platform built with cutting-edge technologies. It provides a seamless experience for digital transactions, currency exchange, and wallet management across web and mobile platforms.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    technologies: [
      { id: 1, name: 'React' },
      { id: 3, name: 'TypeScript' },
      { id: 4, name: 'Python' },
      { id: 2, name: 'Django' },
      { id: 15, name: 'Blockchain' },
      { id: 5, name: 'PostgreSQL' },
      { id: 6, name: 'Docker' },
      { id: 7, name: 'Kubernetes' }
    ],
    status: 'active',
    github_url: 'https://github.com/AtonixCorp/tujengepay',
    documentation_url: 'https://docs.atonixcorp.org/tujengepay',
    is_featured: true,
    focus_areas: [mockFocusAreas[4]], // Fintech & Blockchain
    start_date: '2024-05-01',
    created_at: '2024-05-01T00:00:00Z',
    updated_at: '2025-10-31T00:00:00Z',
    features: [],
    images: []
  }
];

// Mock Teams
export const mockTeams: Team[] = [
  {
    id: 1,
    name: 'Planivarum',
    slug: 'planivarum',
    mission: 'Advancing humanity through space research and open science',
    description: 'Planivarum pioneers sovereign space technologies, conducting advanced astrophysical research and enabling real-time scientific communication bridging Earth and the cosmos. We explore the mysteries of the universe while maintaining complete data sovereignty.',
    image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80',
    color_theme: '#0f172a',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2025-10-31T00:00:00Z',
    members: [
      {
        id: 1,
        name: 'Dr. Elena Vasquez',
        role: 'Chief Astrophysicist',
        bio: 'Leading researcher in quantum astrophysics and space-based observation systems.',
        avatar: '/images/avatars/elena-vasquez.jpg',
        email: 'elena.vasquez@planivarum.atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/elenavasquez',
        github_url: 'https://github.com/elenavasquez',
        is_lead: true,
        join_date: '2024-01-01',
        order: 1
      },
      {
        id: 2,
        name: 'Marcus Hale',
        role: 'Space Systems Engineer',
        bio: 'Specialist in satellite communication systems and orbital mechanics.',
        avatar: '/images/avatars/marcus-hale.jpg',
        email: 'marcus.hale@planivarum.atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/marcushale',
        github_url: 'https://github.com/marcushale',
        is_lead: false,
        join_date: '2024-02-15',
        order: 2
      },
      {
        id: 3,
        name: 'Dr. Sophia Chen',
        role: 'Data Scientist',
        bio: 'Expert in astronomical data analysis and machine learning for cosmic phenomena.',
        avatar: '/images/avatars/sophia-chen.jpg',
        email: 'sophia.chen@planivarum.atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/sophiachen',
        github_url: 'https://github.com/sophiachen',
        is_lead: false,
        join_date: '2024-03-01',
        order: 3
      }
    ],
    skills: [
      {
        id: 1,
        name: 'Astrophysics',
        description: 'Advanced space research and cosmic phenomena analysis',
        proficiency_level: 'expert'
      },
      {
        id: 2,
        name: 'Satellite Systems',
        description: 'Orbital mechanics and space communication',
        proficiency_level: 'expert'
      },
      {
        id: 3,
        name: 'AI/ML for Science',
        description: 'Machine learning applications in scientific research',
        proficiency_level: 'advanced'
      },
      {
        id: 4,
        name: 'Quantum Computing',
        description: 'Quantum algorithms for astrophysical simulations',
        proficiency_level: 'advanced'
      }
    ]
  },
  {
    id: 2,
    name: 'Stratovyn Collective',
    slug: 'stratovyn-collective',
    mission: 'Powering the future through intelligent energy systems',
    description: 'The Stratovyn Collective develops AI-driven IoT solutions for renewable energy optimization. We create intelligent systems that predict, monitor, and maximize solar potential while ensuring complete energy sovereignty and real-time telemetry.',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    color_theme: '#1e3a8a',
    is_active: true,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2025-10-31T00:00:00Z',
    members: [
      {
        id: 4,
        name: 'Dr. James Thornton',
        role: 'Chief Energy Engineer',
        bio: 'Pioneer in AI-driven renewable energy systems and smart grid technology.',
        avatar: '/images/avatars/james-thornton.jpg',
        email: 'james.thornton@stratovyn.atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/jamesthornton',
        github_url: 'https://github.com/jamesthornton',
        is_lead: true,
        join_date: '2024-02-01',
        order: 1
      },
      {
        id: 5,
        name: 'Maria Rodriguez',
        role: 'IoT Systems Architect',
        bio: 'Expert in distributed sensor networks and real-time data processing.',
        avatar: '/images/avatars/maria-rodriguez.jpg',
        email: 'maria.rodriguez@stratovyn.atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/mariarodriguez',
        github_url: 'https://github.com/mariarodriguez',
        is_lead: false,
        join_date: '2024-03-15',
        order: 2
      },
      {
        id: 6,
        name: 'Alex Kumar',
        role: 'AI Research Scientist',
        bio: 'Specializing in predictive analytics for energy optimization and climate modeling.',
        avatar: '/images/avatars/alex-kumar.jpg',
        email: 'alex.kumar@stratovyn.atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/alexkumar',
        github_url: 'https://github.com/alexkumar',
        is_lead: false,
        join_date: '2024-04-01',
        order: 3
      }
    ],
    skills: [
      {
        id: 5,
        name: 'IoT Systems',
        description: 'Internet of Things architecture and implementation',
        proficiency_level: 'expert'
      },
      {
        id: 6,
        name: 'AI/ML Energy',
        description: 'Machine learning for energy optimization',
        proficiency_level: 'expert'
      },
      {
        id: 7,
        name: 'Solar Technology',
        description: 'Advanced solar panel systems and optimization',
        proficiency_level: 'advanced'
      },
      {
        id: 8,
        name: 'Real-time Analytics',
        description: 'Live data processing and telemetry systems',
        proficiency_level: 'expert'
      }
    ]
  },
  {
    id: 3,
    name: 'Cosmodyne Guild',
    slug: 'cosmodyne-guild',
    mission: 'Defending digital sovereignty through advanced security',
    description: 'The Cosmodyne Guild specializes in network security and threat intelligence for mission-critical systems. We defend from protocol to perimeter with precision, insight, and autonomy, ensuring complete digital sovereignty in an increasingly connected world.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    color_theme: '#7c2d12',
    is_active: true,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2025-10-31T00:00:00Z',
    members: [
      {
        id: 7,
        name: 'Colonel Sarah Mitchell',
        role: 'Chief Security Officer',
        bio: 'Former military cybersecurity expert leading threat intelligence operations.',
        avatar: '/images/avatars/sarah-mitchell.jpg',
        email: 'sarah.mitchell@cosmodyne.atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/sarahmitchell',
        github_url: 'https://github.com/sarahmitchell',
        is_lead: true,
        join_date: '2024-03-01',
        order: 1
      },
      {
        id: 8,
        name: 'Dr. Raj Patel',
        role: 'Cryptography Specialist',
        bio: 'Leading expert in post-quantum cryptography and secure communication protocols.',
        avatar: '/images/avatars/raj-patel.jpg',
        email: 'raj.patel@cosmodyne.atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/rajpatel',
        github_url: 'https://github.com/rajpatel',
        is_lead: false,
        join_date: '2024-04-15',
        order: 2
      },
      {
        id: 9,
        name: 'Nina Zhao',
        role: 'Threat Intelligence Analyst',
        bio: 'Specialist in cyber threat analysis and autonomous defense systems.',
        avatar: '/images/avatars/nina-zhao.jpg',
        email: 'nina.zhao@cosmodyne.atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/ninazhao',
        github_url: 'https://github.com/ninazhao',
        is_lead: false,
        join_date: '2024-05-01',
        order: 3
      }
    ],
    skills: [
      {
        id: 9,
        name: 'Cybersecurity',
        description: 'Advanced threat detection and prevention',
        proficiency_level: 'expert'
      },
      {
        id: 10,
        name: 'Cryptography',
        description: 'Encryption and secure communication protocols',
        proficiency_level: 'expert'
      },
      {
        id: 11,
        name: 'Network Defense',
        description: 'Perimeter security and intrusion prevention',
        proficiency_level: 'expert'
      },
      {
        id: 12,
        name: 'Threat Intelligence',
        description: 'Cyber threat analysis and intelligence gathering',
        proficiency_level: 'advanced'
      }
    ]
  },
  {
    id: 4,
    name: 'SovraGrid',
    slug: 'sovragird',
    mission: 'Revolutionizing finance through sovereign payment infrastructure',
    description: 'SovraGrid builds next-generation financial platforms with complete sovereignty. We create seamless digital transaction experiences, currency exchange systems, and wallet management across web and mobile platforms, all while maintaining financial independence.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    color_theme: '#166534',
    is_active: true,
    created_at: '2024-04-01T00:00:00Z',
    updated_at: '2025-10-31T00:00:00Z',
    members: [
      {
        id: 10,
        name: 'Victoria Lang',
        role: 'Chief Financial Officer',
        bio: 'Former fintech executive leading sovereign payment infrastructure development.',
        avatar: '/images/avatars/victoria-lang.jpg',
        email: 'victoria.lang@sovragird.atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/victorialang',
        github_url: 'https://github.com/victorialang',
        is_lead: true,
        join_date: '2024-04-01',
        order: 1
      },
      {
        id: 11,
        name: 'David Nakamura',
        role: 'Blockchain Architect',
        bio: 'Expert in distributed ledger technology and cryptocurrency infrastructure.',
        avatar: '/images/avatars/david-nakamura.jpg',
        email: 'david.nakamura@sovragird.atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/davidnakamura',
        github_url: 'https://github.com/davidnakamura',
        is_lead: false,
        join_date: '2024-05-15',
        order: 2
      },
      {
        id: 12,
        name: 'Dr. Fatima Al-Rashid',
        role: 'Financial Systems Engineer',
        bio: 'Specialist in secure payment processing and financial transaction systems.',
        avatar: '/images/avatars/fatima-al-rashid.jpg',
        email: 'fatima.al-rashid@sovragird.atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/fatimaalrashid',
        github_url: 'https://github.com/fatimaalrashid',
        is_lead: false,
        join_date: '2024-06-01',
        order: 3
      }
    ],
    skills: [
      {
        id: 13,
        name: 'Blockchain Technology',
        description: 'Distributed ledger and cryptocurrency systems',
        proficiency_level: 'expert'
      },
      {
        id: 14,
        name: 'Payment Processing',
        description: 'Secure transaction processing and settlement',
        proficiency_level: 'expert'
      },
      {
        id: 15,
        name: 'Financial Security',
        description: 'Banking security and fraud prevention',
        proficiency_level: 'expert'
      },
      {
        id: 16,
        name: 'Digital Wallets',
        description: 'Cryptocurrency and digital asset management',
        proficiency_level: 'advanced'
      }
    ]
  },
  {
    id: 5,
    name: 'Tony Core',
    slug: 'tony-core',
    mission: 'Empowering communities through seamless onboarding and support',
    description: 'Tony Core serves as the central hub for AtonixCorp communities. We provide comprehensive onboarding experiences, technical support, and foster collaboration across all projects. As the meta-team, we ensure smooth user journeys and maintain the connective tissue between all AtonixCorp initiatives.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    color_theme: '#1976d2',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2025-10-31T00:00:00Z',
    members: [
      {
        id: 13,
        name: 'Anthony "Tony" Richardson',
        role: 'Community Director',
        bio: 'Visionary leader focused on building inclusive communities and seamless user experiences.',
        avatar: '/images/avatars/anthony-richardson.jpg',
        email: 'anthony.richardson@tonycore.atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/anthonyrichardson',
        github_url: 'https://github.com/anthonyrichardson',
        is_lead: true,
        join_date: '2023-01-01',
        order: 1
      },
      {
        id: 14,
        name: 'Lisa Chen',
        role: 'User Experience Designer',
        bio: 'Expert in creating intuitive onboarding flows and community engagement systems.',
        avatar: '/images/avatars/lisa-chen.jpg',
        email: 'lisa.chen@tonycore.atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/lisachen',
        github_url: 'https://github.com/lisachen',
        is_lead: false,
        join_date: '2023-02-15',
        order: 2
      },
      {
        id: 15,
        name: 'Marcus Johnson',
        role: 'Technical Support Lead',
        bio: 'Specialist in user support systems and technical documentation.',
        avatar: '/images/avatars/marcus-johnson.jpg',
        email: 'marcus.johnson@tonycore.atonixcorp.com',
        linkedin_url: 'https://linkedin.com/in/marcusjohnson',
        github_url: 'https://github.com/marcusjohnson',
        is_lead: false,
        join_date: '2023-03-01',
        order: 3
      }
    ],
    skills: [
      {
        id: 17,
        name: 'Community Management',
        description: 'Building and nurturing online communities',
        proficiency_level: 'expert'
      },
      {
        id: 18,
        name: 'User Onboarding',
        description: 'Creating seamless user introduction experiences',
        proficiency_level: 'expert'
      },
      {
        id: 19,
        name: 'Technical Support',
        description: 'User assistance and troubleshooting systems',
        proficiency_level: 'advanced'
      },
      {
        id: 20,
        name: 'UX/UI Design',
        description: 'User experience and interface design',
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
