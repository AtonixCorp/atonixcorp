import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Alert,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Group,
  Settings,
  People,
  Security,
  Payment,
  Delete,
  Edit,
  Add,
  Star,
  CheckCircle,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { Team, TeamMembership, TeamMember } from '../types/api';
import { teamsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/Layout/DashboardLayout';

interface TeamSettings {
  allow_public_join: boolean;
  require_approval: boolean;
  max_members: number;
  premium_features: boolean;
}

const TeamAdminPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [membership, setMembership] = useState<TeamMembership | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState<TeamSettings>({
    allow_public_join: true,
    require_approval: false,
    max_members: 50,
    premium_features: false,
  });
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [inviteDialog, setInviteDialog] = useState(false);
  const [editMemberDialog, setEditMemberDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [memberRole, setMemberRole] = useState('');
  const [memberBio, setMemberBio] = useState('');

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!slug) {
        setError('Team not found');
        setLoading(false);
        return;
      }

      try {
        // Fetch team details
        const teamResponse = await teamsApi.getBySlug(slug);
        setTeam(teamResponse.data);

        // Fetch user's membership status
        const membershipResponse = await teamsApi.getMembership(slug);
        setMembership(membershipResponse.data);

        // Check if user is admin
        if (membershipResponse.data.membership_type !== 'admin' && membershipResponse.data.membership_type !== 'lead') {
          setError('Access denied. Admin privileges required.');
          setLoading(false);
          return;
        }

        // Mock members data (in real app, this would come from API)
        setMembers(teamResponse.data.members);

        // Mock settings (in real app, this would come from API)
        setSettings({
          allow_public_join: true,
          require_approval: false,
          max_members: 50,
          premium_features: teamResponse.data.members.some(m => m.is_lead),
        });

      } catch (err) {
        setError('Error loading team admin panel');
        console.error('Error fetching team data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [slug]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInviteMember = async () => {
    // Mock invite functionality
    console.log('Inviting member:', inviteEmail, inviteRole);
    setInviteDialog(false);
    setInviteEmail('');
    setInviteRole('member');
    // In real app, this would call an API to send invitation
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setMemberRole(member.role);
    setMemberBio(member.bio || '');
    setEditMemberDialog(true);
  };

  const handleUpdateMember = async () => {
    if (!selectedMember) return;

    // Mock update functionality
    console.log('Updating member:', selectedMember.id, memberRole, memberBio);
    setEditMemberDialog(false);
    setSelectedMember(null);
    setMemberRole('');
    setMemberBio('');
    // In real app, this would call an API to update member
  };

  const handleRemoveMember = async (memberId: number) => {
    // Mock remove functionality
    console.log('Removing member:', memberId);
    // In real app, this would call an API to remove member
  };

  const handleSettingsChange = (setting: keyof TeamSettings, value: any) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
    // In real app, this would call an API to update settings
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" sx={{ mb: 4 }}>Loading Team Admin Panel...</Typography>
        </Container>
      </DashboardLayout>
    );
  }

  if (error || !team || !membership) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error || 'Access denied or team not found'}
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate(`/teams/${slug}/dashboard`)}
          >
            Back to Team Dashboard
          </Button>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
        {/* Header */}
        <Paper
          sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            mb: 4,
            background: `linear-gradient(135deg, ${team.color_theme} 0%, ${team.color_theme}CC 100%)`,
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AdminPanelSettings sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h3" component="h1" fontWeight="bold" sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}>
                  {team.name} Admin Panel
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Manage your team settings and members
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Group />}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              onClick={() => navigate(`/teams/${slug}/dashboard`)}
            >
              View Team Dashboard
            </Button>
          </Box>
        </Paper>

        {/* Main Content Tabs */}
        <Paper sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 64,
              },
            }}
          >
            <Tab icon={<People />} label="Members" iconPosition="start" />
            <Tab icon={<Settings />} label="Settings" iconPosition="start" />
            <Tab icon={<Security />} label="Permissions" iconPosition="start" />
            <Tab icon={<Payment />} label="Billing" iconPosition="start" />
          </Tabs>

          <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            {/* Members Tab */}
            {tabValue === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Team Members ({members.length})
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setInviteDialog(true)}
                  >
                    Invite Member
                  </Button>
                </Box>

                <Card>
                  <CardContent sx={{ p: 0 }}>
                    <List>
                      {members.map((member, index) => (
                        <React.Fragment key={member.id}>
                          <ListItem sx={{ px: 3, py: 2 }}>
                            <ListItemAvatar>
                              <Avatar
                                src={member.avatar}
                                sx={{ bgcolor: team.color_theme }}
                              >
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="subtitle1" fontWeight="600">
                                    {member.name}
                                  </Typography>
                                  {member.is_lead && <Star color="warning" fontSize="small" />}
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {member.role}
                                  </Typography>
                                  {member.bio && (
                                    <Typography variant="body2" color="text.secondary">
                                      {member.bio}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip
                                  label={member.is_lead ? 'Lead' : 'Member'}
                                  size="small"
                                  color={member.is_lead ? 'warning' : 'default'}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditMember(member)}
                                  color="primary"
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                                {!member.is_lead && (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemoveMember(member.id)}
                                    color="error"
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < members.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Settings Tab */}
            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Team Settings
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                        Membership Settings
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1" fontWeight="500">
                              Allow Public Join
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Allow anyone to join without invitation
                            </Typography>
                          </Box>
                          <Switch
                            checked={settings.allow_public_join}
                            onChange={(e) => handleSettingsChange('allow_public_join', e.target.checked)}
                          />
                        </Box>

                        <Divider />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1" fontWeight="500">
                              Require Approval
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              New members need admin approval
                            </Typography>
                          </Box>
                          <Switch
                            checked={settings.require_approval}
                            onChange={(e) => handleSettingsChange('require_approval', e.target.checked)}
                          />
                        </Box>

                        <Divider />

                        <TextField
                          label="Max Members"
                          type="number"
                          value={settings.max_members}
                          onChange={(e) => handleSettingsChange('max_members', parseInt(e.target.value))}
                          fullWidth
                        />
                      </Box>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                        Premium Features
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1" fontWeight="500">
                              Premium Features
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Enable advanced team features
                            </Typography>
                          </Box>
                          <Switch
                            checked={settings.premium_features}
                            onChange={(e) => handleSettingsChange('premium_features', e.target.checked)}
                          />
                        </Box>

                        <Divider />

                        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Premium features include advanced analytics, priority support, and unlimited projects.
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            )}

            {/* Permissions Tab */}
            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Permission Management
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                  Permission settings control what team members can do within the team.
                </Alert>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                        Member Permissions
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="View team projects" />
                          <CheckCircle color="success" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Comment on projects" />
                          <CheckCircle color="success" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Create personal tasks" />
                          <CheckCircle color="success" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Access team chat" />
                          <CheckCircle color="success" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                        Admin Permissions
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="Manage team members" />
                          <CheckCircle color="success" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Edit team settings" />
                          <CheckCircle color="success" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Create team projects" />
                          <CheckCircle color="success" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Manage billing" />
                          <CheckCircle color="success" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            )}

            {/* Billing Tab */}
            {tabValue === 3 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Billing & Subscription
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                        Current Plan
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" fontWeight="bold">
                          {settings.premium_features ? 'Premium' : 'Free'}
                        </Typography>
                        <Chip
                          label={settings.premium_features ? 'Active' : 'Basic'}
                          color={settings.premium_features ? 'secondary' : 'default'}
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {settings.premium_features
                          ? 'Unlimited projects, advanced analytics, priority support'
                          : 'Up to 5 projects, basic features'
                        }
                      </Typography>

                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Payment />}
                        onClick={() => navigate(`/teams/${slug}/upgrade`)}
                      >
                        {settings.premium_features ? 'Manage Subscription' : 'Upgrade to Premium'}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                        Usage Statistics
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Team Members</Typography>
                            <Typography variant="body2" fontWeight="600">
                              {members.length} / {settings.premium_features ? 'Unlimited' : '10'}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={settings.premium_features ? 50 : (members.length / 10) * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Storage Used</Typography>
                            <Typography variant="body2" fontWeight="600">
                              2.4 GB / {settings.premium_features ? '100 GB' : '5 GB'}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={settings.premium_features ? 2.4 : 48}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Invite Member Dialog */}
        <Dialog open={inviteDialog} onClose={() => setInviteDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogContent>
            <TextField
              label="Email Address"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                label="Role"
              >
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="lead">Team Lead</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInviteDialog(false)}>Cancel</Button>
            <Button onClick={handleInviteMember} variant="contained">
              Send Invitation
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Member Dialog */}
        <Dialog open={editMemberDialog} onClose={() => setEditMemberDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogContent>
            <TextField
              label="Role"
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
            />
            <TextField
              label="Bio"
              value={memberBio}
              onChange={(e) => setMemberBio(e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditMemberDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateMember} variant="contained">
              Update Member
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );

};

export default TeamAdminPage;
