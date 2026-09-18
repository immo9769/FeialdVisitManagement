import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  DirectionsCar as VisitIcon,
  HourglassEmpty as PendingIcon,
  CheckCircle as ApprovedIcon,
  Business as CustomerIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [visits, setVisits] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [vRes, cRes]: [any, any] = await Promise.all([
        api.get('/daily-visits'),
        api.get('/customers'),
      ]);
      setVisits(vRes || []);
      setCustomers(cRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Scoped Data filtering based on User Role:
  const userRole = user?.role || 'SERVICE_ENG';
  const scopedVisits = visits.filter((v) => {
    if (userRole === 'ADMIN') return true;
    if (userRole === 'MANAGER') {
      return v.branchId === user?.branchId || v.branch?.name === user?.branch;
    }
    return v.employeeId === user?.id || v.employee?.email === user?.email;
  });

  const totalVisitsCount = scopedVisits.length;
  const pendingCount = scopedVisits.filter((v) => v.status === 'SUBMITTED').length;
  const approvedVisits = scopedVisits.filter((v) => v.status === 'APPROVED');
  const approvedTotalAmount = approvedVisits.reduce((acc, v) => {
    const claim = v.expenses?.reduce((s: number, e: any) => s + parseFloat(e.amount || 0), 0) || 0;
    return acc + claim;
  }, 0);
  const activeCustomerCount = customers.length;

  const recentVisits = scopedVisits.slice(0, 5);

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'SUBMITTED': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Banner / Header */}
      <Box
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          boxShadow: '0 10px 15px -3px rgba(30, 64, 175, 0.25)',
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {userRole === 'ADMIN'
              ? 'Global Enterprise Operations Dashboard'
              : userRole === 'MANAGER'
              ? `Branch Manager Dashboard (${user?.branch || 'Branch'})`
              : `Personal Field Engineer Workspace (${user?.name})`}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {userRole === 'SERVICE_ENG' || userRole === 'SALES_EXEC'
              ? 'Track your daily visit logs, pending expense claims, and reimbursement status'
              : 'Real-time field engineer activity tracking, mileage claims, and expense approvals inbox'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/daily-visits')}
          sx={{ fontWeight: 700 }}
        >
          + LOG DAILY VISIT
        </Button>
      </Box>

      {/* KPI Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={userRole === 'ADMIN' || userRole === 'MANAGER' ? 3 : 4}>
          <Card sx={{ borderLeft: '4px solid #1E40AF' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {userRole === 'ADMIN' ? 'GLOBAL VISITS' : 'YOUR VISITS (MONTH)'}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>
                  {loading ? <CircularProgress size={24} /> : totalVisitsCount}
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                  Real-time DB synced
                </Typography>
              </Box>
              <VisitIcon color="primary" sx={{ fontSize: 40 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={userRole === 'ADMIN' || userRole === 'MANAGER' ? 3 : 4}>
          <Card sx={{ borderLeft: '4px solid #F59E0B' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {userRole === 'MANAGER' ? 'PENDING APPROVALS' : 'YOUR PENDING CLAIMS'}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.main', my: 0.5 }}>
                  {loading ? <CircularProgress size={24} /> : pendingCount}
                </Typography>
                <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>
                  Under Manager Review
                </Typography>
              </Box>
              <PendingIcon color="warning" sx={{ fontSize: 40 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={userRole === 'ADMIN' || userRole === 'MANAGER' ? 3 : 4}>
          <Card sx={{ borderLeft: '4px solid #10B981' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  APPROVED CLAIMS (₹)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', my: 0.5 }}>
                  {loading ? <CircularProgress size={24} /> : `₹${Math.round(approvedTotalAmount).toLocaleString('en-IN')}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {approvedVisits.length} Approved Visits
                </Typography>
              </Box>
              <ApprovedIcon color="success" sx={{ fontSize: 40 }} />
            </CardContent>
          </Card>
        </Grid>

        {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid #0D9488' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    ACTIVE CUSTOMERS
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'info.main', my: 0.5 }}>
                    {loading ? <CircularProgress size={24} /> : activeCustomerCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Existing & Prospect Clients
                  </Typography>
                </Box>
                <CustomerIcon color="info" sx={{ fontSize: 40 }} />
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Recent Visits Data Grid */}
      <Card sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {userRole === 'SERVICE_ENG' || userRole === 'SALES_EXEC'
              ? 'Your Recent Field Visits & Claims'
              : 'Recent Field Visits & Claims Queue'}
          </Typography>
          <Button size="small" onClick={() => navigate('/daily-visits')}>
            View All Visits {'->'}
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Employee Name</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Activity</TableCell>
                <TableCell>Route</TableCell>
                <TableCell>Claim Total (₹)</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentVisits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No recent visits logged for your account scope.
                  </TableCell>
                </TableRow>
              ) : (
                recentVisits.map((v) => {
                  const claimTotal = v.expenses?.reduce((s: number, e: any) => s + parseFloat(e.amount || 0), 0) || 0;
                  return (
                    <TableRow key={v.id} hover onClick={() => navigate('/daily-visits')} style={{ cursor: 'pointer' }}>
                      <TableCell>{new Date(v.visitDate).toLocaleDateString()}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{v.employee?.name}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{v.customer?.name}</TableCell>
                      <TableCell>{v.activityType?.name}</TableCell>
                      <TableCell>{v.placeFrom} {'->'} {v.placeTo}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                        ₹{Math.round(claimTotal).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <Chip label={v.status} color={getStatusChipColor(v.status) as any} size="small" />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </Box>
  );
};
