import { useEffect, useState } from 'react';
import api from '../api/axios';

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">👥</div>
            <div className="stat-info">
              <h3>{stats.totalEmployees}</h3>
              <p>Total Employees</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-info">
              <h3>{stats.activeEmployees}</h3>
              <p>Active</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">❌</div>
            <div className="stat-info">
              <h3>{stats.inactiveEmployees}</h3>
              <p>Inactive</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">💰</div>
            <div className="stat-info">
              <h3>₹{stats.totalPayrollAmount.toLocaleString()}</h3>
              <p>Payroll This Month</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✔</div>
            <div className="stat-info">
              <h3>{stats.paidCount}</h3>
              <p>Paid This Month</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">⏳</div>
            <div className="stat-info">
              <h3>{stats.pendingCount}</h3>
              <p>Pending This Month</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Department Breakdown */}
          <div className="card">
            <div className="card-body">
              <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 700 }}>
                👔 Department Breakdown
              </h3>
              {stats.deptBreakdown.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No data yet.</p>
              ) : (
                stats.deptBreakdown.map(d => {
                  const pct = Math.round((d.count / stats.totalEmployees) * 100) || 0;
                  return (
                    <div key={d._id} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{d._id}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{d.count} employees</span>
                      </div>
                      <div style={{ background: '#e2e8f0', borderRadius: 99, height: 8 }}>
                        <div style={{ background: 'var(--primary)', borderRadius: 99, height: 8, width: `${pct}%`, transition: 'width 0.4s' }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Payrolls */}
          <div className="card">
            <div className="card-body">
              <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 700 }}>
                🕐 Recent Payrolls
              </h3>
              {stats.recentPayrolls.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No payrolls generated yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stats.recentPayrolls.map(p => (
                    <div key={p._id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', background: '#f8fafc', borderRadius: 8
                    }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{p.employee?.name}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          {p.employee?.department} · {MONTH_NAMES[p.month]} {p.year}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, fontSize: 14 }}>₹{p.netSalary.toLocaleString()}</p>
                        <span className={`badge ${p.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
