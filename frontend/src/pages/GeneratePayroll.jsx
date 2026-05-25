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

const GeneratePayroll = () => {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: currentYear,
    otherAllowances: 0,
    otherDeductions: 0,
    remarks: '',
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    api.get('/employees?status=Active').then(res => setEmployees(res.data));
  }, []);

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);

    // Live preview calculation when employee is selected
    if (updated.employeeId) {
      const emp = employees.find(e => e._id === updated.employeeId);
      if (emp) {
        setSelectedEmployee(emp);
        const basic = emp.basicSalary;
        const hra = Math.round(basic * 0.40);
        const da = Math.round(basic * 0.10);
        const medical = 1500;
        const other = Math.round(basic * 0.05) + Number(updated.otherAllowances || 0);
        const gross = basic + hra + da + medical + other;
        const pf = Math.round(basic * 0.12);
        const tax = gross > 50000 ? Math.round(gross * 0.10) : 0;
        const deductions = pf + tax + Number(updated.otherDeductions || 0);
        setPreview({ basic, hra, da, medical, other, gross, pf, tax, deductions, net: gross - deductions });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.post('/payroll/generate', form);
      setSuccess(`✅ Payroll generated for ${res.data.employee?.name}! Net salary: ₹${res.data.netSalary?.toLocaleString()}`);
      setForm({ employeeId: '', month: new Date().getMonth() + 1, year: currentYear, otherAllowances: 0, otherDeductions: 0, remarks: '' });
      setPreview(null);
      setSelectedEmployee(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate payroll.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Generate Payroll</h1>
          <p>Create payroll record for an employee with auto-calculated components</p>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          {/* Form */}
          <div className="card">
            <div className="card-body">
              <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>🧾 Payroll Details</h3>

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label>Select Employee *</label>
                    <select name="employeeId" className="form-control" value={form.employeeId} onChange={handleChange} required>
                      <option value="">-- Choose an active employee --</option>
                      {employees.map(e => (
                        <option key={e._id} value={e._id}>
                          {e.name} ({e.employeeId}) — {e.department}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label>Month *</label>
                      <select name="month" className="form-control" value={form.month} onChange={handleChange} required>
                        {MONTHS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Year *</label>
                      <select name="year" className="form-control" value={form.year} onChange={handleChange} required>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label>Extra Allowances (₹)</label>
                      <input type="number" name="otherAllowances" className="form-control"
                        value={form.otherAllowances} onChange={handleChange} min="0" />
                    </div>
                    <div className="form-group">
                      <label>Extra Deductions (₹)</label>
                      <input type="number" name="otherDeductions" className="form-control"
                        value={form.otherDeductions} onChange={handleChange} min="0" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Remarks</label>
                    <input name="remarks" className="form-control" placeholder="Optional notes…"
                      value={form.remarks} onChange={handleChange} />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={loading}>
                    {loading ? 'Generating…' : '🚀 Generate Payroll'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Live Preview */}
          <div className="card">
            <div className="card-body">
              <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>👁️ Live Preview</h3>

              {!preview ? (
                <div className="empty-state" style={{ padding: '40px 0' }}>
                  <div className="emoji">👆</div>
                  <p>Select an employee to see the salary breakdown</p>
                </div>
              ) : (
                <>
                  {selectedEmployee && (
                    <div style={{ background: '#eff6ff', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                      <p style={{ fontWeight: 700 }}>{selectedEmployee.name}</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {selectedEmployee.designation} · {selectedEmployee.department}
                      </p>
                    </div>
                  )}

                  <div style={{ fontSize: 14 }}>
                    <p style={{ fontWeight: 700, color: 'var(--success)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Earnings</p>
                    {[
                      ['Basic Salary', preview.basic],
                      ['HRA (40%)', preview.hra],
                      ['DA (10%)', preview.da],
                      ['Medical Allowance', preview.medical],
                      ['Other Allowances', preview.other],
                    ].map(([label, val]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #f1f5f9' }}>
                        <span>{label}</span>
                        <span style={{ fontWeight: 600 }}>₹{val?.toLocaleString()}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 700, borderTop: '2px solid var(--border)' }}>
                      <span>Gross Salary</span><span>₹{preview.gross?.toLocaleString()}</span>
                    </div>

                    <p style={{ fontWeight: 700, color: 'var(--danger)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 8 }}>Deductions</p>
                    {[
                      ['PF (12%)', preview.pf],
                      ['Income Tax', preview.tax],
                      ['Other Deductions', Number(form.otherDeductions) || 0],
                    ].map(([label, val]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #f1f5f9' }}>
                        <span>{label}</span>
                        <span style={{ fontWeight: 600, color: 'var(--danger)' }}>- ₹{val?.toLocaleString()}</span>
                      </div>
                    ))}

                    <div style={{ background: 'var(--primary)', color: 'white', borderRadius: 8, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                      <span style={{ fontWeight: 700 }}>NET SALARY</span>
                      <span style={{ fontWeight: 800, fontSize: 18 }}>₹{preview.net?.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GeneratePayroll;
