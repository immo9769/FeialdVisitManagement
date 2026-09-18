import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  AppBar,
  Toolbar,
  Divider,
} from '@mui/material';
import {
  DirectionsCar as VisitIcon,
  CheckCircleOutline as CheckIcon,
  Assessment as ReportIcon,
  Security as RbacIcon,
  FlashOn as SpeedIcon,
  ArrowForward as ArrowForwardIcon,
  Login as LoginIcon,
  Dashboard as DashboardIcon,
  ReceiptLong as ExpenseIcon,
  BusinessCenter as CompanyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, user } = useAuth();

  const handleDemoLogin = async (email: string) => {
    try {
      await login(email, 'Password@123');
      navigate('/dashboard');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>
      {/* Top Navbar */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #E2E8F0', color: '#0F172A' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/home')}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
                }}
              >
                FV
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1, color: '#0F172A' }}>
                  FieldVisit <span style={{ color: '#1E40AF' }}>CRM</span>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                  ENTERPRISE EXPENSE & VISIT SYSTEM
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              {isAuthenticated ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DashboardIcon />}
                  onClick={() => navigate('/dashboard')}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, px: 3 }}
                >
                  Go to Dashboard ({user?.role})
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate('/login')}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, px: 3 }}
                >
                  Sign In / Login
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'radial-gradient(100% 100% at 50% 0%, #1E3A8A 0%, #0F172A 100%)',
          color: 'white',
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 14 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                label="⚡ ORACLE APEX PAGE 3 REPLICATED ARCHITECTURE"
                sx={{
                  bgcolor: 'rgba(59, 130, 246, 0.2)',
                  color: '#93C5FD',
                  border: '1px solid rgba(147, 197, 253, 0.3)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  mb: 3,
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '2.5rem', md: '3.6rem' },
                  lineHeight: 1.15,
                  mb: 2.5,
                  letterSpacing: '-0.02em',
                }}
              >
                Enterprise Field Visit & <br />
                <span style={{ background: 'linear-gradient(90deg, #60A5FA, #34D399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Mileage Claim Management
                </span>
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: '#94A3B8', fontWeight: 400, mb: 4, lineHeight: 1.6, maxWidth: '620px' }}
              >
                Empower service engineers to log daily machine visits, auto-calculate fuel rate mileage (₹10.35/km), submit itemized expense claims, and execute 1-click batch manager approvals.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {isAuthenticated ? (
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/dashboard')}
                    sx={{
                      bgcolor: '#2563EB',
                      hover: { bgcolor: '#1D4ED8' },
                      px: 4,
                      py: 1.6,
                      fontSize: '1rem',
                      fontWeight: 700,
                      borderRadius: '10px',
                      boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.5)',
                    }}
                  >
                    Open Live Dashboard
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/login')}
                    sx={{
                      bgcolor: '#2563EB',
                      hover: { bgcolor: '#1D4ED8' },
                      px: 4,
                      py: 1.6,
                      fontSize: '1rem',
                      fontWeight: 700,
                      borderRadius: '10px',
                      boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.5)',
                    }}
                  >
                    Launch Application Login
                  </Button>
                )}
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => handleDemoLogin('manager.mumbai@crm.com')}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    px: 3,
                    py: 1.6,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: '10px',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' },
                  }}
                >
                  Quick Demo (Branch Manager)
                </Button>
              </Box>
            </Grid>

            {/* Quick Demo Role Switcher Cards */}
            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  bgcolor: 'rgba(30, 41, 59, 0.8)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  borderRadius: 3,
                  p: 3,
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5, color: '#38BDF8' }}>
                  ⚡ Instant 1-Click Role Login
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 2.5 }}>
                  Select any enterprise role to test live data visibility & permissions:
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleDemoLogin('admin@crm.com')}
                    sx={{
                      justify: 'flex-start',
                      p: 1.5,
                      borderColor: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.03)',
                      '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)', borderColor: '#3B82F6' },
                      textAlign: 'left',
                    }}
                  >
                    <Box sx={{ textAlign: 'left', width: '100%' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        🛡️ System Administrator
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ color: '#94A3B8' }}>
                        Full CRUD Access, Global Branches & All Employee Claims
                      </Typography>
                    </Box>
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleDemoLogin('manager.mumbai@crm.com')}
                    sx={{
                      justify: 'flex-start',
                      p: 1.5,
                      borderColor: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.03)',
                      '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10B981' },
                      textAlign: 'left',
                    }}
                  >
                    <Box sx={{ textAlign: 'left', width: '100%' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        👔 Branch Manager (Mumbai)
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ color: '#94A3B8' }}>
                        Mass Approve Claims, High-Density Table & Date Range Filters
                      </Typography>
                    </Box>
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleDemoLogin('vishal@crm.com')}
                    sx={{
                      justify: 'flex-start',
                      p: 1.5,
                      borderColor: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.03)',
                      '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.2)', borderColor: '#F59E0B' },
                      textAlign: 'left',
                    }}
                  >
                    <Box sx={{ textAlign: 'left', width: '100%' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        🔧 Service Engineer (Vishal Jadeja)
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ color: '#94A3B8' }}>
                        Personal Visit Logging, Itemized Expenses & Receipt Uploads
                      </Typography>
                    </Box>
                  </Button>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Feature Highlights Grid */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 7 }}>
          <Chip label="CORE SYSTEM MODULES" color="primary" sx={{ fontWeight: 700, mb: 1.5 }} />
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
            Engineered for High-Performance Field Operations
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '650px', mx: 'auto' }}>
            Built with NestJS backend, TypeORM SQLite database, React frontend, and Material UI enterprise micro-animations.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', p: 1, borderRadius: 3, border: '1px solid #E2E8F0', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 20px -5px rgba(0,0,0,0.1)' } }}>
              <CardContent>
                <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <VisitIcon color="primary" sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Daily Visit Logging (APEX Page 3)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Log customer visits with exact timings, activity categories (Service, Demo, Inspection), routes, and multiple itemized expense rows.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', p: 1, borderRadius: 3, border: '1px solid #E2E8F0', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 20px -5px rgba(0,0,0,0.1)' } }}>
              <CardContent>
                <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <ExpenseIcon sx={{ color: '#10B981', fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Mileage & Fuel Rate Calculation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Automated odometer math (Start Km, End Km) multiplied by ₹10.35 rate/km, plus toll tax and hotel receipt attachments.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', p: 1, borderRadius: 3, border: '1px solid #E2E8F0', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 20px -5px rgba(0,0,0,0.1)' } }}>
              <CardContent>
                <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <SpeedIcon sx={{ color: '#F59E0B', fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Batch Mass Approval Inbox
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Branch Managers can filter claims by date range, select all pending claims at once, and approve them in a single batch click.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', p: 1, borderRadius: 3, border: '1px solid #E2E8F0', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 20px -5px rgba(0,0,0,0.1)' } }}>
              <CardContent>
                <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <ReportIcon sx={{ color: '#0D9488', fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Weekly & Monthly Matrix Reports
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dynamic date range toggles, customer dropdown filters, customer-wise financial matrix, and 1-click Excel CSV export.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', p: 1, borderRadius: 3, border: '1px solid #E2E8F0', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 20px -5px rgba(0,0,0,0.1)' } }}>
              <CardContent>
                <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <RbacIcon sx={{ color: '#EF4444', fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  RBAC Data Visibility & Privileges
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Engineers see only their visits, Managers see branch visits, while Admin holds global management and CRUD control.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', p: 1, borderRadius: 3, border: '1px solid #E2E8F0', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 20px -5px rgba(0,0,0,0.1)' } }}>
              <CardContent>
                <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <CompanyIcon sx={{ color: '#9333EA', fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Indian Rupee (₹) Enterprise Standard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete INR formatting across all dashboards, sub-grids, approval cards, matrix tables, and financial exports.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#0F172A', color: 'white', py: 4, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            © 2026 Enterprise Field Visit & CRM Management System. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', cursor: 'pointer', '&:hover': { color: 'white' } }} onClick={() => navigate('/home')}>
              Home
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', cursor: 'pointer', '&:hover': { color: 'white' } }} onClick={() => navigate('/dashboard')}>
              Dashboard
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', cursor: 'pointer', '&:hover': { color: 'white' } }} onClick={() => navigate('/daily-visits')}>
              Daily Visits
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
