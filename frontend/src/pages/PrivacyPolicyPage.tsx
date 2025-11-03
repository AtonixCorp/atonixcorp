import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Divider,
} from '@mui/material';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Privacy Policy
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Last updated: November 3, 2025
        </Typography>

        <Divider sx={{ mb: 4 }} />

        <Box sx={{ '& > *': { mb: 3 } }}>
          <Typography variant="h5" gutterBottom>
            1. Information We Collect
          </Typography>
          <Typography variant="body1" paragraph>
            We collect information you provide directly to us, such as when you create an account,
            use our services, or contact us for support. This may include your name, email address,
            company information, and any other information you choose to provide.
          </Typography>

          <Typography variant="h5" gutterBottom>
            2. How We Use Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            We use the information we collect to provide, maintain, and improve our services,
            communicate with you, and ensure the security of our platform. We may also use your
            information to send you updates, newsletters, or marketing communications if you've
            opted in to receive them.
          </Typography>

          <Typography variant="h5" gutterBottom>
            3. Information Sharing
          </Typography>
          <Typography variant="body1" paragraph>
            We do not sell, trade, or otherwise transfer your personal information to third parties
            without your consent, except as described in this policy. We may share your information
            with service providers who assist us in operating our platform or as required by law.
          </Typography>

          <Typography variant="h5" gutterBottom>
            4. Data Security
          </Typography>
          <Typography variant="body1" paragraph>
            We implement appropriate security measures to protect your personal information against
            unauthorized access, alteration, disclosure, or destruction. However, no method of
            transmission over the internet is 100% secure.
          </Typography>

          <Typography variant="h5" gutterBottom>
            5. Your Rights
          </Typography>
          <Typography variant="body1" paragraph>
            You have the right to access, update, or delete your personal information. You may also
            opt out of marketing communications at any time. To exercise these rights, please contact
            us at support@atonixcorp.com.
          </Typography>

          <Typography variant="h5" gutterBottom>
            6. Cookies and Tracking
          </Typography>
          <Typography variant="body1" paragraph>
            We use cookies and similar technologies to enhance your experience on our platform,
            analyze usage patterns, and provide personalized content. You can control cookie settings
            through your browser preferences.
          </Typography>

          <Typography variant="h5" gutterBottom>
            7. Changes to This Policy
          </Typography>
          <Typography variant="body1" paragraph>
            We may update this privacy policy from time to time. We will notify you of any material
            changes by posting the new policy on this page and updating the "Last updated" date.
          </Typography>

          <Typography variant="h5" gutterBottom>
            8. Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about this privacy policy, please contact us at:
          </Typography>
          <Typography variant="body1">
            Email: support@atonixcorp.com<br />
            Address: Global Remote Operations
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicyPage;