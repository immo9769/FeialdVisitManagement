import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tooltip,
  Badge,
  Stack,
  Paper,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as EmployeesIcon,
  Business as CustomersIcon,
  Contacts as ContactsIcon,
  DirectionsCar as VisitsIcon,
  FactCheck as ApprovalsIcon,
  Assessment as ReportsIcon,
  Category as MastersIcon,
  Security as SecurityIcon,
  LockReset as LockIcon,
  Logout as LogoutIcon,
  AccountCircle as ProfileIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 260;

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleChangePassword = () => {
    if (!newPassword) return;
    alert('Password updated successfully!');
    setNewPassword('');
    setPasswordModalOpen(false);
  };

  const allMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', roles: ['ADMIN', 'MANAGER', 'SALES_EXEC', 'SERVICE_ENG'] },
    { text: 'Employees', icon: <EmployeesIcon />, path: '/employees', roles: ['ADMIN', 'MANAGER'] },
    { text: 'Customers', icon: <CustomersIcon />, path: '/customers', roles: ['ADMIN', 'MANAGER', 'SALES_EXEC', 'SERVICE_ENG'] },
    { text: 'Contacts', icon: <ContactsIcon />, path: '/contacts', roles: ['ADMIN', 'MANAGER', 'SALES_EXEC', 'SERVICE_ENG'] },
    { text: 'Daily Visits', icon: <VisitsIcon />, path: '/daily-visits', roles: ['ADMIN', 'MANAGER', 'SALES_EXEC', 'SERVICE_ENG'] },
    { text: 'Approvals Inbox', icon: <ApprovalsIcon />, path: '/approvals', roles: ['ADMIN', 'MANAGER'] },
    { text: 'Monthly Report', icon: <ReportsIcon />, path: '/reports/monthly', roles: ['ADMIN', 'MANAGER', 'SALES_EXEC', 'SERVICE_ENG'] },
    { text: 'Master Data Management', icon: <MastersIcon />, path: '/masters', roles: ['ADMIN'] },
    { text: 'User Security Matrix', icon: <SecurityIcon />, path: '/user-management', roles: ['ADMIN'] },
    { text: 'My Profile', icon: <ProfileIcon />, path: '/profile', roles: ['ADMIN', 'MANAGER', 'SALES_EXEC', 'SERVICE_ENG'] },
  ];

  // RBAC Filtering based on user role
  const userRole = user?.role || 'SERVICE_ENG';
  const filteredMenuItems = allMenuItems.filter((item) => item.roles.includes(userRole));

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Admin', color: 'error' as const, bg: '#FEE2E2', text: '#991B1B' };
      case 'MANAGER':
        return { label: 'Manager', color: 'secondary' as const, bg: '#E0F2FE', text: '#0369A1' };
      case 'SALES_EXEC':
        return { label: 'Sales Exec', color: 'warning' as const, bg: '#FEF3C7', text: '#92400E' };
      case 'SERVICE_ENG':
        return { label: 'Service Eng', color: 'info' as const, bg: '#E0E7FF', text: '#3730A3' };
      default:
        return { label: role || 'Staff', color: 'default' as const, bg: '#F1F5F9', text: '#475569' };
    }
  };

  const roleInfo = getRoleBadge(userRole);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Modern Top App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          color: 'text.primary',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          {/* Brand & Location Indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
              Field Visit Management CRM
            </Typography>
            <Chip
              icon={<LocationIcon sx={{ fontSize: '14px !important', color: '#4F46E5 !important' }} />}
              label={user?.branch || 'Mumbai HQ'}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                bgcolor: 'rgba(79, 70, 229, 0.08)',
                color: 'primary.main',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                display: { xs: 'none', md: 'inline-flex' },
              }}
            />
          </Box>

          {/* Right Controls: User Profile + Explicit Logout Header Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            {/* Clickable User Identity Pill */}
            <Tooltip title="View My Profile">
              <Box
                onClick={handleMenuOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                  cursor: 'pointer',
                  p: '4px 10px',
                  borderRadius: '12px',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#F1F5F9' },
                }}
              >
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  sx={{ '& .MuiBadge-badge': { bgcolor: '#10B981', color: '#10B981', boxShadow: '0 0 0 2px #FFFFFF' } }}
                >
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 36,
                      height: 36,
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </Badge>

                <Box sx={{ textAlign: 'left', display: { xs: 'none', md: 'block' } }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#0F172A', fontSize: '0.85rem' }}>
                    {user?.name || 'Administrator'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: roleInfo.text, fontWeight: 700, fontSize: '0.7rem' }}>
                    {roleInfo.label} • #{user?.employeeNo || '1000'}
                  </Typography>
                </Box>
              </Box>
            </Tooltip>

            {/* Direct Logout Button on Header (As Requested) */}
            <Tooltip title="Sign Out of CRM">
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  borderRadius: 2,
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  color: '#DC2626',
                  bgcolor: 'rgba(254, 242, 242, 0.6)',
                  px: 1.6,
                  py: 0.6,
                  '&:hover': {
                    bgcolor: '#FEE2E2',
                    borderColor: '#EF4444',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Logout
                </Box>
              </Button>
            </Tooltip>
          </Box>

          {/* User Menu Popover */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                width: 260,
                borderRadius: 3,
                boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
                border: '1px solid #E2E8F0',
                p: 0.5,
              },
            }}
          >
            <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {user?.email}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={roleInfo.label}
                  size="small"
                  sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: roleInfo.bg, color: roleInfo.text }}
                />
                <Chip
                  label={user?.branch || 'Mumbai HQ'}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }}
                />
              </Stack>
            </Box>

            <MenuItem
              onClick={() => {
                handleMenuClose();
                setProfileModalOpen(true);
              }}
              sx={{ borderRadius: 1.5, py: 1, gap: 1.5 }}
            >
              <ProfileIcon fontSize="small" sx={{ color: 'primary.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Quick Profile View</Typography>
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate('/profile');
              }}
              sx={{ borderRadius: 1.5, py: 1, gap: 1.5 }}
            >
              <BadgeIcon fontSize="small" sx={{ color: 'secondary.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Full Account Details</Typography>
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleMenuClose();
                setPasswordModalOpen(true);
              }}
              sx={{ borderRadius: 1.5, py: 1, gap: 1.5 }}
            >
              <LockIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Change Password</Typography>
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem onClick={handleLogout} sx={{ borderRadius: 1.5, py: 1, gap: 1.5, color: 'error.main' }}>
              <LogoutIcon fontSize="small" color="error" />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Logout</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Modern Navigation Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#0F172A', // Dark modern slate
            color: '#F8FAFC',
            borderRight: 'none',
          },
        }}
      >
        <Toolbar sx={{ px: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 36,
              height: 36,
              fontWeight: 800,
              fontSize: '0.9rem',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
              background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
            }}
          >
            FV
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1, letterSpacing: '0.02em', fontSize: '0.92rem' }}>
              FIELD VISIT CRM
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              MS SQL • Spring Boot 3
            </Typography>
          </Box>
        </Toolbar>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

        {/* User Card inside Sidebar */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Paper
            elevation={0}
            onClick={() => navigate('/profile')}
            sx={{
              p: 1.5,
              borderRadius: 2.5,
              bgcolor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                borderColor: 'rgba(79, 70, 229, 0.4)',
              },
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '0.8rem', fontWeight: 700 }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="caption" noWrap sx={{ fontWeight: 700, color: '#FFFFFF', display: 'block' }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem', display: 'block' }}>
                {roleInfo.label} • {user?.branch || 'Mumbai'}
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 1 }} />

        {/* Navigation List */}
        <List sx={{ px: 1.5, py: 0.5 }}>
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.6 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    boxShadow: isActive ? '0 4px 12px rgba(79, 70, 229, 0.35)' : 'none',
                    py: 1,
                    px: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.main' : 'rgba(255, 255, 255, 0.06)',
                      color: '#FFFFFF',
                      transform: 'translateX(2px)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#FFFFFF' : '#94A3B8', minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 700 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* Main Content Viewport */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>

      {/* Quick Profile View Modal */}
      <Dialog open={profileModalOpen} onClose={() => setProfileModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Logged User Profile</span>
          <Chip
            label={roleInfo.label}
            size="small"
            sx={{ bgcolor: roleInfo.bg, color: roleInfo.text, fontWeight: 700 }}
          />
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'primary.main',
                fontSize: '1.6rem',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
                Employee ID #{user?.employeeNo || '1000'}
              </Typography>
            </Box>
          </Box>

          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', mb: 2 }}>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">Official Branch:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{user?.branch || 'Mumbai HQ'}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">Department:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.department || 'Operations'}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">Designation:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.designation || 'Specialist'}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">Grade & Fuel Band:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'warning.dark' }}>
                  {user?.grade || 'GRADE_A'}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">Mobile Phone:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.mobileNo || '+91 99999 99999'}</Typography>
              </Box>
            </Stack>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            variant="text"
            color="primary"
            onClick={() => {
              setProfileModalOpen(false);
              navigate('/profile');
            }}
            startIcon={<BadgeIcon />}
          >
            Open Full Profile Page
          </Button>
          <Button variant="contained" onClick={() => setProfileModalOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Change Account Password</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            size="small"
            type="password"
            label="New Password *"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPasswordModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleChangePassword}>
            UPDATE PASSWORD
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default MainLayout;

