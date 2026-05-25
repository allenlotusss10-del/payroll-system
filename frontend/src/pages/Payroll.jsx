import { useEffect, useState } from 'react';
import api from '../api/axios';

const MONTHS = [
  { v: 1, l: 'January' }, { v: 2, l: 'February' }, { v: 3, l: 'March' },
  { v: 4, l: 'April' }, { v: 5, l: 'May' }, { v: 6, l: 'June' },
  { v: 7, l: 'July' }, { v: 8, l: 'August' }, { v: 9, l: 'September' },
  { v: 10, l: 'October' }, { v: 11, l: 'November' }, { v: 12, l: 'December' },
];

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

const SalarySlip = ({ payroll, onClose }) => {
  const emp = payroll.employee;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📄 Salary Slip</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="slip-container">
          <div className="slip-header">
            <h2>PayrollPro</h2>
            <p>Salary Slip for {MONTHS.find(m => m.v === payroll.month)?.l} {payroll.year}</p>
          </div>

          <div className="slip-section">
            <h4>Employee Details</h4>
            <div className="slip-row"><span>Name</span><span style={{ fontWeight: 600 }}>{emp?.name}</span></div>
            <div className="slip-row"><span>Employee ID</span><span>{emp?.employeeId}</span></div>
            <div className="slip-row"><span>Department</span><span>{emp?.department}</span></div>
            <div className="slip-row"><span>Designation</span><span>{emp?.designation}</span></div>
          </div>

          <div className="slip-section">
            <h4>Earnings</h4>
            <div className="slip-row"><span>Basic Salary</span><span>₹{payroll.basicSalary?.toLocaleString()}</span></div>
            <div className="slip-row"><span>HRA (40%)</span><span>₹{payroll.hra?.toLocaleString()}</span></div>
            <div className="slip-row"><span>DA (10%)</span><span>₹{payroll.da?.toLocaleString()}</span></div>
            <div className="slip-row"><span>Medical Allowance</span><span>₹{payroll.medicalAllowance?.toLocaleString()}</span></div>
            <div className="slip-row"><span>Other Allowances</span><span>₹{payroll.otherAllowances?.toLocaleString()}</span></div>
            <div className="slip-row total"><span>Gross Salary</span><span>₹{payroll.grossSalary?.toLocaleString()}</span></div>
          </div>

          <div className="slip-section">
            <h4>Deductions</h4>
            <div className="slip-row"><span>Provident Fund (12%)</span><span>- ₹{payroll.pf?.toLocaleString()}</span></div>
            <div className="slip-row"><span>Income Tax</span><span>- ₹{payroll.tax?.toLocaleString()}</span></div>
            <div className="slip-row"><span>Other Deductions</span><span>- ₹{payroll.otherDeductions?.toLocaleString()}</span></div>
            <div className="slip-row total"><span>Total Deductions</span><span>- ₹{payroll.totalDeductions?.toLocaleString()}</span></div>
          </div>

          <div className="slip-net">
            <span>NET SALARY</span>
            <span>₹{payroll.netSalary?.toLocaleString()}</span>
          </div>
        </div>

        <div className="modal-footer">
          <span className={`badge ${payroll.status === 'Paid' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 13 }}>
            {payroll.status === 'Paid' ? `✅ Paid on ${new Date(payroll.paidAt).toLocaleDateString()}` : '⏳ Payment Pending'}
          </span>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(currentYear);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSlip, setSelectedSlip] = useState(null);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const params = {};
      if (monthFilter) params.month = monthFilter;
      if (yearFilter) params.year = yearFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/payroll', { params });
      setPayrolls(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayrolls(); }, [monthFilter, yearFilter, statusFilter]);

  const handleMarkPaid = async (id) => {
    if (!window.confirm('Mark this payroll as paid?')) return;
    try {
      await api.patch(`/payroll/${id}/pay`);
      fetchPayrolls();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payroll record?')) return;
    try {
      await api.delete(`/payroll/${id}`);
      fetchPayrolls();
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete a paid payroll.');
    }
  };

  const totalNet = payrolls.reduce((s, p) => s + p.netSalary, 0);
  const paidCount = payrolls.filter(p => p.status === 'Paid').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Payroll Records</h1>
          <p>View, manage, and mark payroll payments</p>
        </div>
      </div>

      <div className="page-body">
        {/* Summary bar */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Records', value: payrolls.length, color: 'var(--primary)' },
            { label: 'Total Net Payroll', value: `₹${totalNet.toLocaleString()}`, color: '#10b981' },
            { label: 'Paid', value: paidCount, color: '#10b981' },
            { label: 'Pending', value: payrolls.length - paidCount, color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'white', borderRadius: 10, padding: '14px 20px',
              border: '1px solid var(--border)', flex: '1 1 140px',
            }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{s.label}</p>
              <p style={{ fontWeight: 700, fontSize: 20, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-left">
            <select className="filter-select" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
              <option value="">All Months</option>
              {MONTHS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
            <select className="filter-select" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>

        {loading ? <div className="spinner" /> : payrolls.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">🧾</div>
            <h3>No payroll records found</h3>
            <p>Generate payroll from the Generate Payroll page</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Period</th>
                  <th>Gross</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.employee?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.employee?.employeeId}</div>
                    </td>
                    <td><span className="badge badge-info">{p.employee?.department}</span></td>
                    <td>{MONTHS.find(m => m.v === p.month)?.l} {p.year}</td>
                    <td>₹{p.grossSalary?.toLocaleString()}</td>
                    <td style={{ color: 'var(--danger)' }}>- ₹{p.totalDeductions?.toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{p.netSalary?.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${p.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => setSelectedSlip(p)}>📄 Slip</button>
                        {p.status === 'Pending' && (
                          <button className="btn btn-success btn-sm" onClick={() => handleMarkPaid(p._id)}>✅ Pay</button>
                        )}
                        {p.status === 'Pending' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>🗑</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedSlip && <SalarySlip payroll={selectedSlip} onClose={() => setSelectedSlip(null)} />}
    </>
  );
};

export default Payroll;
