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
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { exportToCsv } from '../utils/exportCsv';

export const EmployeesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [employees, setEmployees] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('');

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const defaultFormData = {
    employeeNo: '',
    name: '',
    gender: 'Male',
    dob: '1992-01-01',
    departmentId: 1,
    designationId: 1,
    branchId: 1,
    joiningDate: new Date().toISOString().split('T')[0],
    mobileNo: '',
    email: '',
    role: 'SERVICE_ENG',
    grade: 'GRADE_B',
    status: 'Active',
    password: '',
  };

  const [formData, setFormData] = useState(defaultFormData);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, mastersRes]: [any, any] = await Promise.all([
        api.get('/employees', { params: { search, branchId: branchFilter || undefined } }),
        api.get('/masters/summary'),
      ]);
      setEmployees(empRes);
      setBranches(mastersRes.branches || []);
      setDepartments(mastersRes.departments || []);
      setDesignations(mastersRes.designations || []);
    } catch (err: any) {
      setError(err || 'Failed to load employee records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [branchFilter]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    const nextEmpNo = (1000 + employees.length + 1).toString();
    setFormData({
      ...defaultFormData,
      employeeNo: nextEmpNo,
      departmentId: departments[0]?.id || 1,
      designationId: designations[0]?.id || 1,
      branchId: branches[0]?.id || 1,
    });
    setOpenModal(true);
  };

  const handleOpenEditModal = (emp: any) => {
    setEditingId(emp.id);
    setFormData({
      employeeNo: emp.employeeNo || '',
      name: emp.name || '',
      gender: emp.gender || 'Male',
      dob: emp.dob ? new Date(emp.dob).toISOString().split('T')[0] : '1992-01-01',
      departmentId: emp.department?.id || 1,
      designationId: emp.designation?.id || 1,
      branchId: emp.branch?.id || 1,
      joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : '2026-01-01',
      mobileNo: emp.mobileNo || '',
      email: emp.email || '',
      role: emp.role || 'SERVICE_ENG',
      grade: emp.grade || 'GRADE_B',
      status: emp.status || 'Active',
      password: '',
    });
    setOpenModal(true);
  };

  const handleSaveEmployee = async () => {
    try {
      const payload: any = { ...formData };
      if (!payload.password) delete payload.password;

      if (editingId) {
        await api.put(`/employees/${editingId}`, payload);
        showToast('Employee profile updated successfully!', 'success');
      } else {
        await api.post('/employees', payload);
        showToast('New employee created successfully!', 'success');
      }
      setOpenModal(false);
      setFormData(defaultFormData);
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      showToast(err || 'Failed to save employee', 'error');
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/employees/${deleteId}`);
      showToast('Employee record deleted successfully', 'info');
      setDeleteId(null);
      fetchData();
    } catch (err: any) {
      showToast(err || 'Failed to delete employee', 'error');
    }
  };

  const handleExportCsv = () => {
    const exportData = employees.map((e) => ({
      EmpNo: e.employeeNo,
      Name: e.name,
      Gender: e.gender,
      Department: e.department?.name,
      Designation: e.designation?.title,
      Branch: e.branch?.name,
      Grade: e.grade,
      Role: e.role,
      Mobile: e.mobileNo,
      Email: e.email,
      Status: e.status,
    }));
    exportToCsv(`Employees_Export_${new Date().toISOString().split('T')[0]}.csv`, exportData);
    showToast('Employees CSV exported successfully!', 'success');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Employees Directory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage field sales executives, service engineers, branch managers, and security roles
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCsv}>
            Export CSV
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
            + Add Employee
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search name, code, email..."
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
            label="Branch"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Branches</MenuItem>
            {branches.map((b) => (
              <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
            ))}
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
                <TableCell>Emp #</TableCell>
                <TableCell>Employee Name</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Mobile No</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No employee records found.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{emp.employeeNo}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{emp.name}</TableCell>
                    <TableCell>{emp.gender}</TableCell>
                    <TableCell>{emp.department?.name || '-'}</TableCell>
                    <TableCell>{emp.designation?.title || '-'}</TableCell>
                    <TableCell>{emp.branch?.name || '-'}</TableCell>
                    <TableCell>
                      <Chip label={(emp.grade || 'GRADE_B').replace('_', ' ').replace('GRADE', 'Grade')} size="small" color="secondary" variant="filled" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={emp.role} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>{emp.mobileNo}</TableCell>
                    <TableCell>
                      <Chip
                        label={emp.status}
                        color={emp.status === 'Active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Employee">
                        <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(emp)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Employee">
                        <IconButton size="small" color="error" onClick={() => setDeleteId(emp.id)}>
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

      {/* Add / Edit Employee Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? 'Edit Employee Profile' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Employee No *"
                value={formData.employeeNo}
                onChange={(e) => setFormData({ ...formData, employeeNo: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                size="small"
                label="Full Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Gender *"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Date of Birth"
                InputLabelProps={{ shrink: true }}
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Joining Date *"
                InputLabelProps={{ shrink: true }}
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Employee Grade *"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              >
                <MenuItem value="GRADE_A">Grade A</MenuItem>
                <MenuItem value="GRADE_B">Grade B</MenuItem>
                <MenuItem value="GRADE_C">Grade C</MenuItem>
                <MenuItem value="GRADE_D">Grade D</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Department *"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: Number(e.target.value) })}
              >
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Designation *"
                value={formData.designationId}
                onChange={(e) => setFormData({ ...formData, designationId: Number(e.target.value) })}
              >
                {designations.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.title}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Branch *"
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: Number(e.target.value) })}
              >
                {branches.map((b) => (
                  <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Mobile No *"
                value={formData.mobileNo}
                onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Email Address *"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Security Role *"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="ADMIN">System Administrator (ADMIN)</MenuItem>
                <MenuItem value="MANAGER">Branch Manager (MANAGER)</MenuItem>
                <MenuItem value="SALES_EXEC">Sales Executive (SALES_EXEC)</MenuItem>
                <MenuItem value="SERVICE_ENG">Service Engineer (SERVICE_ENG)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status *"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                type="password"
                label={editingId ? 'Password (Leave blank to keep existing)' : 'Password *'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEmployee}>
            {editingId ? 'UPDATE EMPLOYEE' : 'SAVE EMPLOYEE'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Delete Employee Record</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Are you sure you want to delete this employee record?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteEmployee}>
            CONFIRM DELETE
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
