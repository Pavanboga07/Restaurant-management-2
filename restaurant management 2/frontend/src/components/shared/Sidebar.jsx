import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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

  const navItems = [
    { 
      path: '/', 
      label: 'Analytics', 
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      path: '/menu', 
      label: 'Menu', 
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
        </svg>
      ),
      color: 'from-pink-500/80 to-purple-500/80'
    },
    { 
      path: '/tables', 
      label: 'Tables', 
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' />
        </svg>
      ),
      color: 'from-green-500 to-emerald-500'
    },
    { 
      path: '/orders', 
      label: 'Orders', 
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
        </svg>
      ),
      color: 'from-orange-500 to-amber-500'
    },
    { 
      path: '/billing', 
      label: 'Billing', 
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' />
        </svg>
      ),
      color: 'from-teal-500 to-cyan-500'
    },
    { 
      path: '/inventory', 
      label: 'Inventory', 
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' />
        </svg>
      ),
      color: 'from-indigo-500 to-purple-500'
    },
    { 
      path: '/qr-menu', 
      label: 'QR Menu', 
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z' />
        </svg>
      ),
      color: 'from-rose-500 to-pink-500'
    },
    { 
      path: '/reports', 
      label: 'Reports', 
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
        </svg>
      ),
      color: 'from-violet-500 to-purple-500'
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className='fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden'
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
          border-r border-slate-700/50 shadow-2xl z-50
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className='p-6 border-b border-slate-700/50'>
          <div className='flex items-center justify-between'>
            {!isCollapsed && (
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50'>
                  <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
                  </svg>
                </div>
                <div>
                  <h1 className='text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
                    Restaurant
                  </h1>
                  <p className='text-xs text-slate-400'>Management Pro</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className='hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all'
            >
              <svg className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 19l-7-7 7-7m8 14l-7-7 7-7' />
              </svg>
            </button>
          </div>
        </div>

        {/* User Profile */}
        {user && (
          <div className={`p-4 border-b border-slate-700/50 ${isCollapsed ? 'px-2' : ''}`}>
            <div className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/30 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg'>
                {user.full_name?.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-semibold text-white truncate'>{user.full_name}</p>
                  <p className='text-xs text-slate-400 capitalize'>{user.role}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className='flex-1 overflow-y-auto py-4 px-3 space-y-1'>
          {navItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm
                transition-all duration-200
                ${isActive(item.path) 
                  ? `bg-gradient-to-r ${item.color} text-white shadow-md`
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : ''}
            >
              <span className={`${isActive(item.path) ? 'scale-110' : ''} transition-transform`}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <>
                  <span className='flex-1'>{item.label}</span>
                  {isActive(item.path) && (
                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z' clipRule='evenodd' />
                    </svg>
                  )}
                </>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className='p-4 border-t border-slate-700/50 space-y-2'>
          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm
              bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30
              transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Logout' : ''}
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
            </svg>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]' onClick={() => setShowLogoutConfirm(false)}>
            <div className='bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 p-6 rounded-2xl max-w-sm mx-4 shadow-2xl' onClick={(e) => e.stopPropagation()}>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/30'>
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
                  className='flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm bg-slate-700 text-white hover:bg-slate-600 transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    handleLogout();
                  }}
                  className='flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30'
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className='fixed top-4 left-4 z-30 lg:hidden flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 text-white shadow-xl'
      >
        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
        </svg>
      </button>
    </>
  );
};

export default Sidebar;
