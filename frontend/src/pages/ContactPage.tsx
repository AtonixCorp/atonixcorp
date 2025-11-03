import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Schedule,
  CheckCircle,
  LinkedIn,
  Person,
  Send,
  Public,
} from '@mui/icons-material';
import { ContactPerson, OfficeLocation } from '../types/api';
import { contactApi } from '../services/api';

interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  company: string;
  phone: string;
  message_type: 'general' | 'partnership' | 'support' | 'career' | 'media' | 'other';
}

const ContactPage: React.FC = () => {
  const [contacts, setContacts] = useState<ContactPerson[]>([]);
  const [offices, setOffices] = useState<OfficeLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const [formData, setFormData] = useState<ContactMessage>({
    name: '',
    email: '',
    subject: '',
    message: '',
    company: '',
    phone: '',
    message_type: 'general',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // For now, we'll use mock data since the backend endpoints might not be fully implemented
        const mockContacts: ContactPerson[] = [
          {
            id: 1,
            name: 'John Smith',
            title: 'Chief Technology Officer',
            department: 'Technology',
            email: 'john.smith@atonix.com',
            phone: '+1 (555) 123-4567',
            bio: 'Leading our technology vision and innovation strategy.',
            linkedin_url: 'https://linkedin.com/in/johnsmith',
            is_primary: true,
            is_active: true,
            order: 1,
            avatar: undefined,
          },
          {
            id: 2,
            name: 'Sarah Johnson',
            title: 'VP of Engineering',
            department: 'Engineering',
            email: 'sarah.johnson@atonix.com',
            phone: '+1 (555) 234-5678',
            bio: 'Driving engineering excellence and team development.',
            linkedin_url: 'https://linkedin.com/in/sarahjohnson',
            is_primary: false,
            is_active: true,
            order: 2,
            avatar: undefined,
          },
        ];

        const mockOffices: OfficeLocation[] = [
          {
            id: 1,
            name: 'Headquarters',
            address_line_1: '123 Tech Street',
            address_line_2: '',
            city: 'San Francisco',
            state: 'CA',
            postal_code: '94105',
            country: 'USA',
            phone: '+1 (555) 123-4567',
            email: 'hq@atonix.com',
            latitude: 37.7749,
            longitude: -122.4194,
            is_headquarters: true,
            is_active: true,
          },
          {
            id: 2,
            name: 'East Coast Office',
            address_line_1: '456 Innovation Ave',
            address_line_2: '',
            city: 'New York',
            state: 'NY',
            postal_code: '10001',
            country: 'USA',
            phone: '+1 (555) 987-6543',
            email: 'ny@atonix.com',
            latitude: 40.7128,
            longitude: -74.0060,
            is_headquarters: false,
            is_active: true,
          },
        ];

        setContacts(mockContacts);
        setOffices(mockOffices);
      } catch (err) {
        console.error('Error fetching contact data:', err);
        setError('Failed to load contact information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await contactApi.sendMessage(formData);
      setSnackbar({
        open: true,
        message: 'Message sent successfully! We\'ll get back to you soon.',
        severity: 'success'
      });
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        company: '',
        phone: '',
        message_type: 'general',
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setSnackbar({
        open: true,
        message: 'Failed to send message. Please try again.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ px: 3, py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Get in touch with our team to discuss your business needs and innovative technology solutions.
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
          <Box>
            <Skeleton variant="rectangular" height={600} />
          </Box>
          <Box>
            <Skeleton variant="rectangular" height={300} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={300} />
          </Box>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ px: 3, py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Contact Us
        </Typography>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => {
            setError(null);
            setLoading(true);
          }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3, py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
          Contact Us
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph sx={{ maxWidth: 800, mx: 'auto' }}>
          Get in touch with our team to discuss your business needs and innovative technology solutions.
          We're here to help you transform your ideas into reality.
        </Typography>
      </Box>

      {/* Main Contact Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 6 }}>
        {/* Contact Form */}
        <Box>
          <Card sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Send Us a Message
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 3 }}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />

                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />

                <TextField
                  fullWidth
                  label="Company (Optional)"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                />

                <TextField
                  fullWidth
                  label="Phone (Optional)"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />

                <FormControl fullWidth variant="outlined">
                  <InputLabel>Inquiry Type</InputLabel>
                  <Select
                    name="message_type"
                    value={formData.message_type}
                    onChange={handleInputChange}
                    label="Inquiry Type"
                  >
                    <MenuItem value="general">General Inquiry</MenuItem>
                    <MenuItem value="partnership">Partnership</MenuItem>
                    <MenuItem value="support">Technical Support</MenuItem>
                    <MenuItem value="career">Career Opportunity</MenuItem>
                    <MenuItem value="media">Media Inquiry</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </Box>

              <TextField
                fullWidth
                label="Message"
                name="message"
                multiline
                rows={6}
                value={formData.message}
                onChange={handleInputChange}
                required
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting}
                fullWidth
                startIcon={<Send />}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </Button>
            </Box>
          </Card>
        </Box>

        {/* Contact Information Sidebar */}
        <Box>
          {/* Key Contacts */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Key Contacts
              </Typography>
              <List>
                {contacts.map((contact, index) => (
                  <Box key={contact.id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Person />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {contact.name}
                            </Typography>
                            {contact.is_primary && (
                              <Chip label="Primary" size="small" color="primary" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {contact.title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              <Email sx={{ fontSize: 16 }} />
                              <Typography variant="body2">{contact.email}</Typography>
                            </Box>
                            {contact.phone && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Phone sx={{ fontSize: 16 }} />
                                <Typography variant="body2">{contact.phone}</Typography>
                              </Box>
                            )}
                            {contact.linkedin_url && (
                              <Box sx={{ mt: 1 }}>
                                <IconButton
                                  size="small"
                                  href={contact.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <LinkedIn sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < contacts.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Office Locations */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Office Locations
              </Typography>
              <List>
                {offices.map((office, index) => (
                  <Box key={office.id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemIcon>
                        <LocationOn color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {office.name}
                            </Typography>
                            {office.is_headquarters && (
                              <Chip label="HQ" size="small" color="secondary" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {office.address_line_1}
                              {office.address_line_2 && `, ${office.address_line_2}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {office.city}, {office.state} {office.postal_code}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {office.country}
                            </Typography>
                            {office.phone && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <Phone sx={{ fontSize: 16 }} />
                                <Typography variant="body2">{office.phone}</Typography>
                              </Box>
                            )}
                            {office.email && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Email sx={{ fontSize: 16 }} />
                                <Typography variant="body2">{office.email}</Typography>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < offices.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Additional Information */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          Why Choose AtonixCorp?
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Schedule sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Quick Response
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We respond to all inquiries within 24 hours during business days.
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Expert Consultation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Get personalized advice from our experienced technology consultants.
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Public sx={{ fontSize: 40, color: 'info.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Global Reach
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Serving clients worldwide with localized support and expertise.
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactPage;
