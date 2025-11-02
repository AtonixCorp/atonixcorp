import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Group as GroupIcon,
  Storage as StorageIcon,
  Monitor as MonitorIcon,
  People as PeopleIcon,
  Folder as FolderIcon,
  TableChart as TableChartIcon,
  CloudUpload as CloudUploadIcon,
  AccountTree as AccountTreeIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;

interface EnterpriseLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  text: string;
  icon: React.ReactNode;
  path?: string;
  badge?: number;
}

const EnterpriseLayout: React.FC<EnterpriseLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const { user, logout, organization } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleCloseProfileMenu();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navigationItems: NavItem[] = [
    {
      text: 'Company Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard/enterprise',
    },
    {
      text: 'Team Dashboard',
      icon: <PeopleIcon />,
      path: '/dashboard/enterprise/team',
    },
    {
      text: 'User Management',
      icon: <PersonIcon />,
      path: '/dashboard/enterprise/users',
    },
    {
      text: 'Group Management',
      icon: <GroupIcon />,
      path: '/dashboard/enterprise/groups',
    },
    {
      text: 'Data Reports',
      icon: <AssessmentIcon />,
      path: '/dashboard/enterprise/reports',
    },
    {
      text: 'Data Migration',
      icon: <CloudUploadIcon />,
      path: '/dashboard/enterprise/migration',
    },
    {
      text: 'Model Repository',
      icon: <FolderIcon />,
      path: '/dashboard/enterprise/models',
    },
    {
      text: 'Monitoring',
      icon: <MonitorIcon />,
      path: '/dashboard/enterprise/monitoring',
    },
    {
      text: 'Audit Logs',
      icon: <TableChartIcon />,
      path: '/dashboard/enterprise/audit',
    },
    {
      text: 'Federation',
      icon: <AccountTreeIcon />,
      path: '/dashboard/enterprise/federation',
    },
  ];

  const bottomNavigationItems: NavItem[] = [
    {
      text: 'Security',
      icon: <SecurityIcon />,
      path: '/dashboard/security',
    },
    {
      text: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/dashboard/analytics',
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/dashboard/settings',
    },
  ];

  const renderNavItem = (item: NavItem) => {
    const isActive = item.path ? isActivePath(item.path) : false;

    return (
      <ListItem key={item.text} disablePadding>
        <ListItemButton
          onClick={() => item.path && handleNavigation(item.path)}
          sx={{
            pl: 2,
            pr: 2,
            py: 1.5,
            borderRadius: '12px',
            mx: 1,
            mb: 0.5,
            backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              transform: 'translateX(4px)',
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <ListItemIcon
            sx={{
              color: isActive ? '#3b82f6' : '#64748b',
              minWidth: 40,
              '& .MuiSvgIcon-root': {
                fontSize: '1.25rem',
              },
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.text}
            primaryTypographyProps={{
              fontSize: '0.95rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#3b82f6' : '#1e293b',
            }}
          />
          {item.badge && (
            <Badge
              badgeContent={item.badge}
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.7rem',
                  height: '18px',
                  minWidth: '18px',
                },
              }}
            />
          )}
        </ListItemButton>
      </ListItem>
    );
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        color: '#1e293b',
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid #e2e8f0',
          background: 'rgba(255, 255, 255, 0.7)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: '#1e293b',
          }}
        >
          {organization?.name || 'Enterprise'}
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          Enterprise Dashboard
        </Typography>
      </Box>

      {/* Organization Info */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #e2e8f0',
          background: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid #e2e8f0',
          }}
        >
          <BusinessIcon
            sx={{
              width: 48,
              height: 48,
              mr: 2,
              color: '#3b82f6',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              p: 1,
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1e293b' }}>
              {organization?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              {organization?.domain}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        <List>
          {navigationItems.map((item) => renderNavItem(item))}
        </List>
      </Box>

      {/* Bottom Navigation */}
      <Box sx={{ borderTop: '1px solid #e2e8f0', background: 'rgba(255, 255, 255, 0.5)' }}>
        <List>
          {bottomNavigationItems.map((item) => renderNavItem(item))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Top AppBar - Mobile Only */}
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          display: { lg: 'none' },
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #e2e8f0',
          color: '#1e293b',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Enterprise Dashboard
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              borderRight: '1px solid #e2e8f0',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f8fafc',
        }}
      >
        {/* Mobile top spacing */}
        <Toolbar sx={{ display: { lg: 'none' } }} />

        {/* Content - Full Width with No Gaps */}
        <Box
          sx={{
            flexGrow: 1,
            width: '100%',
            overflow: 'auto',
            margin: 0,
            padding: 0,
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseProfileMenu}
        onClick={handleCloseProfileMenu}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            mt: 1,
            minWidth: 200,
            color: '#1e293b',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => handleNavigation('/dashboard/profile')}
          sx={{
            borderRadius: '8px',
            mx: 1,
            color: '#1e293b',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              transform: 'translateX(4px)',
            },
          }}
        >
          <PersonIcon sx={{ mr: 2, color: '#64748b' }} />
          <Typography variant="body2">Profile</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => handleNavigation('/dashboard/settings')}
          sx={{
            borderRadius: '8px',
            mx: 1,
            color: '#1e293b',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              transform: 'translateX(4px)',
            },
          }}
        >
          <SettingsIcon sx={{ mr: 2, color: '#64748b' }} />
          <Typography variant="body2">Settings</Typography>
        </MenuItem>
        <Divider sx={{ my: 1, backgroundColor: '#e2e8f0' }} />
        <MenuItem
          onClick={handleLogout}
          sx={{
            borderRadius: '8px',
            mx: 1,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              transform: 'translateX(4px)',
            },
          }}
        >
          <LogoutIcon sx={{ mr: 2, color: '#ef4444' }} />
          <Typography variant="body2" sx={{ color: '#ef4444' }}>Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default EnterpriseLayout;
