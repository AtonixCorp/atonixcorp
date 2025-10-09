import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Badge,
  Skeleton,
} from '@mui/material';
import {
  Group,
  Forum,
  Star,
  Add,
  ThumbUp,
  Comment,
  Person,
  EmojiEvents,
  Code,
  GitHub,
  LinkedIn,
  Settings,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockCommunityService } from '../services/authService';
import { CommunityMember, Discussion } from '../types/auth';
import LoginDialog from '../components/Auth/LoginDialog';
import SignupDialog from '../components/Auth/SignupDialog';
import EditProfileDialog from '../components/Auth/EditProfileDialog';
import CommunityDashboard from './CommunityDashboard';

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
      id={`community-tabpanel-${index}`}
      aria-labelledby={`community-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const CommunityPage: React.FC = () => {
  const location = useLocation();
  const isDashboardMode = location.pathname.startsWith('/dashboard');

  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        setLoading(true);
        const [membersData, discussionsData] = await Promise.all([
          mockCommunityService.getMembers(),
          mockCommunityService.getDiscussions(),
        ]);
        setMembers(membersData);
        setDiscussions(discussionsData);
      } catch (error) {
        console.error('Error fetching community data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const handleSaveProfile = (updatedMember: CommunityMember) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    // In a real app, this would make an API call to save the changes
    console.log('Profile updated:', updatedMember);
  };

  const getCategoryColor = (category: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (category.toLowerCase()) {
      case 'general':
        return 'default';
      case 'help & support':
        return 'info';
      case 'project showcase':
        return 'success';
      case 'feedback':
        return 'warning';
      case 'ideas':
        return 'primary';
      default:
        return 'default';
    }
  };

  // Show dashboard if user is authenticated
  if (isAuthenticated) {
    return <CommunityDashboard />;
  }

  if (loading) {
    return (
      <Box sx={{ py: isDashboardMode ? 0 : 4 }}>
        {!isDashboardMode && (
          <Container maxWidth="lg">
            <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={40} sx={{ mb: 4 }} />
          </Container>
        )}
        {isDashboardMode && (
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={30} />
          </Box>
        )}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
          <Box>
            {[...Array(3)].map((_, index) => (
              <Card key={index} sx={{ mb: 3 }}>
                <CardContent>
                  <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={60} />
                </CardContent>
              </Card>
            ))}
          </Box>
          <Box>
            <Card>
              <CardContent>
                <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
                {[...Array(5)].map((_, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                    <Skeleton variant="text" width="100%" height={30} />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    );
  }

  const content = (
    <>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant={isDashboardMode ? "h4" : "h2"} component="h1" fontWeight="bold" gutterBottom>
          AtonixCorp Community
        </Typography>
        <Typography variant={isDashboardMode ? "body1" : "h6"} color="text.secondary" sx={{ mb: 4 }}>
          Connect, collaborate, and contribute with fellow developers and innovators
        </Typography>
        
        {!isAuthenticated && !isDashboardMode && (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Person />}
              onClick={() => setSignupOpen(true)}
            >
              Join Community
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => setLoginOpen(true)}
            >
              Sign In
            </Button>
          </Box>
        )}
      </Box>

      {/* Community Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 6 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Group color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {members.length}+
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Community Members
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Forum color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {discussions.length}+
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Discussions
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Code color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              150+
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Projects Contributed
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <EmojiEvents color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              50+
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Achievements Earned
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<Forum />}
            label="Discussions"
            id="community-tab-0"
            aria-controls="community-tabpanel-0"
          />
          <Tab
            icon={<Group />}
            label="Members"
            id="community-tab-1"
            aria-controls="community-tabpanel-1"
          />
          <Tab
            icon={<Star />}
            label="Contributors"
            id="community-tab-2"
            aria-controls="community-tabpanel-2"
          />
        </Tabs>
      </Paper>

      {/* Discussions Tab */}
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                Latest Discussions
              </Typography>
              {isAuthenticated && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => console.log('Create discussion')}
                >
                  New Discussion
                </Button>
              )}
            </Box>

            {discussions.map((discussion) => (
              <Card key={discussion.id} sx={{ mb: 3, cursor: 'pointer', '&:hover': { elevation: 4 } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2 }}>
                      {discussion.author.first_name[0]}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {discussion.author.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimeAgo(discussion.created_at)}
                      </Typography>
                    </Box>
                    <Chip
                      label={discussion.category}
                      color={getCategoryColor(discussion.category)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                    {discussion.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {discussion.content.substring(0, 200)}...
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {discussion.tags.map((tag) => (
                      <Chip key={tag} label={tag} variant="outlined" size="small" />
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ThumbUp fontSize="small" />
                      <Typography variant="body2">{discussion.likes}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Comment fontSize="small" />
                      <Typography variant="body2">{discussion.replies}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Sidebar */}
          <Box>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Discussion Categories
                </Typography>
                <List dense>
                  {['General', 'Help & Support', 'Project Showcase', 'Feedback', 'Ideas'].map((category) => (
                    <ListItem 
                      key={category} 
                      sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                    >
                      <ListItemText primary={category} />
                      <ListItemSecondaryAction>
                        <Chip size="small" label={Math.floor(Math.random() * 20) + 1} />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Community Guidelines
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Help us maintain a positive and productive community environment:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Be respectful and professional"
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Stay on topic and provide value"
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Search before posting duplicates"
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Share knowledge and help others"
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* Members Tab */}
      <TabPanel value={activeTab} index={1}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          Community Members
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {members.map((member) => (
            <Card key={member.id}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Avatar
                    src={member.user.avatar}
                    sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
                  >
                    {member.user.first_name[0]}
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    {member.user.first_name} {member.user.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{member.user.username}
                  </Typography>
                  <Chip
                    label={member.role}
                    color={member.role === 'maintainer' ? 'primary' : 'secondary'}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>

                {member.user.bio && (
                  <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                    {member.user.bio}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2, justifyContent: 'center' }}>
                  {member.user.skills.slice(0, 3).map((skill) => (
                    <Chip key={skill} label={skill} variant="outlined" size="small" />
                  ))}
                  {member.user.skills.length > 3 && (
                    <Chip label={`+${member.user.skills.length - 3}`} variant="outlined" size="small" />
                  )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                  {member.user.github_url && (
                    <IconButton size="small" href={member.user.github_url} target="_blank">
                      <GitHub />
                    </IconButton>
                  )}
                  {member.user.linkedin_url && (
                    <IconButton size="small" href={member.user.linkedin_url} target="_blank">
                      <LinkedIn />
                    </IconButton>
                  )}
                  {isAuthenticated && user?.id === member.user.id && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedMember(member);
                        setEditProfileOpen(true);
                      }}
                    >
                      <Settings />
                    </IconButton>
                  )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {member.contributions}
                    </Typography>
                    <Typography variant="caption">Contributions</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {member.reputation}
                    </Typography>
                    <Typography variant="caption">Reputation</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>

      {/* Contributors Tab */}
      <TabPanel value={activeTab} index={2}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          Top Contributors
        </Typography>
        <Card>
          <CardContent>
            <List>
              {members
                .sort((a, b) => b.contributions - a.contributions)
                .map((member, index) => (
                  <ListItem key={member.id}>
                    <ListItemAvatar>
                      <Badge
                        badgeContent={index + 1}
                        color={index === 0 ? 'primary' : 'secondary'}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      >
                        <Avatar src={member.user.avatar}>
                          {member.user.first_name[0]}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${member.user.first_name} ${member.user.last_name}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            @{member.user.username} • {member.contributions} contributions
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                            {member.badges.map((badge) => (
                              <Chip key={badge} label={badge} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" fontWeight="bold">
                          {member.reputation}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          reputation
                        </Typography>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Auth Dialogs */}
      <LoginDialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToSignup={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
      />
      <SignupDialog
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSwitchToLogin={() => {
          setSignupOpen(false);
          setLoginOpen(true);
        }}
      />
      <EditProfileDialog
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        member={selectedMember}
        onSave={handleSaveProfile}
      />
    </>
  );

  return isDashboardMode ? (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Community
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect, collaborate, and contribute with fellow developers and innovators
        </Typography>
      </Box>
      {content}
    </Box>
  ) : (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {content}
    </Container>
  );
};

export default CommunityPage;