import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';
import { setUser } from './store/authSlice';

// Pages and Components
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import MachineManagement from './pages/MachineManagement';
import PanneManagement from './pages/PanneManagement';
import MaintenanceManagement from './pages/MaintenanceManagement';
import MachineUsageManagement from './pages/MachineUsageManagement';
import Reports from './pages/Reports';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Authentication disabled - demo user always logged in
    // Default user already set in initial state
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/*" element={
          <div className="app-layout">
            <Sidebar />
            <div className="main-content">
              <Navbar />
              <div className="content-area">
                <Routes>
                  {/* Dashboard - SuperAdmin, Admin, Technician only (Reception cannot access) */}
                  <Route path="/" element={
                    <PrivateRoute requiredRoles={['super admin', 'admin', 'technician']}>
                      <Dashboard />
                    </PrivateRoute>
                  } />
              
              {/* User Management - SuperAdmin and Admin only */}
              <Route path="/users" element={
                <PrivateRoute requiredRoles={['super admin', 'admin']}>
                  <UserManagement />
                </PrivateRoute>
              } />
              
              {/* Machine Management - SuperAdmin, Admin, Technician */}
              <Route path="/machines" element={
                <PrivateRoute requiredRoles={['super admin', 'admin', 'technician']}>
                  <MachineManagement />
                </PrivateRoute>
              } />
              
              {/* Panne Management - SuperAdmin, Admin, Technician */}
              <Route path="/pannes" element={
                <PrivateRoute requiredRoles={['super admin', 'admin', 'technician']}>
                  <PanneManagement />
                </PrivateRoute>
              } />
              
              {/* Maintenance Management - SuperAdmin, Admin, Technician */}
              <Route path="/maintenance" element={
                <PrivateRoute requiredRoles={['super admin', 'admin', 'technician']}>
                  <MaintenanceManagement />
                </PrivateRoute>
              } />
              
              {/* Machine Usage - SuperAdmin, Admin, Reception */}
              <Route path="/machine-usage" element={
                <PrivateRoute requiredRoles={['super admin', 'admin', 'reception']}>
                  <MachineUsageManagement />
                </PrivateRoute>
              } />
              
              {/* Reports - SuperAdmin and Admin only */}
              <Route path="/reports" element={
                <PrivateRoute requiredRoles={['super admin', 'admin']}>
                  <Reports />
                </PrivateRoute>
              } />
                  
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
            </div>
          </div>
        } />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Router>
  );
}

export default App;
