import React from 'react';
import EnterpriseLayout from '../../components/Enterprise/EnterpriseLayout';
import { Box, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useParams } from 'react-router-dom';

const __RUNS_KEY = 'cloud_migration_runs';

const EnterpriseMigrationRunDetails: React.FC = () => {
  const { id, runId } = useParams();
  const enterpriseId = id || 'unknown';
  const runsRaw = localStorage.getItem(__RUNS_KEY) || '[]';
  const runs = JSON.parse(runsRaw) as Array<any>;
  const run = runs.find(r => String(r.id) === String(runId));

  if (!run) {
    return (
      <EnterpriseLayout enterpriseId={enterpriseId}>
        <Box p={3}>
          <Typography variant="h6">Run not found</Typography>
        </Box>
      </EnterpriseLayout>
    );
  }

  return (
    <EnterpriseLayout enterpriseId={enterpriseId}>
      <Box p={3}>
        <Typography variant="h5">Migration Run: {run.id}</Typography>
        <Typography variant="subtitle2" color="text.secondary">Status: {run.status}</Typography>
        <Box sx={{ mt: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Estimated Cost</Typography>
            <Typography variant="h6">${run.estimatedCost?.toFixed(2) || '0.00'}</Typography>
          </Paper>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Logs</Typography>
          <List>
            {run.logs?.map((l: string, i: number) => (
              <ListItem key={i}><ListItemText primary={l} /></ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </EnterpriseLayout>
  );
};

export default EnterpriseMigrationRunDetails;
