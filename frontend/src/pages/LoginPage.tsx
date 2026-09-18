import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
  const { login, loading } = useAuth();
  const navigate = useNavigate();

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
      setError(err || 'Failed to authenticate. Please check your credentials.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err || 'Failed to authenticate. Please check your credentials.');
    }
  };

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
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', fontSize: { xs: '1.4rem', sm: '1.8rem' } }}>
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
                  sx={{ bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.25)', fontWeight: 600 }}
                />
                <Chip
                  label="Spring Boot 3.3 (Java 21)"
                  size="small"
                  sx={{ bgcolor: 'rgba(74, 222, 128, 0.1)', color: '#4ADE80', border: '1px solid rgba(74, 222, 128, 0.25)', fontWeight: 600 }}
                />
                <Chip
                  label="JWT Bearer Security"
                  size="small"
                  sx={{ bgcolor: 'rgba(192, 132, 252, 0.1)', color: '#C084FC', border: '1px solid rgba(192, 132, 252, 0.25)', fontWeight: 600 }}
                />
              </Box>

              <Typography variant="subtitle2" sx={{ color: '#E2E8F0', fontWeight: 700, mb: 1.5, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
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

                          {isSelected && (
                            <CheckCircle sx={{ color: preset.themeColor, fontSize: 20 }} />
                          )}
                        </Box>

                        <Typography variant="caption" sx={{ color: '#CBD5E1', fontSize: '0.74rem', lineHeight: 1.4 }}>
                          {preset.description}
                        </Typography>

                        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

                        {/* Card Footer: Email & 1-Click Login */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.2 }}>
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '0.72rem' }}>
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
                <Box sx={{ mb: 2.5 }}>
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
                    disabled={loading}
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
                    {loading ? <CircularProgress size={24} color="inherit" /> : `SIGN IN AS ${ROLE_PRESETS.find((r) => r.id === selectedRole)?.badge || 'USER'}`}
                  </Button>
                </form>

                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Need Swagger API documentation?{' '}
                    <Typography
                      component="a"
                      href="http://localhost:4000/swagger-ui/index.html"
                      target="_blank"
                      rel="noreferrer"
                      variant="caption"
                      sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      Open Swagger UI
                    </Typography>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
export default LoginPage;

