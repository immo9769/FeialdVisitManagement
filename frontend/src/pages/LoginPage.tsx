import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton,
  Grid,
  Chip,
  Avatar,
  Paper,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Person,
  AdminPanelSettings,
  SupervisorAccount,
  BusinessCenter,
  Engineering,
  CheckCircle,
  ArrowForward,
  Storage,
  VpnKey,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AccountInfo } from '@azure/msal-browser';
import { useAuth } from '../context/AuthContext';
import { msalInstance, loginRequest, getCurrentRedirectUri } from '../config/msalConfig';

// Microsoft official 4-color square logo
const MicrosoftIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginRight: '10px', flexShrink: 0 }}
  >
    <path d="M1 1H10V10H1V1Z" fill="#F25022" />
    <path d="M11 1H20V10H11V1Z" fill="#7FBA00" />
    <path d="M1 11H10V20H1V11Z" fill="#00A4EF" />
    <path d="M11 11H20V20H11V11Z" fill="#FFB900" />
  </svg>
);

interface RolePreset {
  id: string;
  role: 'ADMIN' | 'MANAGER' | 'SALES_EXEC' | 'SERVICE_ENG';
  title: string;
  name: string;
  email: string;
  password: string;
  badge: string;
  badgeColor: 'error' | 'secondary' | 'warning' | 'info';
  themeColor: string;
  icon: React.ReactNode;
  branch: string;
  description: string;
}

