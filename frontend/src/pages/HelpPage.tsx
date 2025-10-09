import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Divider,
  Paper,
  Stack,
} from '@mui/material';
import {
  ExpandMore,
  Search,
  Help,
  ContactSupport,
  Article,
  VideoLibrary,
  Chat,
  Email,
  Phone,
  Forum,
  Lightbulb,
  QuestionAnswer,
} from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface ContactMethod {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  color: string;
}

const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const faqs: FAQItem[] = [
    {
      question: 'How do I create a new project?',
      answer: 'To create a new project, navigate to the Projects section from your dashboard and click the "New Project" button. Fill in the project details including name, description, team members, and timeline.',
      category: 'Projects',
    },
    {
      question: 'How do I invite team members?',
      answer: 'Go to the Teams section and click "Invite Member". Enter their email address and select their role. They will receive an invitation email with instructions to join.',
      category: 'Teams',
    },
    {
      question: 'How do I track project progress?',
      answer: 'Use the Analytics dashboard to view project metrics, timelines, and progress reports. You can also set up custom dashboards for specific KPIs.',
      category: 'Analytics',
    },
    {
      question: 'How do I manage focus areas?',
      answer: 'Navigate to Focus Areas to create and manage different areas of focus for your organization. Each focus area can have multiple projects and team assignments.',
      category: 'Focus Areas',
    },
    {
      question: 'How do I access resources?',
      answer: 'Visit the Resources section to browse documentation, templates, and tools. You can also upload your own resources for team sharing.',
      category: 'Resources',
    },
    {
      question: 'How do I schedule tasks?',
      answer: 'Use the Schedule page to create and manage tasks with due dates, priorities, and assignments. Set reminders and track completion status.',
      category: 'Tasks',
    },
    {
      question: 'How do I configure security settings?',
      answer: 'Access the Security page to manage authentication, permissions, and access controls. Configure two-factor authentication and role-based access.',
      category: 'Security',
    },
    {
      question: 'How do I update my profile?',
      answer: 'Go to Settings > Profile to update your personal information, avatar, bio, and contact details.',
      category: 'Settings',
    },
  ];

  const contactMethods: ContactMethod[] = [
    {
      icon: <Chat sx={{ fontSize: 24 }} />,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      action: 'Start Chat',
      color: '#3b82f6',
    },
    {
      icon: <Email sx={{ fontSize: 24 }} />,
      title: 'Email Support',
      description: 'Send us a detailed message',
      action: 'Send Email',
      color: '#22c55e',
    },
    {
      icon: <Phone sx={{ fontSize: 24 }} />,
      title: 'Phone Support',
      description: 'Speak directly with our experts',
      action: 'Call Now',
      color: '#f59e0b',
    },
    {
      icon: <Forum sx={{ fontSize: 24 }} />,
      title: 'Community Forum',
      description: 'Connect with other users',
      action: 'Join Discussion',
      color: '#8b5cf6',
    },
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  return (
    <DashboardLayout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Help & Support Center
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Find answers to common questions and get the help you need.
          </Typography>

          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#64748b' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 600,
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                backgroundColor: '#f8fafc',
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                },
                '&.Mui-focused': {
                  backgroundColor: '#ffffff',
                },
              },
            }}
          />
        </Box>

        {/* Quick Actions */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
            mb: 4,
          }}
        >
          <Card
            sx={{
              height: '100%',
              cursor: 'pointer',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  backgroundColor: '#3b82f620',
                  color: '#3b82f6',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Article sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Documentation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Browse our comprehensive guides
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              height: '100%',
              cursor: 'pointer',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  backgroundColor: '#22c55e20',
                  color: '#22c55e',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <VideoLibrary sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Video Tutorials
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Watch step-by-step guides
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              height: '100%',
              cursor: 'pointer',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  backgroundColor: '#f59e0b20',
                  color: '#f59e0b',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <QuestionAnswer sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Ask AI Assistant
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get instant answers
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              height: '100%',
              cursor: 'pointer',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  backgroundColor: '#8b5cf620',
                  color: '#8b5cf6',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Lightbulb sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Tips & Tricks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Discover productivity hacks
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* FAQ Section */}
        <Paper
          sx={{
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            p: 3,
            mb: 4,
          }}
        >
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
            Frequently Asked Questions
          </Typography>

          {/* Category Filter */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Filter by category:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label="All"
                onClick={() => setSearchQuery('')}
                variant={!searchQuery ? 'filled' : 'outlined'}
                sx={{ borderRadius: '8px' }}
              />
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => setSearchQuery(category)}
                  variant={searchQuery === category ? 'filled' : 'outlined'}
                  sx={{ borderRadius: '8px' }}
                />
              ))}
            </Stack>
          </Box>

          {filteredFaqs.map((faq, index) => (
            <Accordion
              key={index}
              sx={{
                borderRadius: '12px !important',
                mb: 2,
                border: '1px solid #e2e8f0',
                '&:before': { display: 'none' },
                '&.Mui-expanded': {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  borderRadius: '12px',
                  '&.Mui-expanded': {
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Help sx={{ color: '#64748b' }} />
                  <Typography variant="h6" fontWeight={600}>
                    {faq.question}
                  </Typography>
                  <Chip
                    label={faq.category}
                    size="small"
                    sx={{
                      backgroundColor: '#3b82f620',
                      color: '#3b82f6',
                      fontWeight: 500,
                    }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Typography variant="body1" color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}

          {filteredFaqs.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ContactSupport sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No results found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search terms or browse our categories above.
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Contact Support */}
        <Paper
          sx={{
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            p: 3,
          }}
        >
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3, textAlign: 'center' }}>
            Still Need Help? Contact Our Support Team
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {contactMethods.map((method, index) => (
              <Card
                key={index}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      backgroundColor: `${method.color}20`,
                      color: method.color,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {method.icon}
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                    {method.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {method.description}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      backgroundColor: method.color,
                      '&:hover': {
                        backgroundColor: method.color,
                        opacity: 0.9,
                      },
                    }}
                  >
                    {method.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default HelpPage;