import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Divider,
  Button,
  TextField,
  Alert,
  Stack,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  LocalGasStation as FuelIcon,
  LockReset as LockResetIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return { bg: '#4F46E5', label: 'SYSTEM ADMINISTRATOR', color: 'error' };
      case 'MANAGER':
        return { bg: '#10B981', label: 'BRANCH MANAGER', color: 'secondary' };
      case 'SALES_EXEC':
        return { bg: '#F59E0B', label: 'SALES EXECUTIVE', color: 'warning' };
      case 'SERVICE_ENG':
        return { bg: '#0EA5E9', label: 'FIELD SERVICE ENGINEER', color: 'info' };
      default:
        return { bg: '#64748B', label: role || 'USER', color: 'default' };
    }
  };

  const roleMeta = getRoleColor(user?.role);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    showToast('Password updated successfully!', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordOpen(false);
  };


  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Top Profile Hero Card */}
      <Card
        sx={{
          mb: 4,
          overflow: 'hidden',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.05)',
        }}
      >
        {/* Decorative Gradient Banner */}
        <Box
          sx={{
            height: 140,
            background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 50%, #3B82F6 100%)',
            position: 'relative',
          }}
        />

        <CardContent sx={{ pt: 0, pb: 3, px: { xs: 2, sm: 4 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'flex-end' },
              justifyContent: 'space-between',
              gap: 2,
              mt: -6,
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'center', sm: 'flex-end' },
                gap: 2.5,
                textAlign: { xs: 'center', sm: 'left' },
              }}
            >
              <Avatar
                sx={{
                  width: 104,
                  height: 104,
                  bgcolor: '#1E293B',
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  border: '4px solid #FFFFFF',
                  boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.15)',
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>

              <Box sx={{ mb: { sm: 1 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    {user?.name || 'Administrator'}
                  </Typography>
                  <Chip
                    label="Active Account"
                    color="success"
                    size="small"
                    icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                    sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                  Employee #{user?.employeeNo || '1000'} • {user?.designation || 'System Executive'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, mb: { sm: 1 } }}>
              <Chip
                label={roleMeta.label}
                sx={{
                  bgcolor: roleMeta.bg,
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  letterSpacing: '0.04em',
                  px: 1,
                  py: 2,
                }}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<LockResetIcon />}
                onClick={() => setPasswordOpen(!passwordOpen)}
                sx={{ borderRadius: 2 }}
              >
                Change Password
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Change Password Collapsible Section */}
      {passwordOpen && (
        <Card sx={{ mb: 4, border: '1px solid #C7D2FE', bgcolor: '#EEF2FF' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: '#3730A3' }}>
              Update Security Credentials
            </Typography>
            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {passwordError}
              </Alert>
            )}
            <form onSubmit={handlePasswordSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="password"
                    label="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="password"
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="password"
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
                  <Button variant="text" color="inherit" onClick={() => setPasswordOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" color="primary">
                    Save New Password
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Information Cards Grid */}
      <Grid container spacing={3}>
        {/* Personal Details */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    bgcolor: 'rgba(79, 70, 229, 0.1)',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PersonIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Personal Information
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Contact details & primary identifiers
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BadgeIcon fontSize="small" sx={{ color: '#94A3B8' }} /> Employee Number
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    {user?.employeeNo || '1000'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" sx={{ color: '#94A3B8' }} /> Email Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user?.email || 'admin@crm.com'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon fontSize="small" sx={{ color: '#94A3B8' }} /> Mobile Contact
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user?.mobileNo || '+91 99999 99999'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" sx={{ color: '#94A3B8' }} /> Gender
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user?.gender || 'Male'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Organizational Details */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    bgcolor: 'rgba(14, 165, 233, 0.1)',
                    color: 'secondary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BusinessIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Organization & Scope
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Branch alignment, department & tier
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon fontSize="small" sx={{ color: '#94A3B8' }} /> Assigned Branch
                  </Typography>
                  <Chip
                    label={user?.branch || 'Mumbai HQ'}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BadgeIcon fontSize="small" sx={{ color: '#94A3B8' }} /> Department
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user?.department || 'Management & Operations'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon fontSize="small" sx={{ color: '#94A3B8' }} /> Official Designation
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user?.designation || 'System Administrator'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FuelIcon fontSize="small" sx={{ color: '#94A3B8' }} /> Grade & Fuel Band
                  </Typography>
                  <Chip
                    label={user?.grade || 'GRADE_A (₹14.00/KM)'}
                    size="small"
                    sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
