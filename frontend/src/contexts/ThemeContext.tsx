import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

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
      main: '#1e293b', // Modern dark slate
      dark: '#0f172a',
      light: '#334155',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3b82f6', // Professional blue
      dark: '#2563eb',
      light: '#60a5fa',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
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
    fontFamily: '"Inter", "SF Pro Display", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
      lineHeight: 1.1,
      letterSpacing: '-0.025em',
      background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.75rem',
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.25,
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
      lineHeight: 1.7,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      letterSpacing: '0.01071em',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
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
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          scrollBehavior: 'smooth',
        },
        body: {
          backgroundColor: '#f8fafc',
          fontFeatureSettings: '"cv11", "ss01"',
          fontVariationSettings: '"opsz" 32',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          padding: '10px 24px',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            borderColor: '#cbd5e1',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #e2e8f0',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
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
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          '&:hover': {
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.05)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&.Mui-focused': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
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
      main: '#60a5fa', // Lighter blue for dark mode
      dark: '#3b82f6',
      light: '#93c5fd',
      contrastText: '#0f172a',
    },
    secondary: {
      main: '#f59e0b', // Warm orange for dark mode
      dark: '#d97706',
      light: '#fbbf24',
      contrastText: '#0f172a',
    },
    background: {
      default: '#0f172a', // Dark navy
      paper: '#1e293b', // Darker slate
    },
    text: {
      primary: '#f1f5f9', // Light gray
      secondary: '#cbd5e1', // Medium gray
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
    fontFamily: '"Inter", "SF Pro Display", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
      lineHeight: 1.1,
      letterSpacing: '-0.025em',
      background: 'linear-gradient(135deg, #60a5fa 0%, #f59e0b 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.75rem',
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.25,
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
      lineHeight: 1.7,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      letterSpacing: '0.01071em',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
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
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          scrollBehavior: 'smooth',
        },
        body: {
          backgroundColor: '#0f172a',
          fontFeatureSettings: '"cv11", "ss01"',
          fontVariationSettings: '"opsz" 32',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          padding: '10px 24px',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #334155',
          backgroundColor: '#1e293b',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
            borderColor: '#475569',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #334155',
          backgroundColor: '#1e293b',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        },
        elevation3: {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
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
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          '&:hover': {
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.05)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&.Mui-focused': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.1)',
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

  const theme = mode === 'dark' ? ___darkTheme : ___lightTheme;

  return (
    <___ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </___ThemeContext.Provider>
  );
};
