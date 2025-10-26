import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      toast.success('Logged out successfully', { icon: '👋' });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      navigate('/login');
    }
  };

  return (
    <nav className='glass-premium border-b-2 border-primary-100/30 shadow-premium'>
      <div className='container mx-auto px-6 py-4'>
        <div className='flex justify-between items-center'>
          {/* Logo Section */}
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary-glow'>
              <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
              </svg>
            </div>
            <div>
              <h1 className='text-xl font-extrabold text-gradient-primary tracking-tight'>Restaurant Manager</h1>
              <p className='text-xs text-text-tertiary font-medium'>Premium Management System</p>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className='flex gap-2 items-center'>
            <Link 
              to='/' 
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                isActive('/') 
                  ? 'bg-gradient-primary text-white shadow-primary-glow' 
                  : 'text-text-primary hover:bg-primary-50 hover:text-primary-600'
              }`}
            >
              <div className='flex items-center gap-2'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
                </svg>
                Dashboard
              </div>
            </Link>
            
            <Link 
              to='/customer' 
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                isActive('/customer') 
                  ? 'bg-gradient-primary text-white shadow-primary-glow' 
                  : 'text-text-primary hover:bg-primary-50 hover:text-primary-600'
              }`}
            >
              <div className='flex items-center gap-2'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                </svg>
                Customer View
              </div>
            </Link>

            {/* User Info & Logout */}
            {user && (
              <>
                <div className='hidden md:flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50'>
                  <div className='w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold'>
                    {user.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className='text-xs font-semibold text-white'>{user.full_name}</p>
                    <p className='text-xs text-slate-400 capitalize'>{user.role}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className='flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-all duration-200'
                  title='Logout'
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                  </svg>
                  <span className='hidden sm:inline'>Logout</span>
                </button>

                {/* Logout Confirmation Modal */}
                {showLogoutConfirm && (
                  <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50' onClick={() => setShowLogoutConfirm(false)}>
                    <div className='glass-card border border-slate-700/50 p-6 rounded-xl max-w-sm mx-4' onClick={(e) => e.stopPropagation()}>
                      <div className='flex items-center gap-3 mb-4'>
                        <div className='w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center'>
                          <svg className='w-6 h-6 text-red-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                          </svg>
                        </div>
                        <div>
                          <h3 className='text-lg font-bold text-white'>Confirm Logout</h3>
                          <p className='text-sm text-slate-400'>Are you sure you want to logout?</p>
                        </div>
                      </div>
                      <div className='flex gap-3'>
                        <button
                          onClick={() => setShowLogoutConfirm(false)}
                          className='flex-1 px-4 py-2 rounded-lg font-semibold text-sm bg-slate-700 text-white hover:bg-slate-600 transition-colors'
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            setShowLogoutConfirm(false);
                            handleLogout();
                          }}
                          className='flex-1 px-4 py-2 rounded-lg font-semibold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors'
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

