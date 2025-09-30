import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Paper } from '@mui/material';
import { managementService } from '../services/managementService';
import { UserActivity } from '../types/activity';

const ManagementDashboard: React.FC = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await managementService.getActivities();
        if (mounted) setActivities(data);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        Management Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Monitor user activities across the platform (mock data). Connect this to real APIs to view live activity.
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Recent Activities
                </Typography>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Details</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activities.map(act => (
                        <TableRow key={act.id}>
                          <TableCell>{act.user}</TableCell>
                          <TableCell>{act.action}</TableCell>
                          <TableCell>{new Date(act.timestamp).toLocaleString()}</TableCell>
                          <TableCell>{act.details}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Metrics
              </Typography>
              <Box>
                <Typography variant="body2">Total activities: {activities.length}</Typography>
                <Typography variant="body2">Active users (mock): {new Set(activities.map(a => a.user)).size}</Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ManagementDashboard;
