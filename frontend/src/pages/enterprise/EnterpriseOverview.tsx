import React from 'react';
import EnterpriseLayout from '../../components/Enterprise/EnterpriseLayout';
import { Box, Paper, Typography, List, ListItem, ListItemText, Divider, Card, CardContent, Grid, Chip } from '@mui/material';
import { useParams } from 'react-router-dom';
import { enterprisesApi } from '../../services/enterprisesApi';
import type { Enterprise } from '../../types/enterprise';
import { teamsApi } from '../../services/teamsApi';
import { migrationApi } from '../../services/migrationApi';
import { analyticsApi } from '../../services/analyticsApi';
import { useAuth } from '../../contexts/AuthContext';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AnalyticsIcon from '@mui/icons-material/Analytics';

const EnterpriseOverview: React.FC = () => {
  const { id } = useParams();
  const enterpriseId = id || 'unknown';

  const [enterprise, setEnterprise] = React.useState<Enterprise | null>(null);
  const [teamsCount, setTeamsCount] = React.useState<number | null>(null);
  const [runs, setRuns] = React.useState<any[] | null>(null);
  const [avgScore, setAvgScore] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [ent, teams, runsResp, metrics] = await Promise.all([
          enterprisesApi.get(enterpriseId),
          teamsApi.list(enterpriseId),
          migrationApi.listRuns(enterpriseId),
          analyticsApi.fetchModelScores(enterpriseId, { days: 30 }),
        ]);

        if (!mounted) return;
        setEnterprise(ent || null);
        setTeamsCount(Array.isArray(teams) ? teams.length : 0);
        setRuns(Array.isArray(runsResp) ? runsResp : []);

        if (Array.isArray(metrics) && metrics.length > 0) {
          const avg = Math.round(metrics.reduce((s: number, m: any) => s + (m.score || 0), 0) / metrics.length);
          setAvgScore(avg);
        } else {
          setAvgScore(null);
        }
      } catch (err: any) {
        console.error('EnterpriseOverview load error', err);
        setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [enterpriseId]);

  return (
    <EnterpriseLayout enterpriseId={enterpriseId}>
      <Box p={3}>
        <Typography variant="h5" gutterBottom>Overview</Typography>

        {loading && <Typography>Loading enterprise summary…</Typography>}
        {error && <Typography color="error">Error: {error}</Typography>}

        {!loading && !error && (
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2">Enterprise</Typography>
              <Typography variant="h6">{enterprise?.companyName || enterprise?.name || 'Unknown Enterprise'}</Typography>
              <Typography variant="body2" color="text.secondary">Domain: {enterprise?.domain || enterprise?.companyUrl || '—'}</Typography>
              <Typography variant="body2" color="text.secondary">Created: {enterprise?.createdAt ? new Date(enterprise.createdAt).toLocaleString() : '—'}</Typography>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2">Quick Stats</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">{teamsCount ?? '—'}</Typography>
                  <Typography variant="body2" color="text.secondary">Teams</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box>
                  <Typography variant="h6">{runs?.length ?? 0}</Typography>
                  <Typography variant="body2" color="text.secondary">Migration runs</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box>
                  <Typography variant="h6">{avgScore ?? '—'}</Typography>
                  <Typography variant="body2" color="text.secondary">Avg analytics score (30d)</Typography>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2">Recent Migration Runs</Typography>
              <List dense>
                {runs && runs.length > 0 ? (
                  runs.slice(-5).reverse().map((r: any) => (
                    <ListItem key={r.id}>
                      <ListItemText primary={`Run ${r.id}`} secondary={`${r.status} — ${r.startedAt ? new Date(r.startedAt).toLocaleString() : ''}`} />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No recent runs" />
                  </ListItem>
                )}
              </List>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2">Analytics (preview)</Typography>
              <Typography variant="body2" color="text.secondary">Average model score for the last 30 days.</Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="h4">{avgScore ?? '—'}</Typography>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </EnterpriseLayout>
  );
};

// New component for organization dashboard overview
export const EnterpriseOverviewDashboard: React.FC = () => {
  const { user, organization } = useAuth();

  const enterpriseId = organization?.id?.toString() || 'unknown';

  const [teamsCount, setTeamsCount] = React.useState<number | null>(null);
  const [runs, setRuns] = React.useState<any[] | null>(null);
  const [avgScore, setAvgScore] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [teams, runsResp, metrics] = await Promise.all([
          teamsApi.list(enterpriseId),
          migrationApi.listRuns(enterpriseId),
          analyticsApi.fetchModelScores(enterpriseId, { days: 30 }),
        ]);

        if (!mounted) return;
        setTeamsCount(Array.isArray(teams) ? teams.length : 0);
        setRuns(Array.isArray(runsResp) ? runsResp : []);

        if (Array.isArray(metrics) && metrics.length > 0) {
          const avg = Math.round(metrics.reduce((s: number, m: any) => s + (m.score || 0), 0) / metrics.length);
          setAvgScore(avg);
        } else {
          setAvgScore(null);
        }
      } catch (err: any) {
        console.error('EnterpriseOverviewDashboard load error', err);
        setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [enterpriseId]);

  const stats = [
    {
      title: 'Teams',
      value: teamsCount ?? 0,
      icon: <GroupIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      description: 'Active teams in your organization'
    },
    {
      title: 'Migration Runs',
      value: runs?.length ?? 0,
      icon: <CloudUploadIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      description: 'Total cloud migration runs'
    },
    {
      title: 'Analytics Score',
      value: avgScore ?? 0,
      icon: <AnalyticsIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      description: 'Average model performance (30d)'
    },
    {
      title: 'Growth',
      value: '+12%',
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      description: 'Performance improvement this month'
    }
  ];

  return (
    <EnterpriseLayout enterpriseId={enterpriseId}>
      <Box p={3}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Enterprise Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome to your organization's dashboard. Here's a summary of your enterprise activities and performance.
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <Typography>Loading enterprise data...</Typography>
          </Box>
        )}

        {error && (
          <Card sx={{ mb: 3, borderColor: 'error.main' }}>
            <CardContent>
              <Typography variant="h6" color="error" gutterBottom>
                Error Loading Data
              </Typography>
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          <>
            {/* Organization Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {organization?.name || 'Your Organization'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                  <Chip label={`Domain: ${organization?.domain || 'N/A'}`} variant="outlined" size="small" />
                  <Chip label={`Industry: ${organization?.industry || 'N/A'}`} variant="outlined" size="small" />
                  <Chip label={`Size: ${organization?.size || 'N/A'}`} variant="outlined" size="small" />
                  <Chip
                    label={`Plan: ${organization?.subscription_plan || 'Enterprise'}`}
                    color="primary"
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
              {stats.map((stat, index) => (
                <Card key={index} sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Recent Activity */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Migration Runs
                  </Typography>
                  <List dense>
                    {runs && runs.length > 0 ? (
                      runs.slice(-5).reverse().map((run: any) => (
                        <ListItem key={run.id} sx={{ px: 0 }}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1">{`Run ${run.id}`}</Typography>
                                <Chip
                                  label={run.status}
                                  size="small"
                                  color={run.status === 'completed' ? 'success' : run.status === 'running' ? 'primary' : 'warning'}
                                />
                              </Box>
                            }
                            secondary={run.startedAt ? new Date(run.startedAt).toLocaleString() : 'Unknown time'}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText primary="No recent migration runs" />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Analytics Performance
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                      {avgScore ?? '—'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Average Model Score (30 days)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Based on {Array.isArray(runs) ? runs.length : 0} data points
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </>
        )}
      </Box>
    </EnterpriseLayout>
  );
};

export default EnterpriseOverview;
