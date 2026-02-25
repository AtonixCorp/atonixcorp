import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { domainApi } from '../services/cloudApi';
import DomainPage from './DomainPage';
import { dashboardTokens, dashboardSemanticColors } from '../styles/dashboardDesignSystem';

type AdminSummary = {
  total_domains: number;
  total_users: number;
  status_counts: Record<string, number>;
  top_tlds: Array<{ tld: string; count: number }>;
};

type AdminDomain = {
  resource_id: string;
  domain_name: string;
  status: string;
  tld: string;
  owner_username: string | null;
  expires_at: string | null;
  auto_renew: boolean;
};

type AdminUser = {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_active: boolean;
  domains_count: number;
};

const statusColor = (status: string) => {
  switch (status) {
    case 'active': return dashboardSemanticColors.success;
    case 'pending':
    case 'transferring': return dashboardSemanticColors.warning;
    case 'expired':
    case 'failed':
    case 'error': return dashboardSemanticColors.danger;
    default: return dashboardTokens.colors.textSecondary;
  }
};

const DomainsServiceDashboardPage: React.FC = () => {
  const [tab, setTab] = useState(0);

  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [adminDomains, setAdminDomains] = useState<AdminDomain[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideDomain, setOverrideDomain] = useState<AdminDomain | null>(null);
  const [overrideStatus, setOverrideStatus] = useState('active');
  const [overrideSaving, setOverrideSaving] = useState(false);

  const loadAdmin = async () => {
    setAdminLoading(true);
    setAdminError('');
    try {
      const [summaryRes, domainsRes, usersRes] = await Promise.all([
        domainApi.adminSummary(),
        domainApi.adminDomains(),
        domainApi.adminUsers(),
      ]);
      setSummary(summaryRes.data as AdminSummary);
      setAdminDomains(Array.isArray(domainsRes.data) ? domainsRes.data as AdminDomain[] : []);
      setAdminUsers(Array.isArray(usersRes.data) ? usersRes.data as AdminUser[] : []);
    } catch {
      setAdminError('Admin console unavailable for this account. Requires admin privileges.');
      setSummary(null);
      setAdminDomains([]);
      setAdminUsers([]);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (tab !== 1) return;
    loadAdmin();
  }, [tab]);

  const statusRows = useMemo(() => {
    if (!summary?.status_counts) return [];
    return Object.entries(summary.status_counts).sort((a, b) => b[1] - a[1]);
  }, [summary]);

  const submitOverride = async () => {
    if (!overrideDomain) return;
    setOverrideSaving(true);
    try {
      await domainApi.adminForceStatus(overrideDomain.resource_id, overrideStatus);
      setOverrideOpen(false);
      setOverrideDomain(null);
      await loadAdmin();
    } catch {
      setAdminError('Unable to apply status override.');
    } finally {
      setOverrideSaving(false);
    }
  };

  return (
    <Box sx={{ bgcolor: dashboardTokens.colors.background, minHeight: '100%', p: { xs: 1.5, md: 2.5 } }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: dashboardTokens.colors.textPrimary }}>
          Atonix Domains Service Dashboard
        </Typography>
        <Typography sx={{ color: dashboardTokens.colors.textSecondary, mt: 0.5 }}>
          Full domain operations inside your cloud: lifecycle, DNS, SSL, billing posture, and admin controls.
        </Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        sx={{
          mb: 2,
          borderBottom: `1px solid ${dashboardTokens.colors.border}`,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
        }}
      >
        <Tab label="Domain Operations" />
        <Tab label="Domain Admin Console" />
      </Tabs>

      {tab === 0 && (
        <Box sx={{ border: `1px solid ${dashboardTokens.colors.border}`, borderRadius: 1, overflow: 'hidden', minHeight: 680 }}>
          <DomainPage />
        </Box>
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          {adminError && <Alert severity="warning">{adminError}</Alert>}

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography sx={{ fontSize: '.78rem', color: dashboardTokens.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em' }}>Total Domains</Typography>
                <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, mt: .5 }}>{summary?.total_domains ?? '—'}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography sx={{ fontSize: '.78rem', color: dashboardTokens.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em' }}>Total Users</Typography>
                <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, mt: .5 }}>{summary?.total_users ?? '—'}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 2 }}>
              <CardContent>
                <Typography sx={{ fontSize: '.78rem', color: dashboardTokens.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', mb: 1 }}>Status Mix</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {statusRows.map(([status, count]) => (
                    <Chip
                      key={status}
                      label={`${status}: ${count}`}
                      sx={{ bgcolor: `${statusColor(status)}22`, color: statusColor(status), borderRadius: '2px' }}
                    />
                  ))}
                  {statusRows.length === 0 && <Typography sx={{ color: dashboardTokens.colors.textSecondary }}>No data</Typography>}
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
                <Typography sx={{ fontWeight: 700 }}>Domain Inventory</Typography>
                <Button size="small" variant="outlined" onClick={loadAdmin} disabled={adminLoading}>Refresh</Button>
              </Stack>
              {adminLoading ? (
                <CircularProgress size={22} />
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Domain</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Owner</TableCell>
                      <TableCell>Expires</TableCell>
                      <TableCell>Auto Renew</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {adminDomains.map((domain) => (
                      <TableRow key={domain.resource_id} hover>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{domain.domain_name}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={domain.status}
                            sx={{ bgcolor: `${statusColor(domain.status)}22`, color: statusColor(domain.status), borderRadius: '2px' }}
                          />
                        </TableCell>
                        <TableCell>{domain.owner_username || '—'}</TableCell>
                        <TableCell>{domain.expires_at ? new Date(domain.expires_at).toLocaleDateString() : '—'}</TableCell>
                        <TableCell>{domain.auto_renew ? 'Yes' : 'No'}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setOverrideDomain(domain);
                              setOverrideStatus(domain.status);
                              setOverrideOpen(true);
                            }}
                          >
                            Override
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {adminDomains.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ color: dashboardTokens.colors.textSecondary, textAlign: 'center' }}>
                          No domains found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography sx={{ fontWeight: 700, mb: 1.25 }}>User Ownership View</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Domains</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {adminUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email || '—'}</TableCell>
                      <TableCell>{user.domains_count}</TableCell>
                      <TableCell>{user.is_staff ? 'Admin' : 'User'}</TableCell>
                      <TableCell>{user.is_active ? 'Active' : 'Disabled'}</TableCell>
                    </TableRow>
                  ))}
                  {adminUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ color: dashboardTokens.colors.textSecondary, textAlign: 'center' }}>
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Stack>
      )}

      <Dialog open={overrideOpen} onClose={() => setOverrideOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Force Domain Status</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1, color: dashboardTokens.colors.textSecondary }}>
            Domain: {overrideDomain?.domain_name}
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Status"
            value={overrideStatus}
            onChange={(event) => setOverrideStatus(event.target.value)}
            helperText="Use: pending, active, expired, suspended, transferring, deleting, error"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOverrideOpen(false)}>Cancel</Button>
          <Button onClick={submitOverride} variant="contained" disabled={overrideSaving}>
            {overrideSaving ? 'Saving...' : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DomainsServiceDashboardPage;
