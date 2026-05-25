import { useEffect, useState } from 'react';
import api from '../api/axios';

const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Design'];
const EMPTY_FORM = {
  name: '', email: '', phone: '', department: '', designation: '',
  basicSalary: '', joinDate: '', bankAccount: '', panNumber: '', status: 'Active',
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (deptFilter) params.department = deptFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/employees', { params });
      setEmployees(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, deptFilter, statusFilter]);

  const openAdd = () => {
    setEditEmployee(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setEditEmployee(emp);
    setForm({
      name: emp.name, email: emp.email, phone: emp.phone,
      department: emp.department, designation: emp.designation,
      basicSalary: emp.basicSalary, status: emp.status,
      joinDate: emp.joinDate?.split('T')[0] || '',
      bankAccount: emp.bankAccount || '',
      panNumber: emp.panNumber || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editEmployee) {
        await api.put(`/employees/${editEmployee._id}`, form);
      } else {
        await api.post('/employees', form);
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save employee.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete employee "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Employees</h1>
          <p>Manage your workforce</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Employee</button>
      </div>

      <div className="page-body">
        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-left">
            <input
              type="text" className="search-input" placeholder="🔍  Search name, ID, email…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
            <select className="filter-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {employees.length} employee{employees.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        {loading ? <div className="spinner" /> : employees.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">👥</div>
            <h3>No employees found</h3>
            <p>Add your first employee to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Basic Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp._id}>
                    <td><code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{emp.employeeId}</code></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{emp.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{emp.email}</div>
                    </td>
                    <td><span className="badge badge-info">{emp.department}</span></td>
                    <td>{emp.designation}</td>
                    <td style={{ fontWeight: 600 }}>₹{emp.basicSalary.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${emp.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(emp)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp._id, emp.name)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editEmployee ? '✏️ Edit Employee' : '➕ Add Employee'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {formError && <div className="alert alert-error">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input name="name" className="form-control" value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input name="phone" className="form-control" value={form.phone} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <select name="department" className="form-control" value={form.department} onChange={handleChange} required>
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Designation *</label>
                  <input name="designation" className="form-control" value={form.designation} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Basic Salary (₹) *</label>
                  <input type="number" name="basicSalary" className="form-control" value={form.basicSalary} onChange={handleChange} required min="1" />
                </div>
                <div className="form-group">
                  <label>Join Date *</label>
                  <input type="date" name="joinDate" className="form-control" value={form.joinDate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" className="form-control" value={form.status} onChange={handleChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Bank Account</label>
                  <input name="bankAccount" className="form-control" value={form.bankAccount} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>PAN Number</label>
                  <input name="panNumber" className="form-control" value={form.panNumber} onChange={handleChange} />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Employees;
