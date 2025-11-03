import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Divider,
} from '@mui/material';

const TermsOfServicePage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Terms of Service
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Last updated: November 3, 2025
        </Typography>

        <Divider sx={{ mb: 4 }} />

        <Box sx={{ '& > *': { mb: 3 } }}>
          <Typography variant="h5" gutterBottom>
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" paragraph>
            By accessing and using AtonixCorp's services, you accept and agree to be bound by the
            terms and provision of this agreement. If you do not agree to abide by the above
            terms, you are not authorized to use this service.
          </Typography>

          <Typography variant="h5" gutterBottom>
            2. Use License
          </Typography>
          <Typography variant="body1" paragraph>
            Permission is granted to temporarily use our services for personal, non-commercial
            transitory viewing only. This is the grant of a license, not a transfer of title,
            and under this license you may not:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to decompile or reverse engineer any software contained on our platform</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </Box>

          <Typography variant="h5" gutterBottom>
            3. Service Description
          </Typography>
          <Typography variant="body1" paragraph>
            AtonixCorp provides infrastructure and systems engineering services focused on
            building secure, scalable, and autonomous cloud solutions. Our services include
            but are not limited to cloud architecture, DevOps, security implementation, and
            technology consulting.
          </Typography>

          <Typography variant="h5" gutterBottom>
            4. User Accounts
          </Typography>
          <Typography variant="body1" paragraph>
            When you create an account with us, you must provide information that is accurate,
            complete, and current at all times. You are responsible for safeguarding the password
            and for all activities that occur under your account.
          </Typography>

          <Typography variant="h5" gutterBottom>
            5. Prohibited Uses
          </Typography>
          <Typography variant="body1" paragraph>
            You may not use our services:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
            <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
            <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
            <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            <li>To submit false or misleading information</li>
          </Box>

          <Typography variant="h5" gutterBottom>
            6. Intellectual Property
          </Typography>
          <Typography variant="body1" paragraph>
            The service and its original content, features, and functionality are and will remain
            the exclusive property of AtonixCorp and its licensors. The service is protected by
            copyright, trademark, and other laws.
          </Typography>

          <Typography variant="h5" gutterBottom>
            7. Termination
          </Typography>
          <Typography variant="body1" paragraph>
            We may terminate or suspend your account and bar access to the service immediately,
            without prior notice or liability, under our sole discretion, for any reason whatsoever
            and without limitation, including but not limited to a breach of the Terms.
          </Typography>

          <Typography variant="h5" gutterBottom>
            8. Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            In no event shall AtonixCorp, nor its directors, employees, partners, agents, suppliers,
            or affiliates, be liable for any indirect, incidental, special, consequential, or punitive
            damages, including without limitation, loss of profits, data, use, goodwill, or other
            intangible losses.
          </Typography>

          <Typography variant="h5" gutterBottom>
            9. Governing Law
          </Typography>
          <Typography variant="body1" paragraph>
            These Terms shall be interpreted and governed by the laws of the jurisdiction in which
            AtonixCorp operates, without regard to its conflict of law provisions.
          </Typography>

          <Typography variant="h5" gutterBottom>
            10. Changes to Terms
          </Typography>
          <Typography variant="body1" paragraph>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
            If a revision is material, we will provide at least 30 days notice prior to any new terms
            taking effect.
          </Typography>

          <Typography variant="h5" gutterBottom>
            11. Contact Information
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about these Terms of Service, please contact us at:
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

export default TermsOfServicePage;