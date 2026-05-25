import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';
import GeneratePayroll from './pages/GeneratePayroll';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Layout><Dashboard /></Layout>
          </PrivateRoute>
        } />
        <Route path="/employees" element={
          <PrivateRoute>
            <Layout><Employees /></Layout>
          </PrivateRoute>
        } />
        <Route path="/payroll" element={
          <PrivateRoute>
            <Layout><Payroll /></Layout>
          </PrivateRoute>
        } />
        <Route path="/generate-payroll" element={
          <PrivateRoute>
            <Layout><GeneratePayroll /></Layout>
          </PrivateRoute>
        } />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
