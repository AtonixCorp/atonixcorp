import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useLocation } from 'react-router-dom';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ___ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(___ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Light theme configuration
const ___lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00E0FF',
      dark: '#00C8E5',
      light: '#67EEFF',
      contrastText: '#0A0F1F',
    },
    secondary: {
      main: '#0A0F1F',
      dark: '#060A16',
      light: '#1A2038',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      // Darken default text colors for improved contrast across the app
      primary: '#0f172a',
      secondary: '#475569',
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    success: {
      main: '#10b981',
      dark: '#059669',
      light: '#34d399',
    },
    warning: {
      main: '#f59e0b',
      dark: '#d97706',
      light: '#fbbf24',
    },
    error: {
      main: '#ef4444',
      dark: '#dc2626',
      light: '#f87171',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '3.5rem',
      lineHeight: 1.1,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.75rem',
      lineHeight: 1.12,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2.25rem',
      lineHeight: 1.15,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.875rem',
      lineHeight: 1.3,
      letterSpacing: '-0.015em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.35,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '-0.005em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.42,
      letterSpacing: '-0.003em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.4,
      letterSpacing: '-0.002em',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '-0.005em',
    },
  },
  shape: {
    borderRadius: 2,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.05)',
    '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
  ],
  components: {
      MuiTypography: {
        styleOverrides: {
          root: {
            // Default typography color should use the theme's primary text color
            color: '#0f172a',
          },
        },
      },
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--color-primary': '#0A0F1F',
          '--color-primary-contrast': '#FFFFFF',
          '--color-accent': '#00E0FF',
          '--color-accent-hover': '#00C8E5',
          '--color-text-primary': '#FFFFFF',
          '--color-text-secondary': '#A0A8B5',
          '--color-border': '#1F2937',
          '--color-surface': '#111827',
          '--dashboard-background': '#FFFFFF',
          '--dashboard-surface': '#FFFFFF',
          '--dashboard-surface-subtle': '#F9FAFB',
          '--dashboard-surface-hover': '#F3F4F6',
          '--dashboard-border': '#E5E7EB',
          '--dashboard-border-strong': '#D1D5DB',
          '--dashboard-text-primary': '#111827',
          '--dashboard-text-secondary': '#6B7280',
          '--dashboard-text-tertiary': '#9CA3AF',
          '--radius-small': '2px',
          '--radius-none': '0px',
        },
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          scrollBehavior: 'smooth',
        },
        body: {
          backgroundColor: '#FFFFFF',
          color: '#0A0F1F',
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontFeatureSettings: '"cv11", "ss01"',
          fontVariationSettings: '"opsz" 32',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        'input, button, textarea, select': {
          fontFamily: 'inherit',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 2,
          fontWeight: 600,
          fontSize: '0.95rem',
          lineHeight: 1.2,
          padding: '10px 20px',
          boxShadow: 'none',
          transition: 'background-color 0.12s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.12s cubic-bezier(0.4, 0, 0.2, 1), color 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderWidth: 1,
          '&:hover': {
            borderWidth: 1,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          boxShadow: 'none',
          transition: 'border-color 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: '#cbd5e1',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          border: '1px solid #e2e8f0',
        },
        elevation1: {
          boxShadow: 'none',
        },
        elevation2: {
          boxShadow: 'none',
        },
        elevation3: {
          boxShadow: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #e2e8f0',
          color: '#1e293b',
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          fontWeight: 500,
          transition: 'background-color 0.12s cubic-bezier(0.4, 0, 0.2, 1), color 0.12s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          transition: 'background-color 0.12s cubic-bezier(0.4, 0, 0.2, 1), color 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'rgba(0, 224, 255, 0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'border-color 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
            '&.Mui-focused': {
              boxShadow: 'none',
            },
          },
        },
      },
    },
  },
});

