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
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  FormControlLabel,
  Checkbox,
  Switch,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ContactsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [contacts, setContacts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    customerId: 1,
    contactName: '',
    designation: '',
    mobileNo: '',
    email: '',
    isPrimary: false,
  });

  const [deleteContactId, setDeleteContactId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cRes, custRes]: [any, any] = await Promise.all([
        api.get('/customers/contacts/all'),
        api.get('/customers'),
      ]);
      setContacts(cRes || []);
      setCustomers(custRes || []);
    } catch (err: any) {
      setError(err || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      customerId: customers[0]?.id || 1,
      contactName: '',
      designation: '',
      mobileNo: '',
      email: '',
      isPrimary: false,
    });
    setOpenModal(true);
  };

  const handleOpenEditModal = (contact: any) => {
    setEditingId(contact.id);
    setFormData({
      customerId: contact.customerId || contact.customer?.id || 1,
      contactName: contact.contactName || '',
      designation: contact.designation || '',
      mobileNo: contact.mobileNo || '',
      email: contact.email || '',
      isPrimary: contact.isPrimary || false,
    });
    setOpenModal(true);
  };

  const handleSaveContact = async () => {
    if (!formData.contactName.trim()) {
      showToast('Contact Person Name is required!', 'warning');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/customers/contacts/${editingId}`, formData);
        showToast('Contact person updated successfully!', 'success');
      } else {
        await api.post('/customers/contacts', formData);
        showToast('New contact person created successfully!', 'success');
      }
      setOpenModal(false);
      fetchData();
    } catch (err: any) {
      showToast(err || 'Failed to save contact', 'error');
    }
  };

  const handleDeleteContact = async () => {
    if (!deleteContactId) return;
    try {
      await api.delete(`/customers/contacts/${deleteContactId}`);
      showToast('Contact person removed successfully', 'info');
      setDeleteContactId(null);
      fetchData();
    } catch (err: any) {
      showToast(err || 'Failed to delete contact', 'error');
    }
  };

  const handleTogglePrimaryDirect = async (contact: any) => {
    try {
      await api.put(`/customers/contacts/${contact.id}`, {
        customerId: contact.customerId || contact.customer?.id,
        contactName: contact.contactName,
        isPrimary: !contact.isPrimary,
      });
      showToast(`Primary contact set for ${contact.customer?.name || 'Customer'}!`, 'success');
      fetchData();
    } catch (err: any) {
      showToast(err || 'Failed to toggle primary status', 'error');
    }
  };

  const getCustomerLabel = (c: any) => {
    if (c.customer?.name) {
      return `${c.customer.name}${c.customer.customerCode ? ` (${c.customer.customerCode})` : ''}`;
    }
    const custId = c.customerId || c.customer?.id;
    const found = customers.find((cust) => Number(cust.id) === Number(custId));
    if (found) {
      return `${found.name}${found.customerCode ? ` (${found.customerCode})` : ''}`;
    }
    return c.customerName || '-';
  };

  const filteredContacts = contacts.filter((c) => {
    if (selectedCustomerId && String(c.customerId || c.customer?.id) !== String(selectedCustomerId)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.contactName?.toLowerCase().includes(q);
      const custLabel = getCustomerLabel(c).toLowerCase();
      const matchCust = custLabel.includes(q);
      const matchDesg = c.designation?.toLowerCase().includes(q);
      const matchPhone = c.mobileNo?.toLowerCase().includes(q);
      if (!matchName && !matchCust && !matchDesg && !matchPhone) return false;
    }
    return true;
  });

  return (
    <Box>
      {!openModal && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Customer Contacts Directory
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage contact personnel, designations, and primary contacts for default visit logging
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
              Add New Contact
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Filter Bar */}
          <Card sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search contact name, customer, designation, mobile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Filter by Customer"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  <MenuItem value="">All Customers</MenuItem>
                  {customers.map((cust) => (
                    <MenuItem key={cust.id} value={cust.id}>{cust.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCustomerId('');
                  }}
                >
                  Reset
                </Button>
              </Grid>
            </Grid>
          </Card>

          {/* Contacts Table */}
          <Card>
            {loading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Customer Organization</TableCell>
                    <TableCell>Contact Person Name</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Mobile Number</TableCell>
                    <TableCell>Email Address</TableCell>
                    <TableCell align="center">Primary Contact</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No contacts found matching criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContacts.map((c) => (
                      <TableRow key={c.id} hover>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{getCustomerLabel(c)}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{c.contactName}</TableCell>
                        <TableCell>{c.designation || '-'}</TableCell>
                        <TableCell>{c.mobileNo || '-'}</TableCell>
                        <TableCell>{c.email || '-'}</TableCell>
                        <TableCell align="center">
                          <Tooltip title={c.isPrimary ? 'Primary Contact' : 'Set as Primary Contact'}>
                            <Switch
                              checked={Boolean(c.isPrimary)}
                              onChange={() => handleTogglePrimaryDirect(c)}
                              color="primary"
                              size="small"
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit Contact">
                            <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(c)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Contact">
                            <IconButton size="small" color="error" onClick={() => setDeleteContactId(c.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        </>
      )}

      {/* IN-PAGE CREATE / EDIT CONTACT FORM */}
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
                Back to Contacts
              </Button>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {editingId ? 'Edit Contact Person' : 'Add New Customer Contact Person'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button variant="outlined" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" onClick={handleSaveContact}>
                {editingId ? 'Update Contact' : 'Save Contact'}
              </Button>
            </Box>
          </Box>

          {/* Card 1: Contact Information */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
              1. Contact Person & Organization Details
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Customer Organization *"
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: Number(e.target.value) })}
                >
                  {customers.map((cust) => (
                    <MenuItem key={cust.id} value={cust.id}>{cust.name} ({cust.customerCode})</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Contact Person Name *"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Designation / Role"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mobile Number"
                  value={formData.mobileNo}
                  onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isPrimary}
                      onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Designate as Primary Contact for Customer
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </Card>

          {/* Bottom Sticky Action Bar */}
          <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 2 }}>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleSaveContact}>
              {editingId ? 'UPDATE CONTACT' : 'SAVE CONTACT'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteContactId)} onClose={() => setDeleteContactId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Delete Contact Person</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Are you sure you want to delete this contact person record?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteContactId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteContact}>
            CONFIRM DELETE
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
