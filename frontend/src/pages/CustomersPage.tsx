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
} from '@mui/icons-material';
import api from '../services/api';
import { exportToCsv } from '../utils/exportCsv';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

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

  const handleOpenAddModal = () => {
    setEditingId(null);
    const nextCode = `CUST00${customers.length + 1}`;
    setFormData({
      ...defaultCustomerData,
      customerCode: nextCode,
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
    setOpenModal(true);
  };

  const handleSaveCustomer = async () => {
    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      setOpenModal(false);
      setFormData(defaultCustomerData);
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      alert(err || 'Failed to save customer record');
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/customers/${deleteId}`);
      setDeleteId(null);
      fetchData();
    } catch (err: any) {
      alert(err || 'Failed to delete customer record');
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
            + Add Customer
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

      {/* Add / Edit Customer Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? 'Edit Customer / Prospect Profile' : 'Add New Customer / Prospect'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Customer Code *"
                value={formData.customerCode}
                onChange={(e) => setFormData({ ...formData, customerCode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                size="small"
                label="Customer Organization Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Primary Contact Person"
                value={formData.contactPersonPrimary}
                onChange={(e) => setFormData({ ...formData, contactPersonPrimary: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Website URL"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCustomer}>
            {editingId ? 'UPDATE CUSTOMER' : 'SAVE CUSTOMER'}
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
