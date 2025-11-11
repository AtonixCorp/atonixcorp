import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person,
  Logout,
  Settings,
  AccountCircle,
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginDialog from '../Auth/LoginDialog';
import ThemeToggle from '../ThemeToggle';
import BusinessIcon from '@mui/icons-material/Business';
import ConnectWalletButton from '../ConnectWalletButton';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout, isOrganizationRegistered } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const handleLoginOpen = () => {
    setLoginOpen(true);
  };

  const handleLoginClose = () => {
    setLoginOpen(false);
  };

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: 'Teams', path: '/teams' },
    { name: 'Focus Areas', path: '/focus-areas' },
    { name: 'Resources', path: '/resources' },
    { name: 'Community', path: '/community' },
    { name: 'Contact', path: '/contact' },
    { name: 'Roadmap', path: '/roadmap' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 700 }}>
        AtonixCorp
      </Typography>
      <List>
        {navigation.map((item) => (
          <ListItem
            key={item.name}
            component={Link}
            to={item.path}
            sx={{
              textDecoration: 'none',
              // Use darker theme text on mobile (active items should be dark)
              color: isActivePath(item.path) ? 'text.primary' : 'text.secondary',
              borderRadius: '12px',
              mx: 1,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemText
              primary={item.name}
              primaryTypographyProps={{
                fontWeight: isActivePath(item.path) ? 600 : 400,
              }}
            />
          </ListItem>
        ))}
      </List>
      {/* Theme toggle in drawer for mobile users */}
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
        <ThemeToggle />
              <Box sx={{ ml: 1 }}>
                <ConnectWalletButton />
              </Box>
      </Box>
      {/* Mobile auth actions: show Sign In / Sign Up when unauthenticated, else show dashboard/profile/logout */}
      <Box sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.06)', mt: 2 }}>
        {!isAuthenticated ? (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={(e) => { e.stopPropagation(); handleLoginOpen(); }}
              sx={{ borderRadius: '12px', px: 2 }}
            >
              Sign In
            </Button>
            <Button
              component={Link}
              to="/signup"
              variant="contained"
              onClick={(e) => e.stopPropagation()}
              sx={{ borderRadius: '12px', px: 2, background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)' }}
            >
              Sign Up
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              component={Link}
              to={isOrganizationRegistered ? '/dashboard/enterprise' : '/dashboard'}
              variant="text"
              onClick={(e) => e.stopPropagation()}
              sx={{ justifyContent: 'flex-start', color: 'text.primary', fontWeight: 600 }}
            >
              {isOrganizationRegistered ? 'Enterprise Dashboard' : 'Dashboard'}
            </Button>
            <Button
              variant="text"
              onClick={(e) => { e.stopPropagation(); handleLogout(); }}
              sx={{ justifyContent: 'flex-start', color: '#ef4444' }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          // Make AppBar solid black on small screens and keep translucent white on md+
          backgroundColor: { xs: 'rgba(0,0,0,1)', md: 'rgba(255, 255, 255, 0.95)' },
          backdropFilter: 'blur(20px)',
          borderBottom: { xs: 'none', md: '1px solid #e2e8f0' },
          color: { xs: 'white', md: '#1e293b' },
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
                borderRadius: '12px',
                p: 1,
                mr: 2,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
                },
              }}
            >
              <BusinessIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                // white on mobile, gradient clipped text on md+
                color: { xs: 'white', md: '#1e293b' },
                fontWeight: 800,
                fontSize: '1.5rem',
                background: { md: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)' },
                backgroundClip: { md: 'text' },
                WebkitBackgroundClip: { md: 'text' },
                WebkitTextFillColor: { xs: 'white', md: 'transparent' },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              AtonixCorp
            </Typography>
          </Box>

            {isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                  // adjust mobile hamburger appearance to sit on dark header
                  backgroundColor: { xs: 'rgba(255,255,255,0.08)', md: 'rgba(59, 130, 246, 0.1)' },
                  color: { xs: 'white', md: '#3b82f6' },
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: { xs: 'rgba(255,255,255,0.12)', md: 'rgba(59, 130, 246, 0.2)' },
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <MenuIcon />
              </IconButton>
              {/* Theme toggle available on mobile for easy access */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ThemeToggle />
                <Box sx={{ ml: 1 }}>
                  <ConnectWalletButton />
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  component={Link}
                  to={item.path}
                  sx={{
                    // Use a darker neutral on md+ (better contrast on white header).
                    // On xs make nav text dark so it remains readable when shown in compact contexts.
                    color: isActivePath(item.path) ? { md: '#3b82f6', xs: '#0f172a' } : { md: '#1f2937', xs: '#0f172a' },
                    fontWeight: isActivePath(item.path) ? 600 : 500,
                    fontSize: '0.95rem',
                    px: 2,
                    py: 1,
                    borderRadius: '12px',
                    position: 'relative',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.08)',
                      color: '#3b82f6',
                      transform: 'translateY(-1px)',
                    },
                    '&::after': isActivePath(item.path) ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '20px',
                      height: '3px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '2px',
                    } : {},
                  }}
                >
                  {item.name}
                </Button>
              ))}

              <ThemeToggle />

              {isAuthenticated && user ? (
                <Box sx={{ ml: 2 }}>
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    sx={{
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        borderColor: '#3b82f6',
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
                      },
                    }}
                  >
                    <Avatar
                      src={user.avatar}
                      sx={{
                        width: 36,
                        height: 36,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
                        fontWeight: 600,
                      }}
                    >
                      {user.first_name[0]}
                    </Avatar>
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    sx={{
                      '& .MuiPaper-root': {
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        backdropFilter: 'blur(20px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        mt: 1,
                        minWidth: '200px',
                      },
                    }}
                  >
                    <MenuItem disabled sx={{ opacity: 1, cursor: 'default' }}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: '#1e293b' }}>
                          {user.first_name} {user.last_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          @{user.username}
                        </Typography>
                      </Box>
                    </MenuItem>
                    <Divider sx={{ my: 1, backgroundColor: '#e2e8f0' }} />
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        navigate(isOrganizationRegistered ? '/dashboard/enterprise' : '/dashboard');
                      }}
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
                      <BusinessIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {isOrganizationRegistered ? 'Enterprise Dashboard' : 'Dashboard'}
                      </Typography>
                    </MenuItem>
                    <MenuItem
                      onClick={handleClose}
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
                      <AccountCircle sx={{ mr: 2, color: 'text.secondary' }} />
                      <Typography variant="body2">Profile</Typography>
                    </MenuItem>
                    <MenuItem
                      onClick={handleClose}
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
                      <Settings sx={{ mr: 2, color: 'text.secondary' }} />
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
                      <Logout sx={{ mr: 2, color: '#ef4444' }} />
                      <Typography variant="body2" sx={{ color: '#ef4444' }}>Logout</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
                  <Button
                    onClick={handleLoginOpen}
                    startIcon={<Person />}
                    variant="outlined"
                    sx={{
                      borderColor: '#3b82f6',
                      color: '#3b82f6',
                      borderRadius: '12px',
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                        borderColor: '#3b82f6',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    component={Link}
                    to="/signup"
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
                      borderRadius: '12px',
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      boxShadow: 'none',
                      color: 'white',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                      },
                    }}
                  >
                    Sign Up
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid #e2e8f0',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Authentication Dialogs */}
      <LoginDialog
        open={loginOpen}
        onClose={handleLoginClose}
      />
    </>
  );
};

export default Header;
