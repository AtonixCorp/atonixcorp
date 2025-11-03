import React from 'react';
import EnterpriseLayout from '../../components/Enterprise/EnterpriseLayout';
import { Box, Paper, Typography, List, ListItem, ListItemText, Checkbox, Button, ListItemButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { migrationApi } from '../../services/migrationApi';
import { useParams } from 'react-router-dom';

const __steps = [
  'Inventory workloads',
  'Assess compatibility',
  'Choose cloud provider',
  'Plan networking and security',
  'Migrate data',
  'Validate and optimize',
];

const __STORAGE_KEY = 'cloud_migration_progress';

const EnterpriseCloudMigrationChecklist: React.FC = () => {
  const { id } = useParams();
  const enterpriseId = id || 'unknown';
  const [checked, setChecked] = React.useState<boolean[]>(() => {
    try {
      const raw = localStorage.getItem(__STORAGE_KEY);
      return raw ? JSON.parse(raw) : new Array(__steps.length).fill(false);
    } catch {
      return new Array(__steps.length).fill(false);
    }
  });

  const toggle = (i: number) => {
    const copy = [...checked];
    copy[i] = !copy[i];
    setChecked(copy);
    localStorage.setItem(__STORAGE_KEY, JSON.stringify(copy));
  };

  const reset = () => {
    const init = new Array(__steps.length).fill(false);
    setChecked(init);
    localStorage.setItem(__STORAGE_KEY, JSON.stringify(init));
  };

  const navigate = useNavigate();

  const startMigration = async () => {
    const payload = { __steps, completed: checked, logs: ['Initiated migration run'], estimatedCost: Math.round(500 + Math.random() * 4500) };
    const run = await migrationApi.startMigration(enterpriseId, payload);
    navigate(`/enterprise/${enterpriseId}/migration/run/${run.id}`);
    // kick off simulation for local fallback
    migrationApi.simulateProgress(String(run.id), (updated) => {
      // noop - run details page will read from localStorage when visited
      // optionally we could push updates via a state management system
      console.debug('migration progress update', updated);
    });
  };

  return (
    <EnterpriseLayout enterpriseId={enterpriseId}>
      <Box p={3}>
        <Typography variant="h5" gutterBottom>Cloud Migration Checklist</Typography>
        <Paper sx={{ p: 2, maxWidth: 720 }}>
          <List>
            {__steps.map((s, i) => (
              <ListItem key={s}>
                <ListItemButton onClick={() => toggle(i)}>
                  <Checkbox checked={!!checked[i]} />
                  <ListItemText primary={s} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={startMigration}>Start Migration</Button>
            <Button variant="outlined" onClick={reset}>Reset</Button>
          </Box>
        </Paper>
      </Box>
    </EnterpriseLayout>
  );
};

export default EnterpriseCloudMigrationChecklist;
