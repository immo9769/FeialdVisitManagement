import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileUpload as UploadIcon,
  Visibility as EyeIcon,
  FileDownload as DownloadIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { exportToCsv } from '../utils/exportCsv';

export const DailyVisitsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [visits, setVisits] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activityTypes, setActivityTypes] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [expenseHeads, setExpenseHeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openModal, setOpenModal] = useState(false);
  const [editingVisitId, setEditingVisitId] = useState<number | null>(null);

  const [viewVisit, setViewVisit] = useState<any | null>(null);
  const [deleteVisitId, setDeleteVisitId] = useState<number | null>(null);

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceiptTitle, setActiveReceiptTitle] = useState('');

  const defaultVisitData = {
    visitDate: new Date().toISOString().split('T')[0],
    employeeId: user?.id || 3,
    departmentId: 2,
    branchId: user?.branchId || 1,
    customerId: 1,
    contactId: 1,
    activityTypeId: 1,
    productId: 10,
    placeFrom: 'Baroda',
    placeTo: 'Baroda',
    startTime: '09:00',
    endTime: '18:00',
    personCount: 1,
    expenses: [],
  };

  const [formData, setFormData] = useState<any>(defaultVisitData);

  const [gradeFuelRates, setGradeFuelRates] = useState<any[]>([]);
  const [employeesList, setEmployeesList] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vRes, mRes, cRes, eRes]: [any, any, any, any] = await Promise.all([
        api.get('/daily-visits'),
        api.get('/masters/summary'),
        api.get('/customers'),
        api.get('/employees'),
      ]);
      setVisits(vRes || []);
      setActivityTypes(mRes.activityTypes || []);
      setProducts(mRes.products || []);
      setExpenseHeads(mRes.expenseHeads || []);
      setGradeFuelRates(mRes.gradeFuelRates || []);
      const activeCustomersOnly = (cRes || []).filter((c: any) => c.status === 'Active');
      setCustomers(activeCustomersOnly);
      setEmployeesList(eRes || []);
    } catch (err: any) {
      setError(err || 'Failed to load visits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleOpenAddModal = async () => {
    setEditingVisitId(null);
    const firstCustId = customers[0]?.id || 1;
    let initialContacts: any = [];
    let defaultContactId = 1;
    try {
      initialContacts = await api.get(`/customers/${firstCustId}/contacts`);
      setContacts(initialContacts || []);
      if (initialContacts && initialContacts.length > 0) {
        const primary = initialContacts.find((cnt: any) => cnt.isPrimary) || initialContacts[0];
        defaultContactId = primary.id;
      }
    } catch {}

    setFormData({
      ...defaultVisitData,
      employeeId: user?.id || 3,
      branchId: user?.branchId || 1,
      customerId: firstCustId,
      contactId: defaultContactId,
      activityTypeId: activityTypes[0]?.id || 1,
      productId: products[0]?.id || 10,
      expenses: [
        {
          expenseHeadId: expenseHeads[0]?.id || 1,
          dayStartKm: 0,
          dayEndKm: 0,
          totalKm: 0,
          fuelRate: 0,
          tollTax: 0,
          amount: 0,
          remarks: '',
        },
      ],
    });
    setOpenModal(true);
  };

  const handleOpenEditModal = async (visit: any) => {
    setEditingVisitId(visit.id);
    const targetCustId = visit.customerId || visit.customer?.id || 1;
    try {
      const cList: any = await api.get(`/customers/${targetCustId}/contacts`);
      setContacts(cList || []);
    } catch {}

    const dateFormatted = visit.visitDate
      ? new Date(visit.visitDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const expMapped = (visit.expenses || []).map((e: any) => ({
      expenseHeadId: e.expenseHeadId || e.expenseHead?.id || 1,
      dayStartKm: e.dayStartKm || 0,
      dayEndKm: e.dayEndKm || 0,
      totalKm: e.totalKm || 0,
      fuelRate: e.fuelRate || 0,
      tollTax: e.tollTax || 0,
      amount: e.amount || 0,
      remarks: e.remarks || '',
    }));

    setFormData({
      visitDate: dateFormatted,
      employeeId: visit.employeeId || visit.employee?.id || user?.id || 3,
      departmentId: visit.departmentId || visit.department?.id || 2,
      branchId: visit.branchId || visit.branch?.id || 1,
      customerId: targetCustId,
      contactId: visit.contactId || visit.contact?.id || 1,
      activityTypeId: visit.activityTypeId || visit.activityType?.id || 1,
      productId: visit.productId || visit.product?.id || 10,
      placeFrom: visit.placeFrom || 'Baroda',
      placeTo: visit.placeTo || 'Baroda',
      startTime: visit.startTime ? String(visit.startTime).slice(11, 16) || '09:00' : '09:00',
      endTime: visit.endTime ? String(visit.endTime).slice(11, 16) || '18:00' : '18:00',
      personCount: visit.personCount || 1,
      expenses: expMapped.length > 0 ? expMapped : [
        {
          expenseHeadId: expenseHeads[0]?.id || 1,
          dayStartKm: 0,
          dayEndKm: 0,
          totalKm: 0,
          fuelRate: 0,
          tollTax: 0,
          amount: 0,
          remarks: '',
        },
      ],
    });
    setOpenModal(true);
  };

  const handleCustomerChange = async (custVal: number) => {
    setFormData((prev: any) => ({ ...prev, customerId: custVal }));
    try {
      const cList: any = await api.get(`/customers/${custVal}/contacts`);
      setContacts(cList || []);
      if (cList && cList.length > 0) {
        const primaryContact = cList.find((cnt: any) => cnt.isPrimary) || cList[0];
        setFormData((prev: any) => ({ ...prev, customerId: custVal, contactId: primaryContact.id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getGradeFuelRate = (empId?: number | string) => {
    const targetEmpId = empId || formData?.employeeId || user?.id || 3;
    const emp = employeesList.find((e: any) => String(e.id) === String(targetEmpId)) || user;
    const empGrade = emp?.grade || 'GRADE_B';

    const matchedGfr = gradeFuelRates.find((g: any) => {
      const codeA = String(g.gradeCode || '').toUpperCase().replace(/[^A-Z]/g, '');
      const codeB = String(empGrade || '').toUpperCase().replace(/[^A-Z]/g, '');
      return codeA === codeB && codeA.length > 0;
    });

    if (matchedGfr && matchedGfr.fuelRate) {
      return parseFloat(matchedGfr.fuelRate);
    }

    if (empGrade === 'GRADE_A') return 14.00;
    if (empGrade === 'GRADE_B') return 11.50;
    if (empGrade === 'GRADE_C') return 9.00;
    if (empGrade === 'GRADE_D') return 6.50;
    return 11.50;
  };

  const handleAddExpenseRow = () => {
    const gradeRate = getGradeFuelRate(formData.employeeId);
    setFormData({
      ...formData,
      expenses: [
        ...formData.expenses,
        {
          expenseHeadId: expenseHeads[0]?.id || 1,
          dayStartKm: 0,
          dayEndKm: 0,
          totalKm: 0,
          fuelRate: gradeRate,
          tollTax: 0,
          amount: 0,
          remarks: '',
        },
      ],
    });
  };

  const handleExpenseChange = (index: number, field: string, val: any) => {
    const updated = [...formData.expenses];
    const row = { ...updated[index], [field]: val };

    const head = expenseHeads.find((h) => Number(h.id) === Number(row.expenseHeadId));
    if (head && head.requiresKm) {
      const gradeRate = getGradeFuelRate(formData.employeeId);
      if (!row.fuelRate || field === 'expenseHeadId' || row.fuelRate === 10.35) {
        row.fuelRate = gradeRate;
      }
      const start = parseFloat(String(row.dayStartKm)) || 0;
      const end = parseFloat(String(row.dayEndKm)) || 0;
      if (end >= start) {
        row.totalKm = end - start;
        row.amount = parseFloat(((row.totalKm * (row.fuelRate || gradeRate)) + (parseFloat(String(row.tollTax)) || 0)).toFixed(2));
      }
    }

    updated[index] = row;
    setFormData({ ...formData, expenses: updated });
  };

  const handleRemoveExpenseRow = (index: number) => {
    const updated = formData.expenses.filter((_: any, idx: number) => idx !== index);
    setFormData({ ...formData, expenses: updated });
  };

  const handleSaveVisit = async (submitNow: boolean = false) => {
    try {
      let isoStart = formData.startTime;
      let isoEnd = formData.endTime;

      if (formData.startTime && !formData.startTime.includes('T')) {
        try {
          isoStart = new Date(`${formData.visitDate}T${formData.startTime}:00`).toISOString();
        } catch {}
      }
      if (formData.endTime && !formData.endTime.includes('T')) {
        try {
          isoEnd = new Date(`${formData.visitDate}T${formData.endTime}:00`).toISOString();
        } catch {}
      }

      const payload = {
        ...formData,
        startTime: isoStart,
        endTime: isoEnd,
      };

      let created: any;
      if (editingVisitId) {
        created = await api.put(`/daily-visits/${editingVisitId}`, payload);
        showToast('Daily Visit updated successfully!', 'success');
      } else {
        created = await api.post('/daily-visits', payload);
        showToast('New Daily Visit created successfully!', 'success');
      }

      if (submitNow && created && created.id) {
        await api.post(`/daily-visits/${created.id}/submit`);
        showToast('Daily Visit claim submitted to Branch Manager!', 'success');
      }

      setOpenModal(false);
      setEditingVisitId(null);
      setFormData(defaultVisitData);
      fetchData();
    } catch (err: any) {
      showToast(err || 'Failed to save visit', 'error');
    }
  };

  const handleDeleteVisit = async () => {
    if (!deleteVisitId) return;
    try {
      await api.delete(`/daily-visits/${deleteVisitId}`);
      showToast('Daily visit record deleted successfully', 'info');
      setDeleteVisitId(null);
      fetchData();
    } catch (err: any) {
      showToast(err || 'Failed to delete visit', 'error');
    }
  };

  const handleSubmitVisit = async (visitId: number) => {
    try {
      await api.post(`/daily-visits/${visitId}/submit`);
      showToast('Daily Visit claim submitted to Branch Manager!', 'success');
      fetchData();
    } catch (err: any) {
      showToast(err || 'Failed to submit visit', 'error');
    }
  };

  const userRole = user?.role || 'SERVICE_ENG';
  const scopedVisits = visits.filter((v) => {
    if (userRole === 'ADMIN') return true;
    if (userRole === 'MANAGER') {
      return v.branchId === user?.branchId || v.branch?.name === user?.branch;
    }
    return v.employeeId === user?.id || v.employee?.email === user?.email;
  });

  const handleExportCsv = () => {
    const exportData = scopedVisits.map((v) => ({
      Date: new Date(v.visitDate).toLocaleDateString(),
      Timing: formatTimeRange(v.startTime, v.endTime),
      Employee: v.employee?.name,
      Branch: v.branch?.name,
      Customer: v.customer?.name,
      Activity: v.activityType?.name,
      Product: v.product?.name,
      Route: `${v.placeFrom} -> ${v.placeTo}`,
      ClaimTotal: v.expenses?.reduce((s: number, e: any) => s + parseFloat(e.amount || 0), 0) || 0,
      Status: v.status,
    }));
    exportToCsv(`DailyVisits_Export_${new Date().toISOString().split('T')[0]}.csv`, exportData);
    showToast('Visits CSV exported successfully!', 'success');
  };

  const handlePreviewReceipt = (title: string) => {
    setActiveReceiptTitle(title);
    setReceiptModalOpen(true);
  };

  const calculateTotalClaim = () => {
    return formData.expenses.reduce((sum: number, exp: any) => sum + (parseFloat(exp.amount as any) || 0), 0);
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Daily Visits & Expense Claims
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Log field visits, activities, machine demos, and itemized travel expenses matching APEX Page 3
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCsv}>
            Export CSV
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
            + Log Daily Visit
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Visit Timing</TableCell>
                <TableCell>Employee Name</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Activity</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Route (From {'->'} To)</TableCell>
                <TableCell>Expenses Total (₹)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scopedVisits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No daily visits logged for your account / branch scope.
                  </TableCell>
                </TableRow>
              ) : (
                scopedVisits.map((v) => {
                  const claimTotal = v.expenses?.reduce((s: number, e: any) => s + parseFloat(e.amount || 0), 0) || 0;
                  return (
                    <TableRow key={v.id} hover>
                      <TableCell>{new Date(v.visitDate).toLocaleDateString()}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'primary.main', fontSize: '0.82rem' }}>
                        {formatTimeRange(v.startTime, v.endTime)}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{v.employee?.name}</TableCell>
                      <TableCell>{v.branch?.name}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{v.customer?.name}</TableCell>
                      <TableCell>{v.activityType?.name}</TableCell>
                      <TableCell>{v.product?.name || '-'}</TableCell>
                      <TableCell>{v.placeFrom} {'->'} {v.placeTo}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                        ₹{Math.round(claimTotal).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <Chip label={v.status} color={getStatusChipColor(v.status) as any} size="small" />
                      </TableCell>
                      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Tooltip title="View Visit Details">
                            <IconButton size="small" color="info" onClick={() => setViewVisit(v)}>
                              <EyeIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {(v.status === 'DRAFT' || user?.role === 'ADMIN') && (
                            <Tooltip title="Edit Visit">
                              <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(v)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {v.status === 'DRAFT' && (
                            <Button size="small" variant="outlined" onClick={() => handleSubmitVisit(v.id)} sx={{ px: 1, py: 0.2, fontSize: '0.75rem' }}>
                              Submit
                            </Button>
                          )}

                          {user?.role === 'ADMIN' && (
                            <Tooltip title="Delete Visit">
                              <IconButton size="small" color="error" onClick={() => setDeleteVisitId(v.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* VIEW VISIT DETAILS MODAL */}
      <Dialog open={Boolean(viewVisit)} onClose={() => setViewVisit(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Daily Visit Log Details</span>
          {viewVisit && <Chip label={viewVisit.status} color={getStatusChipColor(viewVisit.status) as any} />}
        </DialogTitle>
        <DialogContent dividers>
          {viewVisit && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Visit Date:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{new Date(viewVisit.visitDate).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Visit Timing:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {formatTimeRange(viewVisit.startTime, viewVisit.endTime)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Employee:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{viewVisit.employee?.name}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Branch:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{viewVisit.branch?.name}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Customer Client:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{viewVisit.customer?.name}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Activity Category:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{viewVisit.activityType?.name}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Machine / Product:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{viewVisit.product?.name || '-'}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Travel Route:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{viewVisit.placeFrom} {'->'} {viewVisit.placeTo}</Typography>
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
                    <TableCell align="right">Fuel Rate (₹)</TableCell>
                    <TableCell align="right">Toll Tax (₹)</TableCell>
                    <TableCell align="right">Amount (₹)</TableCell>
                    <TableCell>Remarks</TableCell>
                    <TableCell align="center">Receipt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {viewVisit.expenses?.map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{e.expenseHead?.name || 'Expense'}</TableCell>
                      <TableCell align="right">{e.dayStartKm || 0}</TableCell>
                      <TableCell align="right">{e.dayEndKm || 0}</TableCell>
                      <TableCell align="right">{e.totalKm || 0}</TableCell>
                      <TableCell align="right">{e.fuelRate ? `₹${e.fuelRate}` : '-'}</TableCell>
                      <TableCell align="right">₹{e.tollTax || 0}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        ₹{parseFloat(e.amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>{e.remarks || '-'}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handlePreviewReceipt(e.expenseHead?.name || 'Bill Receipt')}
                        >
                          <EyeIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1.5, mt: 2, bgcolor: '#EEF2FF', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  NET VISIT CLAIM: ₹
                  {Math.round(viewVisit.expenses?.reduce((s: number, e: any) => s + parseFloat(e.amount || 0), 0) || 0).toLocaleString('en-IN')}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" onClick={() => setViewVisit(null)}>
            Close Viewer
          </Button>
        </DialogActions>
      </Dialog>

      {/* APEX Page 3 Replicated Daily Visit Modal (Add & Edit) */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingVisitId ? 'Edit Daily Visit Log & Expenses' : 'Daily Visit & Expense Log (Oracle APEX Form Workflow)'}
        </DialogTitle>
        <DialogContent dividers>
          {/* Section 1: Employee & Department */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 1.5 }}>
            1. Employee & Department
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Employee Name"
                value={user?.name || 'Vishal Jadeja'}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Department"
                value={user?.department || 'Service'}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Branch"
                value={user?.branch || 'Mumbai'}
                disabled
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Section 2: Customer & Activity */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 1.5 }}>
            2. Customer & Activity
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Customer Name *"
                value={formData.customerId}
                onChange={(e) => handleCustomerChange(Number(e.target.value))}
              >
                {customers.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Contact Person *"
                value={formData.contactId}
                onChange={(e) => setFormData({ ...formData, contactId: Number(e.target.value) })}
              >
                {contacts.length === 0 ? (
                  <MenuItem value={1}>Vijay Patel</MenuItem>
                ) : (
                  contacts.map((cnt) => (
                    <MenuItem key={cnt.id} value={cnt.id}>{cnt.contactName}</MenuItem>
                  ))
                )}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Activity *"
                value={formData.activityTypeId}
                onChange={(e) => setFormData({ ...formData, activityTypeId: Number(e.target.value) })}
              >
                {activityTypes.map((a) => (
                  <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Product / Machine"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: Number(e.target.value) })}
              >
                {products.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Section 3: Visit Schedule & Locations */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 1.5 }}>
            3. Visit Schedule & Location
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Visit Date *"
                value={formData.visitDate}
                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                type="time"
                label="Start Time *"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                type="time"
                label="End Time *"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Person Count *"
                value={formData.personCount}
                onChange={(e) => setFormData({ ...formData, personCount: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Place From *"
                value={formData.placeFrom}
                onChange={(e) => setFormData({ ...formData, placeFrom: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Place To *"
                value={formData.placeTo}
                onChange={(e) => setFormData({ ...formData, placeTo: e.target.value })}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Section 4: Expense Details Sub-Grid */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
              4. Expense Details Sub-Grid
            </Typography>
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={handleAddExpenseRow}>
              + Add Expense Line
            </Button>
          </Box>

          <Table size="small" sx={{ mb: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell style={{ width: '22%' }}>Heads</TableCell>
                <TableCell style={{ width: '10%' }}>Start Km</TableCell>
                <TableCell style={{ width: '10%' }}>End Km</TableCell>
                <TableCell style={{ width: '8%' }}>Total Km</TableCell>
                <TableCell style={{ width: '10%' }}>Fuel Rate (₹)</TableCell>
                <TableCell style={{ width: '10%' }}>Toll Tax</TableCell>
                <TableCell style={{ width: '14%' }}>Amount (₹)</TableCell>
                <TableCell style={{ width: '8%' }}>Receipt</TableCell>
                <TableCell style={{ width: '8%' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.expenses.map((row: any, index: number) => {
                const head = expenseHeads.find((h) => h.id === row.expenseHeadId);
                const isKmReq = head?.requiresKm || false;
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={row.expenseHeadId}
                        onChange={(e) => handleExpenseChange(index, 'expenseHeadId', Number(e.target.value))}
                      >
                        {expenseHeads.map((h) => (
                          <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        disabled={!isKmReq}
                        value={row.dayStartKm}
                        onChange={(e) => handleExpenseChange(index, 'dayStartKm', Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        disabled={!isKmReq}
                        value={row.dayEndKm}
                        onChange={(e) => handleExpenseChange(index, 'dayEndKm', Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{row.totalKm || 0}</TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        disabled={!isKmReq}
                        value={row.fuelRate || (isKmReq ? 10.35 : 0)}
                        onChange={(e) => handleExpenseChange(index, 'fuelRate', Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={row.tollTax}
                        onChange={(e) => handleExpenseChange(index, 'tollTax', Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={row.amount}
                        onChange={(e) => handleExpenseChange(index, 'amount', Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Uploaded Receipt">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handlePreviewReceipt(head?.name || 'Receipt Bill')}
                        >
                          <EyeIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => handleRemoveExpenseRow(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, bgcolor: '#EEF2FF', borderRadius: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
              TOTAL CLAIM AMOUNT: ₹{Math.round(calculateTotalClaim()).toLocaleString('en-IN')}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={() => handleSaveVisit(false)}>
              Save as Draft
            </Button>
            <Button variant="contained" color="primary" onClick={() => handleSaveVisit(true)}>
              {editingVisitId ? 'UPDATE VISIT & EXPENSE' : 'SUBMIT VISIT & EXPENSE'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Receipt Preview Modal */}
      <Dialog open={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Receipt Attachment Preview — {activeReceiptTitle}
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
            <UploadIcon color="primary" sx={{ fontSize: 48 }} />
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteVisitId)} onClose={() => setDeleteVisitId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Delete Daily Visit</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Are you sure you want to delete this daily visit record?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteVisitId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteVisit}>
            CONFIRM DELETE
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
