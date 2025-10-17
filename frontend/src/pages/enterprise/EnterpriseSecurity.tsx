import React from 'react';
import EnterpriseLayout from '../../components/Enterprise/EnterpriseLayout';
import { Paper, Typography, Box } from '@mui/material';
import { useParams } from 'react-router-dom';

const EnterpriseSecurity: React.FC = () => {
  const { id } = useParams();
  const enterpriseId = id || 'unknown';

  return (
    <EnterpriseLayout enterpriseId={enterpriseId}>
      <Box p={3}>
        <Paper elevation={2} style={{ padding: 16 }}>
          <Typography variant="h5" gutterBottom>
            Security
          </Typography>
          <Typography variant="body1">
            Security guidance, hardening checklists, and controls for enterprise environments.
          </Typography>
        </Paper>
      </Box>
    </EnterpriseLayout>
  );
};

export default EnterpriseSecurity;
