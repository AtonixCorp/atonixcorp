import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Avatar,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import {
  Person,
  Security,
  Notifications,
  Palette,
  Save,
  PhotoCamera,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const __TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website_url || '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    taskReminders: true,
    projectUpdates: true,
    securityAlerts: true,
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordChangeReminder: true,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileUpdate = () => {
    // Handle profile update logic
    console.log('Updating profile:', profileData);
  };

  const handleNotificationUpdate = () => {
    // Handle notification settings update
    console.log('Updating notifications:', notifications);
  };

  const handleSecurityUpdate = () => {
    // Handle security settings update
    console.log('Updating security:', security);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
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
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account settings and preferences.
          </Typography>
        </Box>

        {/* Settings Tabs */}
        <Paper
          sx={{
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            width: '100%',
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              borderBottom: '1px solid #e2e8f0',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 64,
              },
            }}
          >
            <Tab icon={<Person />} label="Profile" />
            <Tab icon={<Notifications />} label="Notifications" />
            <Tab icon={<Security />} label="Security" />
            <Tab icon={<Palette />} label="Appearance" />
          </Tabs>

          {/* Profile Tab */}
          <__TabPanel value={tabValue} index={0}>
            <Box sx={{ maxWidth: 600, p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Profile Information
              </Typography>

              {/* Avatar Section */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar
                  src={user?.avatar}
                  sx={{
                    width: 80,
                    height: 80,
                    backgroundColor: '#3b82f6',
                    fontSize: '2rem',
                    mr: 3,
                  }}
                >
                  {user?.first_name[0]}
                </Avatar>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<PhotoCamera />}
                    sx={{ mr: 2, borderRadius: '12px' }}
                  >
                    Change Photo
                  </Button>
                  <Button variant="text" color="error" sx={{ borderRadius: '12px' }}>
                    Remove
                  </Button>
                </Box>
              </Box>

              <Stack spacing={3}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />

                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Website"
                    value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleProfileUpdate}
                    sx={{ borderRadius: '12px', px: 4 }}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Stack>
            </Box>
          </__TabPanel>

          {/* Notifications Tab */}
          <__TabPanel value={tabValue} index={1}>
            <Box sx={{ maxWidth: 600, p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Notification Preferences
              </Typography>

              <Stack spacing={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.emailNotifications}
                      onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                    />
                  }
                  label="Email Notifications"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.pushNotifications}
                      onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                    />
                  }
                  label="Push Notifications"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.taskReminders}
                      onChange={(e) => setNotifications({ ...notifications, taskReminders: e.target.checked })}
                    />
                  }
                  label="Task Reminders"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.projectUpdates}
                      onChange={(e) => setNotifications({ ...notifications, projectUpdates: e.target.checked })}
                    />
                  }
                  label="Project Updates"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.securityAlerts}
                      onChange={(e) => setNotifications({ ...notifications, securityAlerts: e.target.checked })}
                    />
                  }
                  label="Security Alerts"
                />

                <Divider sx={{ my: 2 }} />

                <Alert severity="info">
                  <Typography variant="body2">
                    You can customize how and when you receive notifications. Changes will take effect immediately.
                  </Typography>
                </Alert>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleNotificationUpdate}
                    sx={{ borderRadius: '12px', px: 4 }}
                  >
                    Save Preferences
                  </Button>
                </Box>
              </Stack>
            </Box>
          </__TabPanel>

          {/* Security Tab */}
          <__TabPanel value={tabValue} index={2}>
            <Box sx={{ maxWidth: 600, p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Security Settings
              </Typography>

              <Stack spacing={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={security.twoFactorAuth}
                      onChange={(e) => setSecurity({ ...security, twoFactorAuth: e.target.checked })}
                    />
                  }
                  label="Two-Factor Authentication"
                />

                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={security.sessionTimeout}
                  onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                  helperText="Automatically log out after this many minutes of inactivity"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={security.passwordChangeReminder}
                      onChange={(e) => setSecurity({ ...security, passwordChangeReminder: e.target.checked })}
                    />
                  }
                  label="Password Change Reminders"
                />

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Password Management
                </Typography>

                <Button
                  variant="outlined"
                  sx={{ borderRadius: '12px', alignSelf: 'flex-start' }}
                >
                  Change Password
                </Button>

                <Alert severity="warning">
                  <Typography variant="body2">
                    For your security, we recommend changing your password regularly and enabling two-factor authentication.
                  </Typography>
                </Alert>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSecurityUpdate}
                    sx={{ borderRadius: '12px', px: 4 }}
                  >
                    Save Security Settings
                  </Button>
                </Box>
              </Stack>
            </Box>
          </__TabPanel>

          {/* Appearance Tab */}
          <__TabPanel value={tabValue} index={3}>
            <Box sx={{ maxWidth: 600, p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Appearance Settings
              </Typography>

              <Stack spacing={3}>
                <Typography variant="body1" color="text.secondary">
                  Customize the look and feel of your dashboard.
                </Typography>

                <Alert severity="info">
                  <Typography variant="body2">
                    Theme customization features will be available in a future update.
                  </Typography>
                </Alert>
              </Stack>
            </Box>
          </__TabPanel>
        </Paper>
      </Box>
  );
};

export default SettingsPage;
