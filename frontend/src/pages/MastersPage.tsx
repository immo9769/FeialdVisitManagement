import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as DownloadIcon,
  LocalGasStation as FuelIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { exportToCsv } from '../utils/exportCsv';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`master-tabpanel-${index}`}
      aria-labelledby={`master-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const TAB_TYPES = [
  'branches',
  'departments',
  'designations',
  'products',
  'activity-types',
  'expense-heads',
  'grade-fuel-rates',
  'industries',
  'principals',
];

export const MastersPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = useState<any>({});
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);

  const defaultFormData = {
    code: '',
    name: '',
    title: '',
    city: '',
    managerId: '',
    category: 'VMC',
    description: '',
    requiresKm: false,
    defaultRate: 0,
    requiresAttachment: false,
    gradeCode: '',
    gradeName: '',
    fuelRate: 10.35,
    principal: '',
    country: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    role: 'ALL',
    unitPrice: 0,
    isActive: true,
  };

  const [formData, setFormData] = useState<any>(defaultFormData);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mastersRes, empRes]: [any, any] = await Promise.all([
        api.get('/masters/summary'),
        api.get('/employees'),
      ]);
      setData(mastersRes);
      setEmployees(empRes || []);
    } catch (err: any) {
      setError(err || 'Failed to load master tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeType = TAB_TYPES[tabValue];

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData(defaultFormData);
    setOpenModal(true);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      ...defaultFormData,
      code: item.code || item.gradeCode || '',
      name: item.name || item.title || item.gradeName || '',
      title: item.title || item.name || '',
      city: item.city || '',
      managerId: item.managerId || (item.manager?.id ? String(item.manager.id) : ''),
      category: item.category || 'VMC',
      description: item.description || '',
      requiresKm: item.requiresKm || false,
      defaultRate: item.defaultRate || 0,
      requiresAttachment: item.requiresAttachment || false,
      gradeCode: item.gradeCode || '',
      gradeName: item.gradeName || '',
      fuelRate: item.fuelRate || 10.35,
      principal: item.principal || '',
      country: item.country || '',
      contactPerson: item.contactPerson || '',
      contactEmail: item.contactEmail || '',
      contactPhone: item.contactPhone || '',
      role: item.role || 'ALL',
      unitPrice: item.unitPrice || 0,
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setOpenModal(true);
  };

  const handleSaveMaster = async () => {
    try {
      if (editingItem) {
        await api.put(`/masters/${activeType}/${editingItem.id}`, formData);
      } else {
        await api.post(`/masters/${activeType}`, formData);
      }
      setOpenModal(false);
      setEditingItem(null);
      fetchData();
    } catch (err: any) {
      alert(err || 'Failed to save master record');
    }
  };

  const handleDeleteMaster = async () => {
    if (!deleteItem) return;
    try {
      await api.delete(`/masters/${activeType}/${deleteItem.id}`);
      setDeleteItem(null);
      fetchData();
    } catch (err: any) {
      alert(err || 'Failed to delete master record');
    }
  };

  const handleExportCsv = () => {
    let list: any[] = [];
    if (tabValue === 0) list = data.branches || [];
    if (tabValue === 1) list = data.departments || [];
    if (tabValue === 2) list = data.designations || [];
    if (tabValue === 3) list = data.products || [];
    if (tabValue === 4) list = data.activityTypes || [];
    if (tabValue === 5) list = data.expenseHeads || [];
    if (tabValue === 6) list = data.gradeFuelRates || [];
    if (tabValue === 7) list = data.industries || [];
    if (tabValue === 8) list = data.principals || [];

    exportToCsv(`Master_${activeType}_Export_${new Date().toISOString().split('T')[0]}.csv`, list);
  };

  if (loading && !data.branches) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Master Data Management (MDM)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure global branches, products catalog, OEM principals, activity categories, expense heads, grade fuel rates, and industry segments
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCsv}>
            Export CSV
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
            Add Master Item
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ p: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)} variant="scrollable" scrollButtons="auto">
            <Tab label={`Branches (${data.branches?.length || 0})`} />
            <Tab label={`Departments (${data.departments?.length || 0})`} />
            <Tab label={`Designations (${data.designations?.length || 0})`} />
            <Tab label={`Products (${data.products?.length || 0})`} />
            <Tab label={`Activity Types (${data.activityTypes?.length || 0})`} />
            <Tab label={`Expense Heads (${data.expenseHeads?.length || 0})`} />
            <Tab icon={<FuelIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Grade Fuel Rates (${data.gradeFuelRates?.length || 0})`} />
            <Tab label={`Industries (${data.industries?.length || 0})`} />
            <Tab label={`Principals / OEM Brands (${data.principals?.length || 0})`} />
          </Tabs>
        </Box>

        {/* Branches Panel */}
        <CustomTabPanel value={tabValue} index={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Branch Name</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Mapped Branch Manager</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.branches?.map((row: any) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{row.code}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                  <TableCell>{row.city || '-'}</TableCell>
                  <TableCell sx={{ color: 'primary.main', fontWeight: 600 }}>
                    {row.manager?.name || 'Unassigned'}
                  </TableCell>
                  <TableCell>
                    <Chip label={row.isActive ? 'Active' : 'Inactive'} color={row.isActive ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit Branch">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Branch">
                      <IconButton size="small" color="error" onClick={() => setDeleteItem(row)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CustomTabPanel>

        {/* Departments Panel */}
        <CustomTabPanel value={tabValue} index={1}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Department Name</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.departments?.map((row: any) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{row.code}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit Department">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Department">
                      <IconButton size="small" color="error" onClick={() => setDeleteItem(row)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CustomTabPanel>

        {/* Designations Panel */}
        <CustomTabPanel value={tabValue} index={2}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Designation Title</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.designations?.map((row: any) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{row.code}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{row.title}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit Designation">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Designation">
                      <IconButton size="small" color="error" onClick={() => setDeleteItem(row)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CustomTabPanel>

        {/* Products Panel */}
        <CustomTabPanel value={tabValue} index={3}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Machine Product Name</TableCell>
                <TableCell>Principal</TableCell>
                <TableCell>Target Role</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Unit Price (₹)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.products?.map((row: any) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{row.code}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                  <TableCell><Chip label={row.principal || 'General'} size="small" variant="outlined" /></TableCell>
                  <TableCell>
                    <Chip
                      label={row.role === 'SALES_EXEC' ? 'Sales' : row.role === 'SERVICE_ENG' ? 'Service' : 'All Roles'}
                      size="small"
                      color={row.role === 'SALES_EXEC' ? 'warning' : row.role === 'SERVICE_ENG' ? 'info' : 'default'}
                    />
                  </TableCell>
                  <TableCell><Chip label={row.category || 'General'} size="small" color="secondary" variant="outlined" /></TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>₹{(Number(row.unitPrice) || 0).toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Chip label={row.isActive ? 'Active' : 'Inactive'} color={row.isActive ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit Product">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Product">
                      <IconButton size="small" color="error" onClick={() => setDeleteItem(row)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CustomTabPanel>

        {/* Activity Types Panel */}
        <CustomTabPanel value={tabValue} index={4}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Activity Name</TableCell>
                <TableCell>Target Role</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.activityTypes?.map((row: any) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{row.code}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.role === 'SALES_EXEC' ? 'Sales' : row.role === 'SERVICE_ENG' ? 'Service' : 'All Roles'}
                      size="small"
                      color={row.role === 'SALES_EXEC' ? 'warning' : row.role === 'SERVICE_ENG' ? 'info' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{row.description || '-'}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit Activity Type">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Activity Type">
                      <IconButton size="small" color="error" onClick={() => setDeleteItem(row)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CustomTabPanel>

        {/* Expense Heads Panel */}
        <CustomTabPanel value={tabValue} index={5}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Expense Head Name</TableCell>
                <TableCell>Receipt Required</TableCell>
                <TableCell>Requires Km</TableCell>
                <TableCell>Default Rate (₹)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.expenseHeads?.map((row: any) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{row.code}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                  <TableCell>
                    <Chip label={row.requiresAttachment ? 'Bill Required' : 'No Bill'} color={row.requiresAttachment ? 'warning' : 'default'} size="small" />
                  </TableCell>
                  <TableCell>{row.requiresKm ? 'Yes (Fuel)' : 'No'}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>₹{row.defaultRate || 0}</TableCell>
                  <TableCell>
                    <Chip label={row.isActive ? 'Active' : 'Inactive'} color={row.isActive ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit Expense Head">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Expense Head">
                      <IconButton size="small" color="error" onClick={() => setDeleteItem(row)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CustomTabPanel>

        {/* Grade Fuel Rates Matrix Panel */}
        <CustomTabPanel value={tabValue} index={6}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Grade Code</TableCell>
                <TableCell>Grade Name</TableCell>
                <TableCell>Mapped Fuel Rate (₹ / km)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.gradeFuelRates?.map((row: any) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Chip label={row.gradeCode?.replace('_', ' ').replace('GRADE', 'Grade') || row.gradeCode} color="secondary" size="small" sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.gradeName}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1rem' }}>
                    ₹{row.fuelRate} / km
                  </TableCell>
                  <TableCell>
                    <Chip label={row.isActive ? 'Active' : 'Inactive'} color={row.isActive ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit Fuel Rate for Grade">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Grade Rate">
                      <IconButton size="small" color="error" onClick={() => setDeleteItem(row)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CustomTabPanel>

        {/* Industry Master Panel */}
        <CustomTabPanel value={tabValue} index={7}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Industry Code</TableCell>
                <TableCell>Industry Segment Name</TableCell>
                <TableCell>Description / Segment Details</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.industries?.map((row: any) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{row.code}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                  <TableCell>{row.description || '-'}</TableCell>
                  <TableCell>
                    <Chip label={row.isActive ? 'Active' : 'Inactive'} color={row.isActive ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit Industry Segment">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Industry Segment">
                      <IconButton size="small" color="error" onClick={() => setDeleteItem(row)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CustomTabPanel>

        {/* Principals / OEM Brands Master Panel */}
        <CustomTabPanel value={tabValue} index={8}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Principal / OEM Name</TableCell>
                <TableCell>Country / Origin</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Contact Email</TableCell>
                <TableCell>Contact Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.principals?.map((row: any) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{row.code}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{row.name}</TableCell>
                  <TableCell>
                    <Chip label={row.country || 'Global'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{row.contactPerson || '-'}</TableCell>
                  <TableCell>{row.contactEmail || '-'}</TableCell>
                  <TableCell>{row.contactPhone || '-'}</TableCell>
                  <TableCell>
                    <Chip label={row.isActive ? 'Active' : 'Inactive'} color={row.isActive ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit Principal">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Principal">
                      <IconButton size="small" color="error" onClick={() => setDeleteItem(row)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CustomTabPanel>
      </Card>

      {/* Add / Edit Master Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
          {editingItem ? `Edit Master (${activeType})` : `Add Master Item (${activeType})`}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {tabValue === 6 ? (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    disabled={Boolean(editingItem)}
                    label="Grade Code (e.g. GRADE_A) *"
                    value={formData.gradeCode}
                    onChange={(e) => setFormData({ ...formData, gradeCode: e.target.value })}
                    helperText={editingItem ? 'Grade code cannot be changed' : ''}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Grade Name *"
                    value={formData.gradeName}
                    onChange={(e) => setFormData({ ...formData, gradeName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Fuel Rate (₹ / km) *"
                    value={formData.fuelRate}
                    onChange={(e) => setFormData({ ...formData, fuelRate: Number(e.target.value) })}
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    disabled={Boolean(editingItem)}
                    label="Master Code *"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    helperText={editingItem ? 'Master code cannot be changed' : ''}
                  />
                </Grid>
                {tabValue === 2 ? (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Designation Title *"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value, name: e.target.value })}
                    />
                  </Grid>
                ) : (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Master Name *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </Grid>
                )}

                {tabValue === 0 && (
                  <>
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
                        select
                        fullWidth
                        size="small"
                        label="Mapped Branch Manager"
                        value={formData.managerId}
                        onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      >
                        <MenuItem value="">-- Unassigned --</MenuItem>
                        {employees.map((e) => (
                          <MenuItem key={e.id} value={e.id}>{e.name} ({e.employeeNo})</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </>
                )}

                {tabValue === 3 && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <MenuItem value="Machinery">Machinery (Capital)</MenuItem>
                        <MenuItem value="Spare Parts">Spare Parts</MenuItem>
                        <MenuItem value="Tooling">Tooling</MenuItem>
                        <MenuItem value="Automation">Automation</MenuItem>
                        <MenuItem value="Electronics">Electronics</MenuItem>
                        <MenuItem value="Services">Services / AMC</MenuItem>
                        <MenuItem value="Accessories">Accessories</MenuItem>
                        <MenuItem value="General">General</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Principal / OEM Brand"
                        value={formData.principal}
                        onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                      >
                        <MenuItem value="">-- Select Principal --</MenuItem>
                        {data.principals?.map((p: any) => (
                          <MenuItem key={p.id} value={p.name}>{p.name} ({p.country || 'Global'})</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Accessible Role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <MenuItem value="ALL">All Roles (Sales & Service)</MenuItem>
                        <MenuItem value="SALES_EXEC">Sales Executives Only</MenuItem>
                        <MenuItem value="SERVICE_ENG">Service Engineers Only</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Default Unit Price (₹)"
                        value={formData.unitPrice}
                        onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                      />
                    </Grid>
                  </>
                )}

                {tabValue === 4 && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Accessible Role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <MenuItem value="ALL">All Roles (General)</MenuItem>
                      <MenuItem value="SALES_EXEC">Sales Executives Only</MenuItem>
                      <MenuItem value="SERVICE_ENG">Service Engineers Only</MenuItem>
                    </TextField>
                  </Grid>
                )}

                {tabValue === 8 && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Country / Origin"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        placeholder="e.g. Germany, Japan, USA"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Contact Person"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        placeholder="e.g. Regional Director"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Contact Email"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Contact Phone"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        label="Description / OEM Profile"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Details of machinery, product lines, and specialization"
                      />
                    </Grid>
                  </>
                )}
              </>
            )}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    color="success"
                  />
                }
                label="Active Status"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveMaster}>
            {editingItem ? 'UPDATE MASTER' : 'SAVE MASTER'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteItem)} onClose={() => setDeleteItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Delete Master Item</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Are you sure you want to delete this item?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteItem(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteMaster}>
            CONFIRM DELETE
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
