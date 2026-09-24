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
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as DownloadIcon,
  PersonAdd as PersonAddIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { exportToCsv } from '../utils/exportCsv';
import { useToast } from '../context/ToastContext';

export const CustomersPage: React.FC = () => {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Contacts Sub-grid State
  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any | null>(null);
  const [contactForm, setContactForm] = useState({
    contactName: '',
    designation: '',
    mobileNo: '',
    email: '',
    isPrimary: false,
  });

  const [industries, setIndustries] = useState<any[]>([]);

  const defaultCustomerData = {
    customerCode: '',
    name: '',
    customerType: 'Prospect',
    industry: 'Automobile & Auto Components',
    contactPersonPrimary: '',
    source: 'Direct Visit',
    website: '',
    address: '',
    city: '',
    state: '',
    status: 'Active',
    remarks: '',
  };

  const [formData, setFormData] = useState(defaultCustomerData);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, mastersRes]: [any, any] = await Promise.all([
        api.get('/customers', { params: { search, customerType: typeFilter || undefined } }),
        api.get('/masters/summary'),
      ]);
      setCustomers(res);
      setIndustries(mastersRes.industries || []);
    } catch (err: any) {
      setError(err || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter]);

  const loadCustomerContacts = async (custId: number) => {
    setLoadingContacts(true);
    try {
      const res: any = await api.get(`/customers/${custId}/contacts`);
      setContacts(res || []);
    } catch (err) {
      console.error('Failed to load contacts', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setContacts([]);
    setFormData({
      ...defaultCustomerData,
      customerCode: '',
    });
    setOpenModal(true);
  };

  const handleOpenEditModal = (cust: any) => {
    setEditingId(cust.id);
    setFormData({
      customerCode: cust.customerCode || '',
      name: cust.name || '',
      customerType: cust.customerType || 'Prospect',
      industry: cust.industry || 'Engineering',
      contactPersonPrimary: cust.contactPersonPrimary || '',
      source: cust.source || 'Direct Visit',
      website: cust.website || '',
      address: cust.address || '',
      city: cust.city || '',
      state: cust.state || '',
      status: cust.status || 'Active',
      remarks: cust.remarks || '',
    });
    loadCustomerContacts(cust.id);
    setOpenModal(true);
  };

  const handleOpenAddContact = () => {
    setEditingContact(null);
    setContactForm({
      contactName: '',
      designation: '',
      mobileNo: '',
      email: '',
      isPrimary: contacts.length === 0,
    });
    setContactDialogOpen(true);
  };

  const handleOpenEditContact = (cnt: any) => {
    setEditingContact(cnt);
    setContactForm({
      contactName: cnt.contactName || '',
      designation: cnt.designation || '',
      mobileNo: cnt.mobileNo || '',
      email: cnt.email || '',
      isPrimary: Boolean(cnt.isPrimary),
    });
    setContactDialogOpen(true);
  };

  const handleSaveContact = async () => {
    if (!contactForm.contactName.trim()) {
      showToast('Contact person name is required!', 'warning');
      return;
    }
    try {
      if (editingContact) {
        await api.put(`/customers/contacts/${editingContact.id}`, {
          ...contactForm,
          customerId: editingId,
        });
        showToast('Contact person updated successfully!', 'success');
      } else {
        await api.post('/customers/contacts', {
          ...contactForm,
          customerId: editingId,
        });
        showToast('New contact person added successfully!', 'success');
      }
      setContactDialogOpen(false);
      if (editingId) {
        loadCustomerContacts(editingId);
        fetchData();
      }
    } catch (err: any) {
      showToast(err || 'Failed to save contact person', 'error');
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    try {
      await api.delete(`/customers/contacts/${contactId}`);
      showToast('Contact person removed successfully', 'info');
      if (editingId) {
        loadCustomerContacts(editingId);
        fetchData();
      }
    } catch (err: any) {
      showToast(err || 'Failed to delete contact person', 'error');
    }
  };

  const handleTogglePrimaryContact = async (cnt: any) => {
    try {
      await api.put(`/customers/contacts/${cnt.id}`, {
        contactName: cnt.contactName,
        designation: cnt.designation,
        mobileNo: cnt.mobileNo,
        email: cnt.email,
        customerId: editingId,
        isPrimary: true,
      });
      showToast(`Set ${cnt.contactName} as primary contact!`, 'success');
      if (editingId) {
        loadCustomerContacts(editingId);
        fetchData();
      }
    } catch (err: any) {
      showToast(err || 'Failed to update primary contact', 'error');
    }
  };

  const handleSaveCustomer = async () => {
    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, formData);
        showToast('Customer profile updated successfully!', 'success');
      } else {
        await api.post('/customers', formData);
        showToast('New customer record created successfully!', 'success');
      }
      setOpenModal(false);
      setFormData(defaultCustomerData);
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      showToast(err || 'Failed to save customer record', 'error');
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/customers/${deleteId}`);
      showToast('Customer record deleted successfully', 'info');
      setDeleteId(null);
      fetchData();
    } catch (err: any) {
      showToast(err || 'Failed to delete customer record', 'error');
    }
  };

  const handleExportCsv = () => {
    const exportData = customers.map((c) => ({
      CustomerCode: c.customerCode,
      Name: c.name,
      Type: c.customerType,
      Industry: c.industry,
      PrimaryContact: c.contactPersonPrimary,
      Source: c.source,
      Website: c.website,
      City: c.city,
      State: c.state,
      Status: c.status,
      Remarks: c.remarks,
    }));
    exportToCsv(`Customers_Export_${new Date().toISOString().split('T')[0]}.csv`, exportData);
  };

  return (
    <Box>
      {!openModal && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Customers & Prospects Directory
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage existing enterprise clients, prospective leads, contact persons, and industries
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCsv}>
                Export CSV
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
                Add Customer
              </Button>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Card sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search customer name, code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ minWidth: 260 }}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
              <TextField
                select
                size="small"
                label="Customer Type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="Existing Customer">Existing Customer</MenuItem>
                <MenuItem value="Prospect">Prospect</MenuItem>
              </TextField>
              <Button variant="contained" onClick={fetchData}>
                Search
              </Button>
            </Box>
          </Card>

          <Card>
            {loading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Customer Organization Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Industry Segment</TableCell>
                    <TableCell>Primary Contact</TableCell>
                    <TableCell>Lead Source</TableCell>
                    <TableCell>Website</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{c.customerCode}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={c.customerType}
                          color={c.customerType === 'Existing Customer' ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{c.industry}</TableCell>
                      <TableCell>{c.contactPersonPrimary || '-'}</TableCell>
                      <TableCell>{c.source || '-'}</TableCell>
                      <TableCell>{c.website || '-'}</TableCell>
                      <TableCell>
                        <Chip label={c.status} color={c.status === 'Active' ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit Customer">
                          <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(c)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Customer">
                          <IconButton size="small" color="error" onClick={() => setDeleteId(c.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </>
      )}

      {/* IN-PAGE CREATE / EDIT CUSTOMER FORM */}
      {openModal && (
        <Box sx={{ mb: 4 }}>
          {/* Top Bar with Back Button and Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => setOpenModal(false)}
                sx={{ textTransform: 'none' }}
              >
                Back to Customers
              </Button>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {editingId ? 'Edit Customer / Prospect Profile' : 'Add New Customer / Prospect'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button variant="outlined" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" onClick={handleSaveCustomer}>
                {editingId ? 'Update Customer' : 'Save Customer'}
              </Button>
            </Box>
          </Box>

          {/* Card 1: Organization & Business Profile */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
              1. Organization & Business Profile
            </Typography>
            <Grid container spacing={2.5}>
              {editingId && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    disabled
                    label="Customer Code"
                    value={formData.customerCode}
                    helperText="Auto-generated (Read-only)"
                  />
                </Grid>
              )}
              <Grid item xs={12} md={editingId ? 6 : 12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Customer Organization Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Customer Type"
                  value={formData.customerType}
                  onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                >
                  <MenuItem value="Existing Customer">Existing Customer</MenuItem>
                  <MenuItem value="Prospect">Prospect</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Industry Segment *"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                >
                  {industries.map((ind) => (
                    <MenuItem key={ind.id} value={ind.name}>
                      {ind.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Primary Contact Person"
                  value={formData.contactPersonPrimary}
                  onChange={(e) => setFormData({ ...formData, contactPersonPrimary: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Lead Source"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                >
                  <MenuItem value="Direct Visit">Direct Visit</MenuItem>
                  <MenuItem value="Reference">Reference</MenuItem>
                  <MenuItem value="Website">Website</MenuItem>
                  <MenuItem value="LinkedIn">LinkedIn</MenuItem>
                  <MenuItem value="Cold Call">Cold Call</MenuItem>
                  <MenuItem value="Exhibition">Exhibition / Event</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Website URL"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Card>

          {/* Card 2: Location & Address */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
              2. Location & Notes
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  label="Full Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  label="Remarks / Notes"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />
              </Grid>
            </Grid>
          </Card>

          {/* Card 3: Child Contacts Directory (when editing) */}
          {editingId && (
            <Card sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    3. Customer Child Contacts Directory ({contacts.length})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Manage key stakeholders, designations, direct phones, emails, and primary contact status
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={handleOpenAddContact}
                >
                  Add Contact Person
                </Button>
              </Box>

              {loadingContacts ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : contacts.length === 0 ? (
                <Alert severity="info" sx={{ py: 1, fontSize: '0.85rem' }}>
                  No child contacts added for this customer yet. Click "Add Contact Person" above.
                </Alert>
              ) : (
                <Table size="small" sx={{ border: '1px solid #E2E8F0', borderRadius: 1 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Contact Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Mobile No</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Primary Contact</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contacts.map((cnt) => (
                      <TableRow key={cnt.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {cnt.isPrimary && <StarIcon sx={{ color: '#F59E0B', fontSize: 18 }} />}
                            <span>{cnt.contactName}</span>
                          </Box>
                        </TableCell>
                        <TableCell>{cnt.designation || '-'}</TableCell>
                        <TableCell>{cnt.mobileNo || '-'}</TableCell>
                        <TableCell>{cnt.email || '-'}</TableCell>
                        <TableCell align="center">
                          {cnt.isPrimary ? (
                            <Chip label="Primary" color="success" size="small" variant="filled" />
                          ) : (
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<StarBorderIcon fontSize="small" />}
                              onClick={() => handleTogglePrimaryContact(cnt)}
                              sx={{ fontSize: '0.75rem', py: 0.2 }}
                            >
                              Make Primary
                            </Button>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit Contact">
                            <IconButton size="small" color="primary" onClick={() => handleOpenEditContact(cnt)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Contact">
                            <IconButton size="small" color="error" onClick={() => handleDeleteContact(cnt.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          )}

          {/* Bottom Sticky Action Bar */}
          <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 2 }}>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleSaveCustomer}>
              {editingId ? 'UPDATE CUSTOMER' : 'SAVE CUSTOMER'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Contact Person Add / Edit Modal Dialog */}
      <Dialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editingContact ? 'Edit Contact Person' : 'Add New Contact Person'}
          </Typography>
          <IconButton onClick={() => setContactDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Contact Name *"
                value={contactForm.contactName}
                onChange={(e) => setContactForm({ ...contactForm, contactName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Designation / Role"
                value={contactForm.designation}
                onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Mobile Number"
                value={contactForm.mobileNo}
                onChange={(e) => setContactForm({ ...contactForm, mobileNo: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="email"
                label="Email Address"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', bgcolor: '#F8FAFC' }}>
          <Button onClick={() => setContactDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveContact}>
            {editingContact ? 'UPDATE CONTACT' : 'SAVE CONTACT'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Delete Customer Record</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Are you sure you want to delete this customer record?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteCustomer}>
            CONFIRM DELETE
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
