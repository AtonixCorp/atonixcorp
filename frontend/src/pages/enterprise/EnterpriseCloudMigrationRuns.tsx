import React from 'react';
import EnterpriseLayout from '../../components/Enterprise/EnterpriseLayout';
import { Box, Paper, Typography, List, ListItemButton, ListItem, ListItemText } from '@mui/material';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { migrationApi } from '../../services/migrationApi';

const EnterpriseCloudMigrationRuns: React.FC = () => {
  const { id } = useParams();
  const enterpriseId = id || 'unknown';
  const [runs, setRuns] = React.useState<any[]>([]);

  React.useEffect(() => {
    let mounted = true;
    migrationApi.listRuns(enterpriseId).then((r:any[]) => { if (mounted) setRuns(r); });
    return () => { mounted = false; };
  }, [enterpriseId]);

  return (
    <EnterpriseLayout enterpriseId={enterpriseId}>
      <Box p={3}>
        <Typography variant="h5">Migration Runs</Typography>
        <Paper sx={{ mt: 2, p: 1 }}>
          <List>
            {runs.map((r) => (
              <ListItem key={r.id} disablePadding>
                <ListItemButton component={RouterLink} to={`/enterprise/${enterpriseId}/migration/run/${r.id}`}>
                  <ListItemText primary={`Run ${r.id}`} secondary={`${r.status} — ${r.startedAt || ''}`} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </EnterpriseLayout>
  );
};

export default EnterpriseCloudMigrationRuns;
