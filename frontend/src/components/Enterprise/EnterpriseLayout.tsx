import React from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, Divider, Collapse } from '@mui/material';
import { Dashboard as DashboardIcon, People as PeopleIcon, Settings as SettingsIcon, Storage as StorageIcon, ExpandLess, ExpandMore, Group as GroupIcon, Storefront as StorefrontIcon, Analytics as AnalyticsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
  enterpriseId: string;
}

const EnterpriseLayout: React.FC<Props> = ({ children, enterpriseId }) => {
  const navigate = useNavigate();

  const items = [
    { text: 'Overview', icon: <DashboardIcon />, path: `/enterprise/${enterpriseId}/overview` },
    { text: 'Users', icon: <PeopleIcon />, path: `/enterprise/${enterpriseId}/users` },
    // Workspace will render here (so it appears above Data)
    { text: 'Data', icon: <StorageIcon />, path: `/enterprise/${enterpriseId}/data` },
  { text: 'AI Analytics', icon: <AnalyticsIcon />, path: `/enterprise/${enterpriseId}/ai-analytics` },
    { text: 'Cloud Migration', icon: <StorefrontIcon />, path: `/enterprise/${enterpriseId}/cloud-migration` },
    { text: 'Security', icon: <SettingsIcon />, path: `/enterprise/${enterpriseId}/security` },
    { text: 'Help & Support', icon: <PeopleIcon />, path: `/enterprise/${enterpriseId}/help` },
    { text: 'Settings', icon: <SettingsIcon />, path: `/enterprise/${enterpriseId}/settings` },
  ];

  const [workspaceOpen, setWorkspaceOpen] = React.useState(true);

  const workspaceItems = [
    { text: 'Teams', icon: <GroupIcon />, path: `/enterprise/${enterpriseId}/teams` },
    { text: 'Groups', icon: <PeopleIcon />, path: `/enterprise/${enterpriseId}/groups` },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Box sx={{ width: 260, borderRight: '1px solid #e2e8f0', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: '#3b82f6' }}>{enterpriseId?.slice(-2)}</Avatar>
          <Box>
            <Typography fontWeight={700}>Enterprise</Typography>
            <Typography variant="caption" color="text.secondary">{enterpriseId}</Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <List>
          {items.slice(0, 2).map((it) => (
            <ListItemButton key={it.text} onClick={() => navigate(it.path)}>
              <ListItemIcon>{it.icon}</ListItemIcon>
              <ListItemText primary={it.text} />
            </ListItemButton>
          ))}

          {/* Workspace block placed here so it appears above Data */}
          <ListItemButton onClick={() => setWorkspaceOpen(s => !s)}>
            <ListItemIcon><GroupIcon /></ListItemIcon>
            <ListItemText primary="Workspace" />
            {workspaceOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={workspaceOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {workspaceItems.map((it) => (
                <ListItemButton key={it.text} sx={{ pl: 4 }} onClick={() => navigate(it.path)}>
                  <ListItemIcon>{it.icon}</ListItemIcon>
                  <ListItemText primary={it.text} />
                </ListItemButton>
              ))}
            </List>
          </Collapse>

          {items.slice(2).map((it) => (
            <ListItemButton key={it.text} onClick={() => navigate(it.path)}>
              <ListItemIcon>{it.icon}</ListItemIcon>
              <ListItemText primary={it.text} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        {children}
      </Box>
    </Box>
  );
};

export default EnterpriseLayout;
