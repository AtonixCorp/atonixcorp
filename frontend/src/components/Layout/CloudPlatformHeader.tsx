import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../contexts/AuthContext';
import LoginDialog from '../Auth/LoginDialog';
import SignupDialog from '../Auth/SignupDialog';

const CloudPlatformHeader: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const primaryBlue = '#0b1220';
  const accentCyan = '#14b8a6';

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const navItems = [
    { label: 'Products', path: '/', submenu: ['Dedicated Servers', 'VPS', 'Public Cloud'] },
    { label: 'Resources', path: '/resources', submenu: ['Blog', 'Docs', 'Use Cases'] },
  ];

  const utilitiesItems = [
    { label: 'Support', path: '/support' },
    { label: 'Contact Sales', path: '/contact' },
    { label: 'Account', path: '/account' },
  ];

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${primaryBlue} 0%, #07121a 100%)`,
        borderBottom: `1px solid ${accentCyan}33`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 1,
          }}
        >
          {/* Logo */}
          <Box
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                background: `linear-gradient(135deg, ${accentCyan} 0%, #0ea5a4 100%)`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: 'white',
                fontSize: '1.2rem',
              }}
            >
              ☁️
            </Box>
            <Box
              sx={{
                fontWeight: 800,
                fontSize: '1.3rem',
                color: 'white',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              AtonixCorp
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Stack direction="row" gap={0.5} alignItems="center">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                      color: '#e6eef7',
                      fontWeight: 600,
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: `${accentCyan}22`,
                        color: accentCyan,
                      },
                    }}
                >
                  {item.label}
                </Button>
              ))}
              
              {/* Divider */}
              <Box sx={{ width: '1px', height: 24, bgcolor: `${accentCyan}44`, mx: 1 }} />
              
              {/* Utilities */}
              {utilitiesItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  size="small"
                  sx={{
                      color: '#e6eef7',
                      fontWeight: 500,
                      px: 1.5,
                      py: 0.5,
                      fontSize: '0.85rem',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: accentCyan,
                      },
                    }}
                >
                  {item.label}
                </Button>
              ))}
              
              {/* Auth buttons / user avatar */}
              {user ? (
                <>
                  <IconButton
                    onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                    sx={{ ml: 1 }}
                  >
                    <Avatar sx={{ width: 34, height: 34, bgcolor: accentCyan, color: primaryBlue, fontWeight: 700, fontSize: '0.9rem' }}>
                      {user.first_name?.[0] || user.username?.[0] || 'U'}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={() => setUserMenuAnchor(null)}
                    PaperProps={{ sx: { minWidth: 200, mt: 1 } }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight={700}>{user.first_name} {user.last_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => { setUserMenuAnchor(null); navigate('/account'); }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1 }} /> My Account
                    </MenuItem>
                    <MenuItem onClick={() => { setUserMenuAnchor(null); logout(); }}>
                      <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Sign Out
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    size="small"
                    sx={{ color: '#e6eef7', fontWeight: 500, fontSize: '0.85rem', ml: 1 }}
                    onClick={() => setLoginOpen(true)}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      bgcolor: accentCyan,
                      color: primaryBlue,
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      ml: 1,
                      '&:hover': { bgcolor: '#0ea5a4' },
                    }}
                    onClick={() => setSignupOpen(true)}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </Stack>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ color: '#e6eef7' }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}
        </Toolbar>

        {/* Mobile Drawer */}
        <Drawer
          anchor="top"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              bgcolor: primaryBlue,
              borderBottom: `1px solid ${accentCyan}33`,
            },
          }}
        >
          <List sx={{ width: '100%', pt: 2 }}>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate(item.path)}
                  sx={{ color: '#e6eef7', fontWeight: 600, '&:hover': { bgcolor: `${accentCyan}22` } }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <Box sx={{ borderTop: `1px solid ${accentCyan}33`, my: 1 }} />
            {utilitiesItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate(item.path)}
                  sx={{ color: '#e6eef7', fontSize: '0.9rem', '&:hover': { bgcolor: `${accentCyan}22` } }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <Box sx={{ p: 1, display: 'flex', gap: 1 }}>
              {user ? (
                <Button fullWidth variant="outlined" sx={{ borderColor: accentCyan, color: accentCyan }} onClick={() => { logout(); setMobileOpen(false); }}>
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button fullWidth variant="outlined" sx={{ borderColor: accentCyan, color: accentCyan }} onClick={() => { setMobileOpen(false); setLoginOpen(true); }}>
                    Sign In
                  </Button>
                  <Button fullWidth variant="contained" sx={{ bgcolor: accentCyan, color: primaryBlue, fontWeight: 700 }} onClick={() => { setMobileOpen(false); setSignupOpen(true); }}>
                    Get Started
                  </Button>
                </>
              )}
            </Box>
          </List>
        </Drawer>
      </Container>

      {/* Auth Dialogs */}
      <LoginDialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToSignup={() => { setLoginOpen(false); setSignupOpen(true); }}
      />
      <SignupDialog
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSwitchToLogin={() => { setSignupOpen(false); setLoginOpen(true); }}
      />
    </AppBar>
  );
};

export default CloudPlatformHeader;
