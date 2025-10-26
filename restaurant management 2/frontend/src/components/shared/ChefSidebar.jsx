import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';

const ChefSidebar = ({ activeView, setActiveView }) => {
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
      id: 'orders', 
      label: 'Active Orders', 
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
        </svg>
      ),
      color: 'from-orange-500 to-amber-500'
    },
    { 
      id: 'inventory', 
      label: 'Inventory', 
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' />
        </svg>
      ),
      color: 'from-green-500 to-emerald-500'
    },
    { 
      id: 'alerts', 
      label: 'Stock Alerts', 
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
        </svg>
      ),
      color: 'from-red-500 to-pink-500'
    },
    { 
      id: 'menu86', 
      label: 'Menu (86)', 
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' />
        </svg>
      ),
      color: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'messages', 
      label: 'Messages', 
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-500'
    }
  ];

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
                <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/50'>
                  <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' />
                  </svg>
                </div>
                <div>
                  <h1 className='text-lg font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent'>
                    Kitchen Display
                  </h1>
                  <p className='text-xs text-slate-400'>Chef Dashboard</p>
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
              <div className='w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm shadow-lg'>
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
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setIsMobileOpen(false);
              }}
              className={`
                w-full group flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm
                transition-all duration-200
                ${activeView === item.id
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : ''}
            >
              <span className={`${activeView === item.id ? 'scale-110' : ''} transition-transform`}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <>
                  <span className='flex-1 text-left'>{item.label}</span>
                  {activeView === item.id && (
                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z' clipRule='evenodd' />
                    </svg>
                  )}
                </>
              )}
            </button>
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

export default ChefSidebar;
