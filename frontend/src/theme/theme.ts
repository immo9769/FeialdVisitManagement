import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4F46E5', // Vibrant Indigo
      light: '#6366F1',
      dark: '#3730A3',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0EA5E9', // Electric Cyan / Sky
      light: '#38BDF8',
      dark: '#0284C7',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#10B981', // Emerald Success
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B', // Warm Amber
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444', // Rose Red
      light: '#F87171',
      dark: '#DC2626',
    },
    info: {
      main: '#3B82F6', // Royal Blue
      light: '#60A5FA',
      dark: '#1D4ED8',
    },
    background: {
      default: '#F8FAFC', // Modern Slate-50 backdrop
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A', // Slate-900 high contrast
      secondary: '#64748B', // Slate-500
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.025em',
      color: '#0F172A',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#0F172A',
    },
    h6: {
      fontWeight: 700,
      letterSpacing: '-0.015em',
      color: '#0F172A',
    },
    subtitle1: {
      fontWeight: 600,
      color: '#1E293B',
    },
    subtitle2: {
      fontWeight: 600,
      color: '#334155',
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.84375rem',
      lineHeight: 1.45,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: 'none',
          padding: '8px 18px',
          fontWeight: 600,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1.5px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.94) 0%, rgba(99, 102, 241, 0.88) 100%)',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 4px 16px -2px rgba(79, 70, 229, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 1) 0%, rgba(99, 102, 241, 0.96) 100%)',
            boxShadow: '0 8px 24px -3px rgba(79, 70, 229, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.92) 0%, rgba(56, 189, 248, 0.86) 100%)',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.28)',
          boxShadow: '0 4px 16px -2px rgba(14, 165, 233, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 1) 0%, rgba(56, 189, 248, 0.95) 100%)',
            boxShadow: '0 8px 24px -3px rgba(14, 165, 233, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.45)',
          },
        },
        outlined: {
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
          borderColor: 'rgba(203, 213, 225, 0.85)',
          borderWidth: '1px',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          '&:hover': {
            borderWidth: '1px',
            borderColor: 'rgba(79, 70, 229, 0.4)',
            backgroundColor: 'rgba(79, 70, 229, 0.06)',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.12)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
          borderRadius: 14,
          border: '1px solid rgba(226, 232, 240, 0.9)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 14,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          backgroundColor: '#F8FAFC',
          color: '#475569',
          fontSize: '0.78rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          borderBottom: '2px solid #E2E8F0',
          paddingTop: 12,
          paddingBottom: 12,
        },
        root: {
          paddingTop: 12,
          paddingBottom: 12,
          fontSize: '0.875rem',
          borderColor: '#F1F5F9',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: '#F8FAFC !important',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#94A3B8',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4F46E5',
            borderWidth: '2px',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
        },
      },
    },
  },
});
