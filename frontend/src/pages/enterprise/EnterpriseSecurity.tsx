import React, { useState, useEffect } from 'react';
import EnterpriseLayout from '../../components/Enterprise/EnterpriseLayout';
import { useParams } from 'react-router-dom';
import { securityApi } from '../../services/securityApi';
import { overviewMock, complianceMock, incidentsMock, auditsMock } from '../../services/securityMockData';
import {
  Box,
  // Grid removed due to TS overload issues; using Box CSS-grid instead
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Security,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  TrendingUp,
  Shield,
  Gavel,
  Article,
  ReportProblem,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`security-tabpanel-${index}`}
      aria-labelledby={`security-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface SecurityOverview {
  enterprises: Enterprise[];
  summary: {
    total_enterprises: number;
    policies_active: number;
    controls_total: number;
    controls_verified: number;
    active_incidents: number;
    upcoming_audits: number;
    compliance_score: number;
  };
}

interface Enterprise {
  id: string;
  name: string;
  security: {
    policy_active: boolean;
    policy_id: string | null;
    controls: {
      total: number;
      verified: number;
      percentage: number;
    };
    incidents: {
      active: number;
      critical: number;
      high: number;
    };
    audits: {
      upcoming: number;
      recent: number;
    };
    compliance_score: number;
  };
}

interface ComplianceStatus {
  enterprise_id: string;
  frameworks: Framework[];
  overall_compliance: number;
}

interface Framework {
  framework: string;
  total: number;
  completed: number;
  in_progress: number;
  not_started: number;
  compliance_percentage: number;
  items: ComplianceItem[];
}

interface ComplianceItem {
  requirement: string;
  status: string;
  deadline: string | null;
  percentage: number;
}

interface IncidentSummary {
  total: number;
  by_severity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  by_status: {
    reported: number;
    investigating: number;
    contained: number;
    resolved: number;
  };
  mttr_hours: number;
  active_incidents: number;
  recent_incidents: Incident[];
}

interface Incident {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: string;
  reported_at: string;
  resolved_at: string | null;
  systems_affected: string[];
}

interface AuditSchedule {
  upcoming: Audit[];
  recent: Audit[];
  summary: {
    scheduled: number;
    completed_this_year: number;
    avg_findings_per_audit: number;
  };
}

interface Audit {
  id: string;
  title: string;
  type: string;
  scheduled_date?: string;
  end_date?: string;
  status: string;
  findings?: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

const EnterpriseSecurity: React.FC = () => {
  const { id } = useParams();
  const enterpriseId = id || 'unknown';

  const [tabValue, setTabValue] = useState(0);
  const [selectedEnterprise, setSelectedEnterprise] = useState<string | null>(enterpriseId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [overview, setOverview] = useState<SecurityOverview | null>(null);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [incidents, setIncidents] = useState<IncidentSummary | null>(null);
  const [audits, setAudits] = useState<AuditSchedule | null>(null);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [incidentStatus, setIncidentStatus] = useState('');

  const token = localStorage.getItem('authToken');

  // Fetch security overview
  const fetchOverview = async (eid: string) => {
    try {
      setLoading(true);
      const data = await securityApi.getSecurityOverview();
      setOverview(data.data || data);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch overview';
      setError(errorMsg);
      console.error('Error fetching overview:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch compliance status
  const fetchCompliance = async (eid: string) => {
    try {
      const data = await securityApi.getComplianceStatus(eid);
      setCompliance(data.data || data);
    } catch (err) {
      console.error('Error fetching compliance:', err);
    }
  };

  // Fetch incidents
  const fetchIncidents = async (eid: string) => {
    try {
      const data = await securityApi.getSecurityIncidents(eid);
      setIncidents(data.data || data);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    }
  };

  // Fetch audits
  const fetchAudits = async (eid: string) => {
    try {
      const data = await securityApi.getAuditSchedule(eid);
      setAudits(data.data || data);
    } catch (err) {
      console.error('Error fetching audits:', err);
    }
  };

  useEffect(() => {
    if (enterpriseId && enterpriseId !== 'unknown') {
      fetchOverview(enterpriseId);
    }
  }, [enterpriseId]);

  useEffect(() => {
    if (selectedEnterprise && selectedEnterprise !== 'unknown') {
      fetchCompliance(selectedEnterprise);
      fetchIncidents(selectedEnterprise);
      fetchAudits(selectedEnterprise);
    }
  }, [selectedEnterprise]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleIncidentDialogOpen = (incident: Incident) => {
    setSelectedIncident(incident);
    setIncidentStatus(incident.status);
    setDialogOpen(true);
  };

  const handleIncidentDialogClose = () => {
    setDialogOpen(false);
    setSelectedIncident(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#dc2626';
      case 'high':
        return '#ea580c';
      case 'medium':
        return '#eab308';
      case 'low':
        return '#22c55e';
      default:
        return '#64748b';
    }
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'success';
      case 'investigating':
      case 'in_progress':
        return 'warning';
      case 'reported':
        return 'error';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const content = (
    <Box sx={{ width: '100%', p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
          }}
        >
          Enterprise Security Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor security posture, compliance status, and incident management.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="error" action={
            <Box>
              <Button size="small" onClick={() => {
                // Retry: re-run the same fetches
                setError(null);
                setLoading(true);
                if (enterpriseId && enterpriseId !== 'unknown') {
                  fetchOverview(enterpriseId);
                  fetchCompliance(enterpriseId);
                  fetchIncidents(enterpriseId);
                  fetchAudits(enterpriseId);
                } else {
                  fetchOverview('');
                }
              }}>
                Retry
              </Button>
              <Button size="small" onClick={() => {
                // Use sample/mock data so UI is visible even if backend is down
                setOverview(overviewMock as any);
                setCompliance(complianceMock as any);
                setIncidents(incidentsMock as any);
                setAudits(auditsMock as any);
                setError(null);
                setLoading(false);
              }}>
                Use sample data
              </Button>
            </Box>
          }>
            {error}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            If the error persists, ensure the backend is running and your auth token (localStorage.authToken) is valid.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Summary Cards */}
          <Box sx={{ display: 'grid', gap: 3, mb: 4, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(4,1fr)' } }}>
            <Box>
              <Card sx={{ borderRadius: '15px', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Policies Active
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {overview?.summary.policies_active || 0}
                      </Typography>
                    </Box>
                    <Shield sx={{ fontSize: 40, color: '#3b82f6', opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Card sx={{ borderRadius: '15px', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Controls Verified
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {overview?.summary.controls_verified || 0}/{overview?.summary.controls_total || 0}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(overview?.summary.controls_verified ?? 0) / Math.max(overview?.summary.controls_total ?? 1, 1) * 100}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <CheckCircle sx={{ fontSize: 40, color: '#22c55e', opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Card sx={{ borderRadius: '15px', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Active Incidents
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ea580c' }}>
                        {overview?.summary.active_incidents || 0}
                      </Typography>
                    </Box>
                    <ReportProblem sx={{ fontSize: 40, color: '#ea580c', opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Card sx={{ borderRadius: '15px', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Compliance Score
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3b82f6' }}>
                        {overview?.summary.compliance_score.toFixed(1) || 0}%
                      </Typography>
                    </Box>
                    <TrendingUp sx={{ fontSize: 40, color: '#3b82f6', opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Tabs */}
          <Paper sx={{ borderRadius: '15px', mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="security tabs"
              sx={{
                borderBottom: '1px solid #e2e8f0',
                '& .MuiTab-root': {
                  fontSize: '1rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 3,
                },
              }}
            >
              <Tab label="Compliance" icon={<Gavel />} iconPosition="start" />
              <Tab label="Incidents" icon={<ErrorIcon />} iconPosition="start" />
              <Tab label="Audits" icon={<Article />} iconPosition="start" />
            </Tabs>

            {/* Compliance Tab */}
            <TabPanel value={tabValue} index={0}>
              {compliance ? (
                <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(2,1fr)' } }}>
                  {compliance.frameworks.map((framework, idx) => (
                    <Box key={idx}>
                      <Card sx={{ borderRadius: '15px' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {framework.framework}
                            </Typography>
                            <Chip
                              label={`${framework.compliance_percentage.toFixed(1)}%`}
                              color={framework.compliance_percentage >= 80 ? 'success' : framework.compliance_percentage >= 50 ? 'warning' : 'error'}
                              variant="outlined"
                            />
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption">Compliance Progress</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {framework.completed}/{framework.total}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={framework.compliance_percentage}
                              sx={{ height: 8, borderRadius: '4px' }}
                            />
                          </Box>

                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1, mt: 1 }}>
                            <Box>
                              <Typography variant="caption" display="block" color="textSecondary">
                                In Progress
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {framework.in_progress}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" display="block" color="textSecondary">
                                Not Started
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {framework.not_started}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Alert severity="info">No compliance data available</Alert>
              )}
            </TabPanel>

            {/* Incidents Tab */}
            <TabPanel value={tabValue} index={1}>
              {incidents ? (
                <Box sx={{ display: 'grid', gap: 3 }}>
                  <Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(4,1fr)' }, gap: 2, mb: 3 }}>
                      <Box>
                        <Card sx={{ borderRadius: '15px' }}>
                          <CardContent>
                            <Typography color="textSecondary" variant="caption">
                              Critical
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#dc2626' }}>
                              {incidents.by_severity.critical}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                      <Box>
                        <Card sx={{ borderRadius: '15px' }}>
                          <CardContent>
                            <Typography color="textSecondary" variant="caption">
                              High
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ea580c' }}>
                              {incidents.by_severity.high}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                      <Box>
                        <Card sx={{ borderRadius: '15px' }}>
                          <CardContent>
                            <Typography color="textSecondary" variant="caption">
                              Medium
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#eab308' }}>
                              {incidents.by_severity.medium}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                      <Box>
                        <Card sx={{ borderRadius: '15px' }}>
                          <CardContent>
                            <Typography color="textSecondary" variant="caption">
                              Low
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#22c55e' }}>
                              {incidents.by_severity.low}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                    </Box>
                  </Box>

                  {incidents.recent_incidents.length > 0 && (
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Recent Incidents
                      </Typography>
                      <TableContainer component={Paper} sx={{ borderRadius: '15px' }}>
                        <Table>
                          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Reported</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {incidents.recent_incidents.map((incident) => (
                              <TableRow key={incident.id}>
                                <TableCell>{incident.title}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={incident.severity}
                                    size="small"
                                    sx={{ backgroundColor: getSeverityColor(incident.severity), color: 'white' }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip label={incident.status} size="small" color={getStatusChipColor(incident.status)} />
                                </TableCell>
                                <TableCell>
                                  {new Date(incident.reported_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleIncidentDialogOpen(incident)}
                                  >
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Box>
              ) : (
                <Alert severity="info">No incidents data available</Alert>
              )}
            </TabPanel>

            {/* Audits Tab */}
            <TabPanel value={tabValue} index={2}>
              {audits ? (
                <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(2,1fr)' } }}>
                  {audits.upcoming.length > 0 && (
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Upcoming Audits
                      </Typography>
                      {audits.upcoming.map((audit) => (
                        <Card key={audit.id} sx={{ borderRadius: '15px', mb: 2 }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {audit.title}
                              </Typography>
                              <Chip label={audit.type} size="small" variant="outlined" />
                            </Box>
                            <Typography variant="caption" color="textSecondary">
                              Scheduled: {new Date(audit.scheduled_date!).toLocaleDateString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}

                  {audits.recent.length > 0 && (
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Recent Audits
                      </Typography>
                      {audits.recent.map((audit) => (
                        <Card key={audit.id} sx={{ borderRadius: '15px', mb: 2 }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {audit.title}
                              </Typography>
                              <Chip label="Completed" size="small" color="success" />
                            </Box>
                            {audit.findings && (
                              <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #e2e8f0' }}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                                  <Box>
                                    <Typography variant="caption" color="textSecondary">
                                      Total Findings
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {audit.findings.total}
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="caption" color="textSecondary">
                                      Critical
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#dc2626' }}>
                                      {audit.findings.critical}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Box>
              ) : (
                <Alert severity="info">No audits data available</Alert>
              )}
            </TabPanel>
          </Paper>

          {/* Incident Detail Dialog */}
          <Dialog open={dialogOpen} onClose={handleIncidentDialogClose} maxWidth="sm" fullWidth>
            <DialogTitle>{selectedIncident?.title}</DialogTitle>
            <DialogContent dividers>
              {selectedIncident && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Severity
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      <Chip
                        label={selectedIncident.severity}
                        sx={{ backgroundColor: getSeverityColor(selectedIncident.severity), color: 'white' }}
                      />
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Status
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      value={incidentStatus}
                      onChange={(e) => setIncidentStatus(e.target.value)}
                      size="small"
                    >
                      <MenuItem value="reported">Reported</MenuItem>
                      <MenuItem value="investigating">Investigating</MenuItem>
                      <MenuItem value="contained">Contained</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                    </TextField>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Systems Affected
                    </Typography>
                    <Typography variant="body2">
                      {selectedIncident.systems_affected.join(', ') || 'None'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Reported At
                    </Typography>
                    <Typography variant="body2">
                      {new Date(selectedIncident.reported_at).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleIncidentDialogClose}>Close</Button>
              <Button variant="contained" onClick={handleIncidentDialogClose}>
                Update Status
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );

  return (
    <EnterpriseLayout enterpriseId={enterpriseId}>
      {content}
    </EnterpriseLayout>
  );
};

export default EnterpriseSecurity;