const ROLE_PRESETS: RolePreset[] = [
  {
    id: 'admin',
    role: 'ADMIN',
    title: 'System Administrator',
    name: 'System Administrator',
    email: 'admin@crm.com',
    password: 'Password@123',
    badge: 'ADMIN',
    badgeColor: 'error',
    themeColor: '#4F46E5',
    icon: <AdminPanelSettings sx={{ fontSize: 24 }} />,
    branch: 'Mumbai HQ',
    description: 'Full administrative access: master tables, system config & all employee visit claims',
  },
  {
    id: 'manager',
    role: 'MANAGER',
    title: 'Branch Manager',
    name: 'Rajesh Patel',
    email: 'rajesh@crm.com',
    password: 'Password@123',
    badge: 'MANAGER',
    badgeColor: 'secondary',
    themeColor: '#0EA5E9',
    icon: <SupervisorAccount sx={{ fontSize: 24 }} />,
    branch: 'Mumbai HQ',
    description: 'Review claims inbox, mass approve/reject expenses, branch reporting & oversight',
  },
  {
    id: 'sales',
    role: 'SALES_EXEC',
    title: 'Sales Executive',
    name: 'Amit Sharma',
    email: 'amit@crm.com',
    password: 'Password@123',
    badge: 'SALES_EXEC',
    badgeColor: 'warning',
    themeColor: '#F59E0B',
    icon: <BusinessCenter sx={{ fontSize: 24 }} />,
    branch: 'Baroda Branch',
    description: 'Customer creation, contact management, daily visit itineraries & lead tracking',
  },
  {
    id: 'service',
    role: 'SERVICE_ENG',
    title: 'Field Service Engineer',
    name: 'Suresh Choudhary',
    email: 'suresh@crm.com',
    password: 'Password@123',
    badge: 'SERVICE_ENG',
    badgeColor: 'info',
    themeColor: '#10B981',
    icon: <Engineering sx={{ fontSize: 24 }} />,
    branch: 'Mumbai HQ',
    description: 'Field visit claims, machine demos, itemized fuel/toll mileage & bill uploads',
  },
];

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin@crm.com');
  const [password, setPassword] = useState('Password@123');
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msalLoading, setMsalLoading] = useState(false);
  const [isCheckingSso, setIsCheckingSso] = useState(true);
  const [detectedAccount, setDetectedAccount] = useState<AccountInfo | null>(null);
  const { login, loginWithMicrosoft, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Helper to clear any stale MSAL interaction locks from browser storage
  const clearMsalStorage = () => {
    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('msal') || key.includes('interaction') || key.includes('authority'))) {
          sessionStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('Could not clear sessionStorage:', e);
    }
  };

  const processMsalResponse = async (loginResponse: any) => {
    try {
      setMsalLoading(true);
      setError(null);
      const email =
        loginResponse.account?.username ||
        (loginResponse.idTokenClaims as any)?.preferred_username ||
        (loginResponse.idTokenClaims as any)?.email ||
        (loginResponse.idTokenClaims as any)?.upn;
      const name = loginResponse.account?.name || (loginResponse.idTokenClaims as any)?.name;
      const oid = (loginResponse.idTokenClaims as any)?.oid || loginResponse.account?.localAccountId;

      console.log('Authenticating with CRM backend for Microsoft account:', email, name);

      await loginWithMicrosoft({
        idToken: loginResponse.idToken,
        accessToken: loginResponse.accessToken,
        email: email,
        name: name,
        azureAdOid: oid,
      });

      sessionStorage.removeItem('auto_redirect_attempted');
      sessionStorage.removeItem('logged_out');
      navigate('/');
    } catch (err: any) {
      console.error('Failed to complete Microsoft login on backend:', err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to authenticate Microsoft profile with CRM server.';
      setError(errorMsg);
    } finally {
      setMsalLoading(false);
    }
  };

  // Initialize MSAL, handle redirects, and attempt automatic silent SSO
  useEffect(() => {
    let isMounted = true;

    // If user is already authenticated with CRM token, navigate immediately
    if (isAuthenticated) {
      navigate('/');
      return;
    }

    const initMsalAndAutoLogin = async () => {
      try {
        await msalInstance.initialize();

        // 1. Handle redirect promise if user arrived via redirect flow
        try {
          const redirectResponse = await msalInstance.handleRedirectPromise();
          if (redirectResponse && isMounted) {
            await processMsalResponse(redirectResponse);
            return;
          }
        } catch (redirErr: any) {
          console.warn('MSAL redirect promise note:', redirErr);
          // Clean up stale or orphan URL hash if state was missing/already consumed
          if (window.location.hash && window.location.hash.includes('code=')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }

        // 2. Check for existing cached Microsoft accounts
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0 && isMounted) {
          setDetectedAccount(accounts[0]);
        }

        // 3. If user explicitly clicked logout in this session, skip auto silent login
        const hasLoggedOut = sessionStorage.getItem('logged_out') === 'true';
        if (hasLoggedOut) {
          if (isMounted) setIsCheckingSso(false);
          return;
        }

        // 4. If cached account is found, try acquireTokenSilent
        if (accounts.length > 0 && isMounted) {
          try {
            console.log('Attempting silent token acquisition for cached account:', accounts[0].username);
            const silentResponse = await msalInstance.acquireTokenSilent({
              ...loginRequest,
              account: accounts[0],
            });
            if (silentResponse && isMounted) {
              await processMsalResponse(silentResponse);
              return;
            }
          } catch (silentErr) {
            console.log('Silent token acquisition from cache failed, trying ssoSilent...', silentErr);
          }
        }

        // 5. Try silent browser SSO via hidden iframe
        try {
          console.log('Attempting silent SSO with Microsoft Entra ID...');
          const ssoResponse = await msalInstance.ssoSilent(loginRequest);
          if (ssoResponse && isMounted) {
            await processMsalResponse(ssoResponse);
            return;
          }
        } catch (ssoErr) {
          console.log('Browser silent iframe SSO not available, attempting seamless direct SSO redirect...');
        }

        // 6. Automatic seamless direct SSO redirect if not previously attempted in this session
        const autoRedirectAttempted = sessionStorage.getItem('auto_redirect_attempted') === 'true';
        if (!autoRedirectAttempted && isMounted) {
          sessionStorage.setItem('auto_redirect_attempted', 'true');
          console.log('Initiating automatic zero-click Microsoft SSO redirect...');
          await msalInstance.loginRedirect({
            ...loginRequest,
            redirectUri: getCurrentRedirectUri(),
          });
          return;
        }
      } catch (err: any) {
        console.warn('MSAL initialization/SSO error:', err);
      } finally {
        if (isMounted) {
          setIsCheckingSso(false);
        }
      }
    };

    initMsalAndAutoLogin();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleSelectRole = (preset: RolePreset) => {
    setSelectedRole(preset.id);
    setUsername(preset.email);
    setPassword(preset.password);
    setError(null);
  };

  const handleInstantLogin = async (preset: RolePreset) => {
    handleSelectRole(preset);
    setError(null);
    try {
      await login(preset.email, preset.password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to authenticate. Please check your credentials.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to authenticate. Please check your credentials.');
    }
  };

  const handleMicrosoftLogin = async (forceAccountPicker: boolean = false) => {
    setError(null);
    setMsalLoading(true);
    sessionStorage.removeItem('logged_out');
    try {
      await msalInstance.initialize();

      // If an account is already detected and we're not forcing the picker, try silent token acquisition first
      if (detectedAccount && !forceAccountPicker) {
        try {
          const silentRes = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: detectedAccount,
          });
          if (silentRes) {
            await processMsalResponse(silentRes);
            return;
          }
        } catch (silentErr) {
          console.warn('Silent token acquire failed, proceeding to popup:', silentErr);
        }
      }

      const requestConfig: any = {
        ...loginRequest,
        redirectUri: getCurrentRedirectUri(),
        prompt: forceAccountPicker ? 'select_account' : undefined,
        loginHint: !forceAccountPicker && detectedAccount ? detectedAccount.username : undefined,
      };

      let loginResponse;
      try {
        loginResponse = await msalInstance.loginPopup(requestConfig);
      } catch (popupErr: any) {
        console.warn('Popup login error, handling fallback:', popupErr);
        if (popupErr?.errorCode === 'user_cancelled') {
          setError('Microsoft sign-in was cancelled.');
          return;
        }
        if (
          popupErr?.errorCode === 'interaction_in_progress' ||
          popupErr?.message?.includes('interaction_in_progress')
        ) {
          clearMsalStorage();
          await msalInstance.initialize();
          loginResponse = await msalInstance.loginPopup(requestConfig);
        } else {
          // Fallback to full-page redirect flow
          await msalInstance.loginRedirect(requestConfig);
          return;
        }
      }

      if (loginResponse) {
        await processMsalResponse(loginResponse);
      }
    } catch (err: any) {
      console.error('Microsoft login error:', err);
      if (err?.errorCode === 'user_cancelled') {
        setError('Microsoft sign-in was cancelled.');
      } else {
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to sign in with Microsoft Entra ID. Please verify your employee registration.';
        setError(errorMsg);
      }
    } finally {
      setMsalLoading(false);
    }
  };

  const isAnyLoading = loading || msalLoading;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
        p: { xs: 2, sm: 3, md: 4 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Subtle Ambient Glow */}
      <Box
        sx={{
          position: 'absolute',
          top: -120,
          left: -120,
          width: 450,
          height: 450,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center" justifyContent="center">
          {/* Left Column: Role Selector Hub */}
          <Grid item xs={12} md={7}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 44,
                    height: 44,
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
                    boxShadow: '0 4px 20px rgba(79, 70, 229, 0.5)',
                  }}
                >
                  FV
                </Avatar>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em',
                    fontSize: { xs: '1.4rem', sm: '1.8rem' },
                  }}
                >
                  Field Visit & Expense CRM
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ color: '#94A3B8', mb: 2 }}>
                Enterprise platform powered by <b>Java Spring Boot 3</b> and <b>Microsoft SQL Server</b>.
              </Typography>

              {/* Status Chips */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                <Chip
                  icon={<Storage sx={{ fontSize: '14px !important', color: '#38BDF8 !important' }} />}
                  label="MS SQL Server (field_visit)"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(56, 189, 248, 0.1)',
                    color: '#38BDF8',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  icon={<VpnKey sx={{ fontSize: '14px !important', color: '#38BDF8 !important' }} />}
                  label="Microsoft Entra ID (fieldvisit)"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(0, 164, 239, 0.15)',
                    color: '#38BDF8',
                    border: '1px solid rgba(0, 164, 239, 0.35)',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label="Spring Boot 3.3 (Java 21)"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(74, 222, 128, 0.1)',
                    color: '#4ADE80',
                    border: '1px solid rgba(74, 222, 128, 0.25)',
                    fontWeight: 600,
                  }}
                />
              </Box>

              <Typography
                variant="subtitle2"
                sx={{
                  color: '#E2E8F0',
                  fontWeight: 700,
                  mb: 1.5,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                }}
              >
                ⚡ Quick Select Role to Sign In (All 4 Enterprise Roles):
              </Typography>

              {/* Role Cards Grid */}
              <Grid container spacing={1.5}>
                {ROLE_PRESETS.map((preset) => {
                  const isSelected = selectedRole === preset.id;
                  return (
                    <Grid item xs={12} sm={6} key={preset.id}>
                      <Paper
                        elevation={0}
                        onClick={() => handleSelectRole(preset)}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          cursor: 'pointer',
                          bgcolor: isSelected ? 'rgba(79, 70, 229, 0.16)' : 'rgba(30, 41, 59, 0.7)',
                          backdropFilter: 'blur(12px)',
                          border: isSelected ? `2px solid ${preset.themeColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: isSelected ? `0 8px 24px -4px ${preset.themeColor}55` : 'none',
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                          position: 'relative',
                          '&:hover': {
                            bgcolor: isSelected ? 'rgba(79, 70, 229, 0.22)' : 'rgba(51, 65, 85, 0.8)',
                            borderColor: preset.themeColor,
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        {/* Header Row */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '10px',
                                bgcolor: `${preset.themeColor}22`,
                                color: preset.themeColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {preset.icon}
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
                                {preset.title}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.72rem' }}>
                                {preset.name}
                              </Typography>
                            </Box>
                          </Box>

                          {isSelected && <CheckCircle sx={{ color: preset.themeColor, fontSize: 20 }} />}
                        </Box>

                        <Typography variant="caption" sx={{ color: '#CBD5E1', fontSize: '0.74rem', lineHeight: 1.4 }}>
                          {preset.description}
                        </Typography>

                        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

                        {/* Card Footer: Email & 1-Click Login */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.2 }}>
                          <Typography
                            variant="caption"
                            sx={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '0.72rem' }}
                          >
                            {preset.email}
                          </Typography>
                          <Button
                            size="small"
                            variant="text"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInstantLogin(preset);
                            }}
                            endIcon={<ArrowForward sx={{ fontSize: '14px !important' }} />}
                            sx={{
                              p: '2px 8px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: preset.themeColor,
                              borderRadius: 1.5,
                              '&:hover': { bgcolor: `${preset.themeColor}22` },
                            }}
                          >
                            Sign In
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Grid>

          {/* Right Column: Sign In Form Card */}
          <Grid item xs={12} md={5}>
            <Card
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: 4,
                bgcolor: '#FFFFFF',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(226, 232, 240, 0.9)',
              }}
            >
              <CardContent sx={{ p: 1 }}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      Sign In
                    </Typography>
                    <Chip
                      label={ROLE_PRESETS.find((r) => r.id === selectedRole)?.badge || 'ADMIN'}
                      color={ROLE_PRESETS.find((r) => r.id === selectedRole)?.badgeColor || 'primary'}
                      size="small"
                      sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Selected role: <b>{ROLE_PRESETS.find((r) => r.id === selectedRole)?.title}</b>
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                {/* Microsoft Entra ID Single Sign-On / Detected Account */}
                {detectedAccount ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 2.5,
                      borderRadius: 2.5,
                      bgcolor: 'rgba(0, 164, 239, 0.07)',
                      border: '1px solid rgba(0, 164, 239, 0.35)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: '#00A4EF',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '1rem',
                          width: 40,
                          height: 40,
                          boxShadow: '0 2px 8px rgba(0, 164, 239, 0.4)',
                        }}
                      >
                        {(detectedAccount.name || detectedAccount.username || 'M').charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#0284C7',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            fontSize: '0.68rem',
                            display: 'block',
                          }}
                        >
                          Detected Microsoft Session
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: '#0F172A',
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {detectedAccount.name || detectedAccount.username}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#64748B',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '0.73rem',
                          }}
                        >
                          {detectedAccount.username}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      size="medium"
                      disabled={isAnyLoading}
                      onClick={() => handleMicrosoftLogin(false)}
                      startIcon={
                        msalLoading ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          <MicrosoftIcon size={18} />
                        )
                      }
                      sx={{
                        py: 1,
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        background: 'linear-gradient(135deg, #0078D4 0%, #00A4EF 100%)',
                        color: '#FFFFFF',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0, 120, 212, 0.35)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #005A9E 0%, #0078D4 100%)',
                        },
                      }}
                    >
                      {msalLoading
                        ? 'Signing in...'
                        : `Continue as ${
                            detectedAccount.name?.split(' ')[0] || detectedAccount.username
                          }`}
                    </Button>

                    <Button
                      fullWidth
                      variant="text"
                      size="small"
                      disabled={isAnyLoading}
                      onClick={() => handleMicrosoftLogin(true)}
                      sx={{
                        mt: 0.8,
                        fontSize: '0.73rem',
                        fontWeight: 600,
                        color: '#64748B',
                        textTransform: 'none',
                        '&:hover': { color: '#0284C7', bgcolor: 'transparent' },
                      }}
                    >
                      Switch / Use another Microsoft account
                    </Button>
                  </Paper>
                ) : (
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    disabled={isAnyLoading}
                    onClick={() => handleMicrosoftLogin(true)}
                    sx={{
                      py: 1.3,
                      mb: 2.5,
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      color: '#2F2F2F',
                      borderColor: '#D1D5DB',
                      bgcolor: '#F9FAFB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2.5,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        bgcolor: '#F3F4F6',
                        borderColor: '#9CA3AF',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                      },
                    }}
                  >
                    {isCheckingSso ? (
                      <CircularProgress size={20} sx={{ mr: 1.5, color: '#00A4EF' }} />
                    ) : msalLoading ? (
                      <CircularProgress size={20} sx={{ mr: 1.5, color: '#00A4EF' }} />
                    ) : (
                      <MicrosoftIcon size={20} />
                    )}
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      {isCheckingSso
                        ? 'Detecting active Microsoft session...'
                        : msalLoading
                        ? 'Signing in with Entra ID...'
                        : 'Sign in with Microsoft Entra ID'}
                    </Box>
                  </Button>
                )}

                {/* Divider */}
                <Divider sx={{ mb: 2.5, fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                  OR SIGN IN WITH CREDENTIALS
                </Divider>

                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Email or Employee Number"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isAnyLoading}
                    sx={{
                      py: 1.5,
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
                      boxShadow: '0 8px 20px -4px rgba(79, 70, 229, 0.45)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4338CA 0%, #2563EB 100%)',
                        boxShadow: '0 12px 25px -4px rgba(79, 70, 229, 0.55)',
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      `SIGN IN AS ${ROLE_PRESETS.find((r) => r.id === selectedRole)?.badge || 'USER'}`
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LoginPage;