// Dark theme configuration
const ___darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00E0FF',
      dark: '#00C8E5',
      light: '#67EEFF',
      contrastText: '#0A0F1F',
    },
    secondary: {
      main: '#0A0F1F',
      dark: '#060A16',
      light: '#1A2038',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0A0F1F',
      paper:   '#111827',
    },
    text: {
      primary:   '#ffffff',
      secondary: 'rgba(255,255,255,0.75)',
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    success: {
      main: '#34d399',
      dark: '#10b981',
      light: '#6ee7b7',
    },
    warning: {
      main: '#fbbf24',
      dark: '#f59e0b',
      light: '#fcd34d',
    },
    error: {
      main: '#f87171',
      dark: '#ef4444',
      light: '#fca5a5',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '3.5rem',
      lineHeight: 1.1,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.75rem',
      lineHeight: 1.12,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2.25rem',
      lineHeight: 1.15,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.875rem',
      lineHeight: 1.3,
      letterSpacing: '-0.015em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.35,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '-0.005em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.42,
      letterSpacing: '-0.003em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.4,
      letterSpacing: '-0.002em',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '-0.005em',
    },
  },
  shape: {
    borderRadius: 2,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.3)',
    '0px 4px 6px -1px rgba(0, 0, 0, 0.4), 0px 2px 4px -1px rgba(0, 0, 0, 0.3)',
    '0px 10px 15px -3px rgba(0, 0, 0, 0.4), 0px 4px 6px -2px rgba(0, 0, 0, 0.3)',
    '0px 20px 25px -5px rgba(0, 0, 0, 0.4), 0px 10px 10px -5px rgba(0, 0, 0, 0.3)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--color-primary': '#0A0F1F',
          '--color-primary-contrast': '#FFFFFF',
          '--color-accent': '#00E0FF',
          '--color-accent-hover': '#00C8E5',
          '--color-text-primary': '#FFFFFF',
          '--color-text-secondary': '#A0A8B5',
          '--color-border': '#1F2937',
          '--color-surface': '#111827',
          '--dashboard-background': '#0A0F1F',
          '--dashboard-surface': '#111827',
          '--dashboard-surface-subtle': '#1E293B',
          '--dashboard-surface-hover': '#334155',
          '--dashboard-border': '#334155',
          '--dashboard-border-strong': '#475569',
          '--dashboard-text-primary': '#FFFFFF',
          '--dashboard-text-secondary': '#FFFFFF',
          '--dashboard-text-tertiary': '#FFFFFF',
          '--radius-small': '2px',
          '--radius-none': '0px',
        },
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          scrollBehavior: 'smooth',
        },
        body: {
          backgroundColor: '#0A0F1F',
          fontFeatureSettings: '"cv11", "ss01"',
          fontVariationSettings: '"opsz" 32',
        },
      },
    },
      MuiTypography: {
        styleOverrides: {
          root: {
            // Use light color for typography in dark theme
            color: '#f1f5f9',
          },
        },
      },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 2,
          fontWeight: 600,
          fontSize: '0.95rem',
          lineHeight: 1.2,
          padding: '10px 20px',
          boxShadow: 'none',
          transition: 'background-color 0.12s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.12s cubic-bezier(0.4, 0, 0.2, 1), color 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderWidth: 1,
          '&:hover': {
            borderWidth: 1,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          border: '1px solid #334155',
          backgroundColor: '#1e293b',
          boxShadow: 'none',
          transition: 'border-color 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: '#475569',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          border: '1px solid #334155',
          backgroundColor: '#1e293b',
        },
        elevation1: {
          boxShadow: 'none',
        },
        elevation2: {
          boxShadow: 'none',
        },
        elevation3: {
          boxShadow: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #334155',
          color: '#f1f5f9',
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          fontWeight: 500,
          transition: 'background-color 0.12s cubic-bezier(0.4, 0, 0.2, 1), color 0.12s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          transition: 'background-color 0.12s cubic-bezier(0.4, 0, 0.2, 1), color 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'rgba(0, 224, 255, 0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'border-color 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
            '&.Mui-focused': {
              boxShadow: 'none',
            },
          },
        },
      },
    },
  },
});

interface CustomThemeProviderProps {
  children: ReactNode;
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({ children }) => {
  const location = useLocation();
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Check localStorage for saved theme preference
    const savedMode = localStorage.getItem('themeMode') as ThemeMode;
    // Check system preference if no saved preference
    if (!savedMode) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return savedMode || 'light';
  });

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no manual preference is saved
      if (!localStorage.getItem('themeMode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const isDashboardRoute =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/developer/Dashboard') ||
    location.pathname.startsWith('/marketing-dashboard') ||
    location.pathname.startsWith('/domains/dashboard') ||
    location.pathname.startsWith('/monitor-dashboard') ||
    location.pathname.startsWith('/groups');

  const effectiveMode: ThemeMode = isDashboardRoute ? mode : 'light';

  const theme = effectiveMode === 'dark' ? ___darkTheme : ___lightTheme;

  return (
    <___ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </___ThemeContext.Provider>
  );
};
