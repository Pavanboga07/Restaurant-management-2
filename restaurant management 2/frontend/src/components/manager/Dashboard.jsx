import React, { useState } from 'react';
import DashboardAnalytics from './DashboardAnalytics';
import MenuManager from './MenuManager';
import TableManager from './TableManager';
import OrderManager from './OrderManager';
import BillingManager from './BillingManager';
import QRCodeGenerator from './QRCodeGenerator';
import Reports from './Reports';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  const tabs = [
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
        </svg>
      )
    },
    { 
      id: 'menu', 
      label: 'Menu', 
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
        </svg>
      )
    },
    { 
      id: 'tables', 
      label: 'Tables', 
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' />
        </svg>
      )
    },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
        </svg>
      )
    },
    { 
      id: 'billing', 
      label: 'Billing', 
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' />
        </svg>
      )
    },
    { 
      id: 'qrcode', 
      label: 'QR Menu', 
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z' />
        </svg>
      )
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' />
        </svg>
      )
    },
  ];

  return (
    <div className='min-h-screen bg-background-primary animate-fadeIn'>
      <div className='container mx-auto px-6 py-8'>
        {/* Tab Navigation */}
        <div className='mb-8 animate-slideInFromTop'>
          <div className='glass-premium rounded-2xl p-2 shadow-premium border border-border-light/30'>
            <div className='flex gap-2 overflow-x-auto scrollbar-hide'>
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={`
                    flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm
                    transition-all duration-300 whitespace-nowrap
                    animate-scaleIn
                    ${activeTab === tab.id
                      ? 'gradient-primary text-white shadow-primary-glow scale-105 btn-lift'
                      : 'text-text-secondary hover:bg-primary-50 hover:text-primary-600 hover-scale'
                    }
                  `}
                >
                  <span className='inline-flex'>{tab.icon}</span>
                  <span className='hidden sm:inline'>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className='animate-slideInFromBottom'>
          {activeTab === 'analytics' && <DashboardAnalytics />}
          {activeTab === 'menu' && <MenuManager />}
          {activeTab === 'tables' && <TableManager />}
          {activeTab === 'orders' && <OrderManager />}
          {activeTab === 'billing' && <BillingManager />}
          {activeTab === 'qrcode' && <QRCodeGenerator />}
          {activeTab === 'reports' && <Reports />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
