import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardAnalytics from './components/manager/DashboardAnalytics';
import MenuManager from './components/manager/MenuManager';
import TableManager from './components/manager/TableManager';
import OrderManager from './components/manager/OrderManager';
import BillingManager from './components/manager/BillingManager';
import QRCodeGenerator from './components/manager/QRCodeGenerator';
import Reports from './components/manager/Reports';
import InventoryManager from './components/manager/InventoryManager';
import MenuView from './components/customer/MenuView';
import LoginPage from './components/auth/LoginPage';
import EnhancedChefDashboard from './components/chef/EnhancedChefDashboard';
import Sidebar from './components/shared/Sidebar';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  console.log('ProtectedRoute - token:', !!token, 'user:', user, 'allowedRoles:', allowedRoles);

  if (!token) {
    console.log('No token, redirecting to /login');
    return <Navigate to='/login' replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log('User role not allowed, redirecting to /login');
    return <Navigate to='/login' replace />;
  }

  return children;
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (token && storedUser) {
      // Check if token is expired
      if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
        // Token expired - clear and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');
        toast.error('Session expired. Please login again.', { icon: '⏰' });
      } else {
        setUser(JSON.parse(storedUser));
        
        // Set up auto-logout when token expires
        if (tokenExpiry) {
          const timeUntilExpiry = parseInt(tokenExpiry) - Date.now();
          if (timeUntilExpiry > 0) {
            setTimeout(() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('tokenExpiry');
              toast.error('Session expired. Please login again.', { icon: '⏰' });
              window.location.href = '/login';
            }, timeUntilExpiry);
          }
        }
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path='/login' element={<LoginPage onLogin={handleLogin} />} />
        <Route path='/customer' element={<MenuView />} />

        {/* Chef Routes */}
        <Route 
          path='/chef' 
          element={
            <ProtectedRoute allowedRoles={['chef']}>
              <EnhancedChefDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Manager/Admin Routes */}
        <Route 
          path='/' 
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <div className='min-h-screen bg-slate-950 flex'>
                <Sidebar />
                <main className='flex-1 lg:ml-72 transition-all duration-300'>
                  <div className='p-4 sm:p-6 lg:p-8 pt-20 lg:pt-6 max-w-[1920px] mx-auto'>
                    <DashboardAnalytics />
                  </div>
                </main>
              </div>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path='/*' 
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <div className='min-h-screen bg-slate-950 flex'>
                <Sidebar />
                <main className='flex-1 lg:ml-72 transition-all duration-300'>
                  <div className='p-4 sm:p-6 lg:p-8 pt-20 lg:pt-6 max-w-[1920px] mx-auto'>
                    <Routes>
                      <Route path='/menu' element={<MenuManager />} />
                      <Route path='/tables' element={<TableManager />} />
                      <Route path='/orders' element={<OrderManager />} />
                      <Route path='/billing' element={<BillingManager />} />
                      <Route path='/inventory' element={<InventoryManager />} />
                      <Route path='/qr-menu' element={<QRCodeGenerator />} />
                      <Route path='/reports' element={<Reports />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
