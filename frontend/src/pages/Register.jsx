import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'hr' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <h1>Payroll<span>Pro</span></h1>
          <p>HR & Payroll Management System</p>
        </div>

        <h2>Create Account</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Full Name</label>
            <input type="text" name="name" className="form-control" placeholder="John Doe"
              value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Email</label>
            <input type="email" name="email" className="form-control" placeholder="admin@company.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Password</label>
            <input type="password" name="password" className="form-control" placeholder="Min. 6 characters"
              value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label>Role</label>
            <select name="role" className="form-control" value={form.role} onChange={handleChange}>
              <option value="admin">Admin</option>
              <option value="hr">HR</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Creating account...' : '→ Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
