import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  MonetizationOn as TotalIcon,
  CheckCircle as ApprovedIcon,
  HourglassEmpty as PendingIcon,
  Cancel as RejectedIcon,
  Search as SearchIcon,
  FileDownload as DownloadIcon,
  DateRange as WeeklyIcon,
  CalendarMonth as MonthlyIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { exportToCsv } from '../utils/exportCsv';

export const MonthlyReportPage: React.FC = () => {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  // Filter States:
  const [reportMode, setReportMode] = useState<'MONTHLY' | 'WEEKLY'>('MONTHLY');
  const [selectedEmp, setSelectedEmp] = useState<string>('');
  const [selectedCust, setSelectedCust] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(8);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [startDate, setStartDate] = useState<string>('2026-08-01');
  const [endDate, setEndDate] = useState<string>('2026-08-07');

  const [reportData, setReportData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDropdownData = async () => {
    try {
      const [empRes, custRes]: [any, any] = await Promise.all([
        api.get('/employees'),
        api.get('/customers'),
      ]);
      setEmployees(empRes || []);
      setCustomers(custRes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        employeeId: selectedEmp || undefined,
        customerId: selectedCust || undefined,
      };

      if (reportMode === 'WEEKLY') {
        params.startDate = startDate;
        params.endDate = endDate;
      } else {
        params.month = selectedMonth;
        params.year = selectedYear;
      }

      const res: any = await api.get('/reports/monthly-expense', { params });
      setReportData(res);
    } catch (err: any) {
      setError(err || 'Failed to fetch expense matrix report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [reportMode, selectedEmp, selectedCust, selectedMonth, selectedYear, startDate, endDate]);

  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  const summary = reportData?.summary || {
    totalClaimedAmount: 0,
    approvedAmount: 0,
    pendingAmount: 0,
    rejectedAmount: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    totalVisits: 0,
  };

  const rows = reportData?.matrixRows || [];

  const colSums = rows.reduce(
    (acc: any, r: any) => ({
      lb: acc.lb + r.lodgingBoarding,
      tr: acc.tr + r.travelExp,
      hc: acc.hc + r.hireCar,
      bl: acc.bl + r.businessLunch,
      po: acc.po + r.postage,
      tel: acc.tel + r.telephone,
      mc: acc.mc + r.motorCar,
      net: acc.net + r.netPayment,
    }),
    { lb: 0, tr: 0, hc: 0, bl: 0, po: 0, tel: 0, mc: 0, net: 0 },
  );

  const handleExportExcel = () => {
    const empName = reportData?.employee?.name || 'All_Employees';
    const reportLabel = reportMode === 'WEEKLY' ? `Weekly_${startDate}_to_${endDate}` : `Monthly_${selectedMonth}_${selectedYear}`;
    const exportData = rows.map((r: any) => ({
      Date: r.date,
      Employee: r.employeeName,
      Customer: r.customerName,
      Route: r.route,
      'L & B (₹)': r.lodgingBoarding,
      'Travel Exp (₹)': r.travelExp,
      'Hire Car (₹)': r.hireCar,
      'Business Lunch (₹)': r.businessLunch,
      'Postage (₹)': r.postage,
      'Telephone (₹)': r.telephone,
      'Motor Car (₹)': r.motorCar,
      'Net Payment (₹)': r.netPayment,
      Status: r.status,
    }));
    exportToCsv(`Expense_Matrix_Report_${empName}_${reportLabel}.csv`, exportData);
    showToast('Expense Report exported to Excel CSV successfully!', 'success');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Expense Matrix Financial Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cross-tabulation financial matrix with Weekly & Monthly reports, Employee & Customer filters
          </Typography>
        </Box>
        <Button variant="contained" color="secondary" startIcon={<DownloadIcon />} onClick={handleExportExcel}>
          EXPORT TO EXCEL
        </Button>
      </Box>

      {/* Mode Selection & Filter Toolbar */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <ToggleButtonGroup
              value={reportMode}
              exclusive
              onChange={(_, val) => val && setReportMode(val)}
              color="primary"
              size="small"
              fullWidth
            >
              <ToggleButton value="MONTHLY" sx={{ fontWeight: 700 }}>
                <MonthlyIcon sx={{ mr: 1 }} /> Monthly Report
              </ToggleButton>
              <ToggleButton value="WEEKLY" sx={{ fontWeight: 700 }}>
                <WeeklyIcon sx={{ mr: 1 }} /> Weekly Report
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Employee Filter"
              value={selectedEmp}
              onChange={(e) => setSelectedEmp(e.target.value)}
            >
              <MenuItem value="">All Employees</MenuItem>
              {employees.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.name} ({e.employeeNo})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Customer Filter"
              value={selectedCust}
              onChange={(e) => setSelectedCust(e.target.value)}
            >
              <MenuItem value="">All Customers</MenuItem>
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} ({c.customerCode})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Date Picker Controls according to Mode */}
          {reportMode === 'MONTHLY' ? (
            <>
              <Grid item xs={6} sm={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {months.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  <MenuItem value={2026}>2026</MenuItem>
                  <MenuItem value={2025}>2025</MenuItem>
                </TextField>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Week Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Week End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={fetchReport}
            >
              GENERATE REPORT
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Financial Status Summary Tiles */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #1E40AF' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  TOTAL CLAIMED (₹)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, my: 0.5 }}>
                  ₹{Math.round(summary.totalClaimedAmount).toLocaleString('en-IN')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {summary.totalVisits} Visit Records
                </Typography>
              </Box>
              <TotalIcon color="primary" fontSize="large" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #10B981' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  APPROVED AMOUNT (₹)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main', my: 0.5 }}>
                  ₹{Math.round(summary.approvedAmount).toLocaleString('en-IN')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {summary.approvedCount} Claims Approved
                </Typography>
              </Box>
              <ApprovedIcon color="success" fontSize="large" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #F59E0B' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  PENDING AMOUNT (₹)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main', my: 0.5 }}>
                  ₹{Math.round(summary.pendingAmount).toLocaleString('en-IN')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {summary.pendingCount} Under Review
                </Typography>
              </Box>
              <PendingIcon color="warning" fontSize="large" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #EF4444' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  REJECTED AMOUNT (₹)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main', my: 0.5 }}>
                  ₹{Math.round(summary.rejectedAmount).toLocaleString('en-IN')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {summary.rejectedCount} Rejected Claims
                </Typography>
              </Box>
              <RejectedIcon color="error" fontSize="large" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Oracle APEX Page 4 Matrix Table */}
      <Card sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {reportMode === 'WEEKLY' ? 'Weekly' : 'Monthly'} Expense Matrix Table
        </Typography>

        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : rows.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
            No expense records found matching the selected filters.
          </Typography>
        ) : (
          <Table size="small" border={1} style={{ borderColor: '#E2E8F0' }}>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Employee Name</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Route (From {'->'} To)</TableCell>
                <TableCell align="right">L & B (₹)</TableCell>
                <TableCell align="right">Travel.Exp (₹)</TableCell>
                <TableCell align="right">Hire Car (₹)</TableCell>
                <TableCell align="right">Business Lunch (₹)</TableCell>
                <TableCell align="right">Postage (₹)</TableCell>
                <TableCell align="right">Telephone (₹)</TableCell>
                <TableCell align="right">Motor Car (₹)</TableCell>
                <TableCell align="right">Net Payment (₹)</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r: any, idx: number) => (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{r.date}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{r.employeeName}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {r.customerName}
                  </TableCell>
                  <TableCell>{r.route}</TableCell>
                  <TableCell align="right">₹{r.lodgingBoarding.toFixed(0)}</TableCell>
                  <TableCell align="right">₹{r.travelExp.toFixed(0)}</TableCell>
                  <TableCell align="right">₹{r.hireCar.toFixed(0)}</TableCell>
                  <TableCell align="right">₹{r.businessLunch.toFixed(0)}</TableCell>
                  <TableCell align="right">₹{r.postage.toFixed(0)}</TableCell>
                  <TableCell align="right">₹{r.telephone.toFixed(0)}</TableCell>
                  <TableCell align="right">₹{r.motorCar.toFixed(0)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    ₹{r.netPayment.toFixed(0)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={r.status}
                      color={
                        r.status === 'APPROVED'
                          ? 'success'
                          : r.status === 'REJECTED'
                          ? 'error'
                          : 'warning'
                      }
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ bgcolor: '#F1F5F9' }}>
                <TableCell colSpan={4} sx={{ fontWeight: 800 }}>Total</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>₹{colSums.lb.toFixed(0)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>₹{colSums.tr.toFixed(0)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>₹{colSums.hc.toFixed(0)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>₹{colSums.bl.toFixed(0)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>₹{colSums.po.toFixed(0)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>₹{colSums.tel.toFixed(0)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>₹{colSums.mc.toFixed(0)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1rem' }}>
                  ₹{colSums.net.toFixed(0)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        )}
      </Card>
    </Box>
  );
};
