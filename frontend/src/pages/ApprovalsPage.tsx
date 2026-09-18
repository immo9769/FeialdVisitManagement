import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Receipt as ReceiptIcon,
  FileDownload as DownloadIcon,
  DoneAll as MassApproveIcon,
  Search as SearchIcon,
  Visibility as EyeIcon,
  GridView as GridViewIcon,
  TableRows as TableViewIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { exportToCsv } from '../utils/exportCsv';

export const ApprovalsPage: React.FC = () => {
  const { showToast } = useToast();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0); // 0: SUBMITTED (Pending), 1: APPROVED, 2: REJECTED, 3: ALL
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE'); // Default to Compact Table View to eliminate scrolling!

  // Filter States:
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Mass Approval Selection:
  const [selectedVisitIds, setSelectedVisitIds] = useState<number[]>([]);

  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [viewClaim, setViewClaim] = useState<any | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceiptTitle, setActiveReceiptTitle] = useState('');

  const fetchVisits = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await api.get('/daily-visits', {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      const nonDrafts = (res || []).filter((v: any) => v.status !== 'DRAFT');
      setVisits(nonDrafts);
      setSelectedVisitIds([]);
    } catch (err: any) {
      setError(err || 'Failed to load approvals queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [startDate, endDate]);

  const formatTime = (timeStr: any) => {
    if (!timeStr) return '';
    try {
      const d = new Date(timeStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      }
    } catch {}
    const str = String(timeStr);
    const parts = str.split('T')[1] ? str.split('T')[1].split(':') : str.split(':');
    if (parts.length >= 2) {
      let hrs = parseInt(parts[0], 10);
      const mins = parts[1].slice(0, 2);
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      hrs = hrs % 12 || 12;
      return `${hrs.toString().padStart(2, '0')}:${mins} ${ampm}`;
    }
    return str;
  };

  const formatTimeRange = (start: any, end: any) => {
    const s = formatTime(start) || '09:00 AM';
    const e = formatTime(end) || '06:00 PM';
    return `${s} - ${e}`;
  };

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/daily-visits/${id}/approve`);
      showToast(`Field visit claim #${id} APPROVED successfully!`, 'success');
      fetchVisits();
    } catch (err: any) {
      showToast(err || 'Failed to approve claim', 'error');
    }
  };

  const handleMassApprove = async () => {
    if (selectedVisitIds.length === 0) return;
    try {
      await api.post('/daily-visits/mass-approve', { ids: selectedVisitIds });
      showToast(`MASS APPROVED ${selectedVisitIds.length} expense claims successfully!`, 'success');
      fetchVisits();
    } catch (err: any) {
      showToast(err || 'Failed to mass approve claims', 'error');
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectId) return;
    try {
      await api.post(`/daily-visits/${rejectId}/reject`, { reason: rejectionReason });
      showToast(`Expense claim #${rejectId} REJECTED with remarks`, 'warning');
      setRejectId(null);
      setRejectionReason('');
      fetchVisits();
    } catch (err: any) {
      showToast(err || 'Failed to reject claim', 'error');
    }
  };

  const handleExportCsv = () => {
    const exportData = filteredVisits.map((v) => ({
      VisitID: v.id,
      Date: new Date(v.visitDate).toLocaleDateString(),
      Timing: formatTimeRange(v.startTime, v.endTime),
      Employee: v.employee?.name,
      Branch: v.branch?.name,
      Customer: v.customer?.name,
      Activity: v.activityType?.name,
      ClaimTotal: v.expenses?.reduce((s: number, e: any) => s + parseFloat(e.amount || 0), 0) || 0,
      Status: v.status,
    }));
    exportToCsv(`Approval_Queue_${new Date().toISOString().split('T')[0]}.csv`, exportData);
    showToast('Approvals queue CSV exported successfully!', 'success');
  };

  const pendingVisits = visits.filter((v) => v.status === 'SUBMITTED');

  const filteredVisits = visits.filter((v) => {
    if (tabValue === 0 && v.status !== 'SUBMITTED') return false;
    if (tabValue === 1 && v.status !== 'APPROVED') return false;
    if (tabValue === 2 && v.status !== 'REJECTED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEmp = v.employee?.name?.toLowerCase().includes(q);
      const matchCust = v.customer?.name?.toLowerCase().includes(q);
      const matchBranch = v.branch?.name?.toLowerCase().includes(q);
      const matchId = String(v.id).includes(q);
      if (!matchEmp && !matchCust && !matchBranch && !matchId) return false;
    }

    return true;
  });

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingIds = filteredVisits.filter((v) => v.status === 'SUBMITTED').map((v) => v.id);
      setSelectedVisitIds(pendingIds);
    } else {
      setSelectedVisitIds([]);
    }
  };

  const handleToggleSingleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedVisitIds([...selectedVisitIds, id]);
    } else {
      setSelectedVisitIds(selectedVisitIds.filter((vId) => vId !== id));
    }
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'SUBMITTED': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const isAllPendingSelected =
    pendingVisits.length > 0 &&
    pendingVisits.every((v) => selectedVisitIds.includes(v.id));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Branch Manager Approvals Inbox
          </Typography>
          <Typography variant="body2" color="text.secondary">
            High-density approvals queue with Mass Approval, Compact Table View, and Date Range filters
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, val) => val && setViewMode(val)}
            size="small"
            color="primary"
          >
            <ToggleButton value="TABLE">
              <Tooltip title="Compact High-Density Table View">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TableViewIcon fontSize="small" /> Compact Table
                </Box>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="GRID">
              <Tooltip title="4-Column Cards View">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <GridViewIcon fontSize="small" /> Cards Grid
                </Box>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {selectedVisitIds.length > 0 && (
            <Button
              variant="contained"
              color="success"
              startIcon={<MassApproveIcon />}
              onClick={handleMassApprove}
              sx={{ fontWeight: 700, boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
            >
              MASS APPROVE ({selectedVisitIds.length} CLAIMS)
            </Button>
          )}

          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCsv}>
            Export Claims CSV
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Date Range & Search Filter Bar */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search employee, customer, branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Start Date"
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
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchQuery('');
                setStartDate('');
                setEndDate('');
              }}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Status Filter Tabs & Batch Select Bar */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(_, val) => setTabValue(val)}
            indicatorColor="primary"
            textColor="primary"
            sx={{ flexGrow: 1 }}
          >
            <Tab label={`Pending Approval (${visits.filter((v) => v.status === 'SUBMITTED').length})`} />
            <Tab label={`Approved Claims (${visits.filter((v) => v.status === 'APPROVED').length})`} />
            <Tab label={`Rejected Claims (${visits.filter((v) => v.status === 'REJECTED').length})`} />
            <Tab label={`All Visits (${visits.length})`} />
          </Tabs>

          {tabValue === 0 && pendingVisits.length > 0 && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAllPendingSelected}
                  onChange={(e) => handleToggleSelectAll(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Select All Pending ({pendingVisits.length})
                </Typography>
              }
            />
          )}
        </Box>
      </Card>

      {loading ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : filteredVisits.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No expense claims match the selected status or date filters.
          </Typography>
        </Card>
      ) : viewMode === 'TABLE' ? (
        /* COMPACT HIGH-DENSITY TABLE VIEW (ZERO SCROLLING NEEDED!) */
        <Card>
          <Table size="small">
            <TableHead>
              <TableRow>
                {tabValue === 0 && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isAllPendingSelected}
                      onChange={(e) => handleToggleSelectAll(e.target.checked)}
                      color="primary"
                    />
                  </TableCell>
                )}
                <TableCell>Date</TableCell>
                <TableCell>Employee Name</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Customer Client</TableCell>
                <TableCell>Activity</TableCell>
                <TableCell>Route</TableCell>
                <TableCell align="right">Claim Total (₹)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVisits.map((v) => {
                const claimTotal = v.expenses?.reduce((s: number, e: any) => s + parseFloat(e.amount || 0), 0) || 0;
                const isSelected = selectedVisitIds.includes(v.id);
                const isPending = v.status === 'SUBMITTED';

                return (
                  <TableRow key={v.id} hover selected={isSelected}>
                    {tabValue === 0 && (
                      <TableCell padding="checkbox">
                        {isPending && (
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => handleToggleSingleSelect(v.id, e.target.checked)}
                            color="primary"
                          />
                        )}
                      </TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 600 }}>{new Date(v.visitDate).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{v.employee?.name}</TableCell>
                    <TableCell>{v.branch?.name}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{v.customer?.name}</TableCell>
                    <TableCell>{v.activityType?.name}</TableCell>
                    <TableCell>{v.placeFrom} {'->'} {v.placeTo}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      ₹{Math.round(claimTotal).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Chip label={v.status} color={getStatusChipColor(v.status) as any} size="small" />
                    </TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="View Expense Details">
                          <IconButton size="small" color="info" onClick={() => setViewClaim(v)}>
                            <EyeIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {isPending && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleApprove(v.id)}
                              sx={{ py: 0.4, px: 1.5, fontSize: '0.75rem', fontWeight: 700 }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => setRejectId(v.id)}
                              sx={{ py: 0.4, px: 1.5, fontSize: '0.75rem', fontWeight: 700 }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        /* COMPACT 4-COLUMN CARDS GRID VIEW */
        <Grid container spacing={2}>
          {filteredVisits.map((v) => {
            const claimTotal = v.expenses?.reduce((s: number, e: any) => s + parseFloat(e.amount || 0), 0) || 0;
            const isSelected = selectedVisitIds.includes(v.id);
            const isPending = v.status === 'SUBMITTED';

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={v.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderTop: `4px solid ${isPending ? '#F59E0B' : v.status === 'APPROVED' ? '#10B981' : '#EF4444'}`,
                    bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {isPending && (
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => handleToggleSingleSelect(v.id, e.target.checked)}
                            color="primary"
                            size="small"
                            sx={{ p: 0 }}
                          />
                        )}
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {v.customer?.name}
                        </Typography>
                      </Box>
                      <Chip label={v.status} color={getStatusChipColor(v.status) as any} size="small" />
                    </Box>

                    <Typography variant="caption" color="text.secondary" display="block">
                      By {v.employee?.name} ({v.branch?.name})
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      Date: {new Date(v.visitDate).toLocaleDateString()} | {v.activityType?.name}
                    </Typography>

                    <Box sx={{ bgcolor: '#F8FAFC', p: 1, borderRadius: 1, my: 1, fontSize: '0.78rem' }}>
                      <div><strong>Route:</strong> {v.placeFrom} {'->'} {v.placeTo}</div>
                      <div><strong>Items:</strong> {v.expenses?.length || 0} Line Expense(s)</div>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Button size="small" startIcon={<EyeIcon fontSize="small" />} onClick={() => setViewClaim(v)}>
                        Details
                      </Button>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        ₹{Math.round(claimTotal).toLocaleString('en-IN')}
                      </Typography>
                    </Box>
                  </CardContent>

                  {isPending && (
                    <Box sx={{ p: 1.5, bgcolor: '#F1F5F9', display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => setRejectId(v.id)}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleApprove(v.id)}
                      >
                        Approve
                      </Button>
                    </Box>
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* VIEW CLAIM EXPENSE DETAILS MODAL */}
      <Dialog open={Boolean(viewClaim)} onClose={() => setViewClaim(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Expense Claim Details — {viewClaim?.customer?.name}</span>
          {viewClaim && <Chip label={viewClaim.status} color={getStatusChipColor(viewClaim.status) as any} />}
        </DialogTitle>
        <DialogContent dividers>
          {viewClaim && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Visit Date:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{new Date(viewClaim.visitDate).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Visit Timing:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {formatTimeRange(viewClaim.startTime, viewClaim.endTime)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Employee:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{viewClaim.employee?.name}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Branch:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{viewClaim.branch?.name}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Customer Client:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{viewClaim.customer?.name}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Activity Category:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{viewClaim.activityType?.name}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Machine / Product:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{viewClaim.product?.name || '-'}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Travel Route:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{viewClaim.placeFrom} {'->'} {viewClaim.placeTo}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                Itemized Expenses Breakdown
              </Typography>

              <Table size="small" border={1} style={{ borderColor: '#E2E8F0' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Expense Head</TableCell>
                    <TableCell align="right">Start Km</TableCell>
                    <TableCell align="right">End Km</TableCell>
                    <TableCell align="right">Total Km</TableCell>
                    <TableCell align="right">Toll Tax (₹)</TableCell>
                    <TableCell align="right">Amount (₹)</TableCell>
                    <TableCell>Remarks</TableCell>
                    <TableCell align="center">Receipt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {viewClaim.expenses?.map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{e.expenseHead?.name || 'Expense'}</TableCell>
                      <TableCell align="right">{e.dayStartKm || 0}</TableCell>
                      <TableCell align="right">{e.dayEndKm || 0}</TableCell>
                      <TableCell align="right">{e.totalKm || 0}</TableCell>
                      <TableCell align="right">₹{e.tollTax || 0}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        ₹{parseFloat(e.amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>{e.remarks || '-'}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            setActiveReceiptTitle(e.expenseHead?.name || 'Bill Receipt');
                            setReceiptModalOpen(true);
                          }}
                        >
                          <ReceiptIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1.5, mt: 2, bgcolor: '#EEF2FF', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  NET CLAIM AMOUNT: ₹
                  {Math.round(viewClaim.expenses?.reduce((s: number, e: any) => s + parseFloat(e.amount || 0), 0) || 0).toLocaleString('en-IN')}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" onClick={() => setViewClaim(null)}>
            Close Viewer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={Boolean(rejectId)} onClose={() => setRejectId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Reject Expense Claim</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a specific reason for rejecting this field visit claim back to the employee:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Remarks *"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmReject}>
            CONFIRM REJECTION
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receipt Preview Modal */}
      <Dialog open={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Attached Bill Preview — {activeReceiptTitle}
        </DialogTitle>
        <DialogContent dividers sx={{ textAlign: 'center', p: 4 }}>
          <Box
            sx={{
              p: 3,
              border: '2px dashed #CBD5E1',
              borderRadius: 2,
              bgcolor: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <ReceiptIcon color="primary" sx={{ fontSize: 48 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Verified Attachment Document: {activeReceiptTitle}.pdf
            </Typography>
            <Typography variant="caption" color="text.secondary">
              File Status: Verified & Encrypted in Storage | Uploaded by Field Engineer
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" onClick={() => setReceiptModalOpen(false)}>
            Close Viewer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
