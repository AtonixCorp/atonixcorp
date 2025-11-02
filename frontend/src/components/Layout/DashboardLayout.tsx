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
  Chip,
  useTheme,
  useMediaQuery,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Business as ProjectsIcon,
  Group as TeamsIcon,
  TrackChanges as FocusAreasIcon,
  LibraryBooks as ResourcesIcon,
  Storefront as StorefrontIcon,
  Forum as CommunityIcon,
  ContactMail as ContactIcon,
  Analytics as AnalyticsIcon,
  Task as TasksIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  ExpandLess,
  ExpandMore,
  Folder,
  Assignment,
  // People (unused)
  Timeline,
  Help as HelpIcon,
  AccountBalance as EnterpriseIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const _drawerWidth = 280;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  text: string;
  icon: React.ReactNode;
  path?: string;
  badge?: number;
  children?: NavItem[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const { user, logout, isOrganizationRegistered } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>(['projects', 'workspace']);

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

  const toggleExpanded = (item: string) => {
    setExpandedItems(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navigationItems: NavItem[] = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
    },
    ...(isOrganizationRegistered ? [{
      text: 'Enterprise',
      icon: <EnterpriseIcon />,
      path: '/dashboard/enterprise',
    }] : []),
    {
      text: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/dashboard/analytics',
      badge: 3,
    },
    {
      text: 'My Tasks',
      icon: <TasksIcon />,
      path: '/dashboard/tasks',
      badge: 12,
    },
    {
      text: 'Schedule',
      icon: <ScheduleIcon />,
      path: '/dashboard/schedule',
    },
    {
      text: 'Projects',
      icon: <ProjectsIcon />,
      children: [
        {
          text: 'All Projects',
          icon: <Folder />,
          path: '/dashboard/projects',
        },
        {
          text: 'My Projects',
          icon: <Assignment />,
          path: '/dashboard/my-projects',
          badge: 5,
        },
        {
          text: 'Project Analytics',
          icon: <Timeline />,
          path: '/dashboard/project-analytics',
        },
      ],
    },
    {
      text: 'Enterprise',
      icon: <StorefrontIcon />,
      path: '/enterprise/register',
    },
      {
        text: 'Focus Areas',
        icon: <FocusAreasIcon />,
        path: '/dashboard/focus-areas',
      },
      {
        text: 'Resources',
        icon: <ResourcesIcon />,
        path: '/dashboard/resources',
      },
      {
        text: 'Marketplace',
        icon: <StorefrontIcon />,
        path: '/dashboard/marketplace',
      },
    // Workspace moved inside Enterprise for enterprise-scoped access
    {
      text: 'Community',
      icon: <CommunityIcon />,
      path: '/dashboard/community',
      badge: 8,
    },
    {
      text: 'Contact',
      icon: <ContactIcon />,
      path: '/dashboard/contact',
    },
  ];

  const bottomNavigationItems: NavItem[] = [
    {
      text: 'Security',
      icon: <SecurityIcon />,
      path: '/dashboard/security',
    },
    {
      text: 'Help & Support',
      icon: <HelpIcon />,
      path: '/dashboard/help',
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/dashboard/settings',
    },
  ];

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const isExpanded = expandedItems.includes(item.text.toLowerCase().replace(' ', ''));
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.path ? isActivePath(item.path) : false;

    return (
      <React.Fragment key={item.text}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                toggleExpanded(item.text.toLowerCase().replace(' ', ''));
              } else if (item.path) {
                handleNavigation(item.path);
              }
            }}
            sx={{
              pl: 2 + (depth * 2),
              pr: 2,
              py: 1,
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
              <Chip
                label={item.badge}
                size="small"
                sx={{
                  height: '20px',
                  fontSize: '0.75rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            )}
            {hasChildren && (
              <IconButton size="small" sx={{ color: '#64748b' }}>
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderNavItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
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
            background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AtonixCorp
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Professional Dashboard
        </Typography>
      </Box>

      {/* User Profile */}
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
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
          }}
          onClick={handleProfileMenu}
        >
          <Avatar
            src={user?.avatar}
            sx={{
              width: 48,
              height: 48,
              mr: 2,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
              border: '2px solid white',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            {user?.first_name?.[0] || 'U'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} color="#1e293b">
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              @{user?.username}
            </Typography>
          </Box>
          <Badge
            variant="dot"
            color="success"
            sx={{
              '& .MuiBadge-badge': {
                right: 8,
                top: 8,
              },
            }}
          />
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
          width: { lg: `calc(100% - ${_drawerWidth}px)` },
          ml: { lg: `${_drawerWidth}px` },
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
            Dashboard
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
        sx={{ width: { lg: _drawerWidth }, flexShrink: { lg: 0 } }}
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
              width: _drawerWidth,
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
              width: _drawerWidth,
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
          width: { lg: `calc(100% - ${_drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
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

export default DashboardLayout;
