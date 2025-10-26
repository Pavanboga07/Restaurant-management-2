import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import { MetricCard, GlassCard, PremiumBadge, LoadingSpinner } from '../shared/PremiumUI';

// Mini Sparkline Component
const Sparkline = ({ data, color = '#10b981', trend = 'up' }) => {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className="flex items-center gap-2">
      <svg viewBox="0 0 100 30" className="w-24 h-8" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-pulse"
        />
      </svg>
      <span className={`text-xs font-semibold ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
      </span>
    </div>
  );
};

// Circular Progress Ring Component
const CircularProgress = ({ percentage, size = 80, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#14b8a6"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-gray-800">{percentage}%</span>
      </div>
    </div>
  );
};

const DashboardAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  // Generate mock sparkline data (replace with real data from API)
  const generateSparklineData = (base, variance = 20) => {
    return Array.from({ length: 12 }, () => 
      Math.max(0, base + Math.random() * variance - variance / 2)
    );
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-96'>
        <div className='text-center'>
          <LoadingSpinner size="lg" variant="primary" />
          <p className='text-xl font-semibold text-text-primary mt-6'>Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Empty state - no data
  if (!stats || (stats.today_revenue === 0 && stats.today_orders === 0)) {
    return (
      <GlassCard variant="elevated" className='flex flex-col items-center justify-center h-96 text-center animate-fadeIn'>
        <div className='w-32 h-32 mb-6 rounded-full bg-gradient-primary/10 flex items-center justify-center'>
          <svg className='w-16 h-16 text-primary-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
          </svg>
        </div>
        <h2 className='text-3xl font-bold text-text-primary mb-3'>Your dashboard is ready!</h2>
        <p className='text-lg text-text-secondary mb-8 max-w-md'>Start taking your first order now to see real-time analytics and insights.</p>
        <button className='px-8 py-4 gradient-primary text-white rounded-lg font-semibold shadow-primary-glow hover:scale-105 active:scale-95 transition-all'>
          Go to Orders Tab →
        </button>
      </GlassCard>
    );
  }

  const revenueToday = stats.today_revenue || 0;
  const revenueWeek = stats.week_revenue || 0;
  const ordersToday = stats.today_orders || 0;
  const activeTables = stats.active_tables || 0;
  const totalTables = stats.total_tables || 1;
  const occupancyRate = Math.round((activeTables / totalTables) * 100);
  const avgTicketSize = ordersToday > 0 ? (revenueToday / ordersToday).toFixed(2) : '0.00';

  const statCards = [
    {
      title: 'Revenue Today',
      value: `₹${revenueToday.toFixed(2)}`,
      icon: '💰',
      color: 'bg-white',
      textColor: 'text-gray-800',
      sparklineData: generateSparklineData(revenueToday / 12, 50),
      sparklineColor: '#10b981',
      trend: '+12%',
      trendDirection: 'up',
      trendLabel: 'vs last week'
    },
    {
      title: 'Revenue This Week',
      value: `₹${revenueWeek.toFixed(2)}`,
      subtitle: `Avg Ticket: ₹${avgTicketSize}`,
      icon: '📈',
      color: 'bg-white',
      textColor: 'text-gray-800',
      sparklineData: generateSparklineData(revenueWeek / 12, 200),
      sparklineColor: '#3b82f6',
      trend: '+8%',
      trendDirection: 'up',
      trendLabel: 'vs last week'
    },
    {
      title: 'Orders Today',
      value: ordersToday.toString(),
      subtitle: `${stats.completed_orders || 0} completed`,
      icon: '📋',
      color: 'bg-white',
      textColor: 'text-gray-800',
      sparklineData: generateSparklineData(ordersToday / 12, 3),
      sparklineColor: '#8b5cf6',
      trend: '+15%',
      trendDirection: 'up',
      trendLabel: 'vs yesterday'
    },
    {
      title: 'Occupancy Rate',
      value: `${activeTables} / ${totalTables}`,
      subtitle: 'Tables occupied',
      icon: '🪑',
      color: 'bg-white',
      textColor: 'text-gray-800',
      showProgress: true,
      progressValue: occupancyRate,
      trend: `${occupancyRate}%`,
      trendDirection: occupancyRate > 70 ? 'up' : occupancyRate > 40 ? 'neutral' : 'down'
    },
  ];

  return (
    <div className='w-full'>
      {/* Header */}
      <div 
        className='flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-700/30 pb-6 mb-8'
      >
        <div>
          <h1 className='text-4xl font-extrabold text-white mb-2 tracking-tight'>
            Dashboard Analytics
          </h1>
          <p className='text-slate-400 font-medium text-lg'>
            Real-time business performance overview
          </p>
        </div>
        <div className='flex items-center gap-3 mt-4 lg:mt-0'>
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className='bg-slate-800/50 backdrop-blur-sm border border-slate-700 font-semibold text-slate-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 px-4 py-2.5 rounded-lg text-sm transition-all'
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
          <button
            onClick={fetchStats}
            className='gradient-primary text-white font-semibold shadow-primary-glow hover:scale-105 active:scale-95 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-all'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6 mb-8'>
        <MetricCard
          title="Revenue Today"
          value={`₹${revenueToday.toFixed(2)}`}
          icon={
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' />
            </svg>
          }
          trend="+12%"
          trendDirection="up"
          variant="secondary"
        />
        
        <MetricCard
          title="Revenue Week"
          value={`₹${revenueWeek.toFixed(2)}`}
          icon={
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' />
            </svg>
          }
          trend="+8%"
          trendDirection="up"
          variant="secondary"
        />
        
        <MetricCard
          title="Orders Today"
          value={ordersToday.toString()}
          icon={
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
            </svg>
          }
          trend="+15%"
          trendDirection="up"
          variant="primary"
        />
        
        <MetricCard
          title="Table Occupancy"
          value={`${activeTables}/${totalTables}`}
          icon={
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' />
            </svg>
          }
          trend={`${occupancyRate}%`}
          trendDirection={occupancyRate > 70 ? 'up' : occupancyRate > 40 ? 'neutral' : 'down'}
          variant="success"
        />
      </div>

      {/* Quick Stats Row */}
      <div className='grid grid-cols-1 sm:grid-cols-3' style={{ gap: 'var(--space-md)' }}>
        <GlassCard variant="interactive">
          <div className='flex items-center' style={{ gap: 'var(--space-sm)', padding: 'var(--space-xs)' }}>
            <div 
              className='bg-warning-900/40 border border-warning-700/50 flex items-center justify-center'
              style={{ 
                width: '55px', 
                height: '55px', 
                borderRadius: 'var(--radius-md)' 
              }}
            >
              <svg style={{ width: '34px', height: '34px' }} className='text-warning-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <div>
              <p 
                className='text-slate-400 font-semibold uppercase tracking-wide'
                style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--space-xs)' }}
              >
                Pending
              </p>
              <p 
                className='font-bold text-white'
                style={{ fontSize: 'var(--text-xl)', lineHeight: 'var(--leading-tight)' }}
              >
                {stats.pending_orders || 0}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="interactive">
          <div className='flex items-center' style={{ gap: 'var(--space-sm)', padding: 'var(--space-xs)' }}>
            <div 
              className='bg-danger-900/40 border border-danger-700/50 flex items-center justify-center'
              style={{ 
                width: '55px', 
                height: '55px', 
                borderRadius: 'var(--radius-md)' 
              }}
            >
              <svg style={{ width: '34px', height: '34px' }} className='text-danger-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <div>
              <p 
                className='text-slate-400 font-semibold uppercase tracking-wide'
                style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--space-xs)' }}
              >
                Unpaid Bills
              </p>
              <p 
                className='font-bold text-white'
                style={{ fontSize: 'var(--text-xl)', lineHeight: 'var(--leading-tight)' }}
              >
                {stats.unpaid_bills || 0}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="interactive">
          <div className='flex items-center' style={{ gap: 'var(--space-sm)', padding: 'var(--space-xs)' }}>
            <div 
              className='bg-success-900/40 border border-success-700/50 flex items-center justify-center'
              style={{ 
                width: '55px', 
                height: '55px', 
                borderRadius: 'var(--radius-md)' 
              }}
            >
              <svg style={{ width: '34px', height: '34px' }} className='text-success-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <div>
              <p 
                className='text-slate-400 font-semibold uppercase tracking-wide'
                style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--space-xs)' }}
              >
                Completed
              </p>
              <p 
                className='font-bold text-white'
                style={{ fontSize: 'var(--text-xl)', lineHeight: 'var(--leading-tight)' }}
              >
                {stats.completed_orders || 0}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Insights & Popular Items Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2' style={{ gap: 'var(--space-lg)' }}>
        {/* Key Insights */}
        <GlassCard variant="elevated" className='bg-gradient-to-br from-primary-900/30 to-primary-800/20'>
          <h3 
            className='font-bold text-white flex items-center'
            style={{ 
              fontSize: 'var(--text-lg)', 
              lineHeight: 'var(--leading-tight)',
              marginBottom: 'var(--space-md)',
              gap: 'var(--space-xs)'
            }}
          >
            <svg style={{ width: '21px', height: '21px' }} className='text-primary-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' />
            </svg>
            Key Insights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <div 
              className='bg-slate-800/80 backdrop-blur-sm shadow-sm border border-slate-700/50'
              style={{ 
                borderRadius: 'var(--radius-md)', 
                padding: 'var(--space-sm)' 
              }}
            >
              <p 
                className='text-slate-400 font-semibold uppercase tracking-wide'
                style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--space-xs)' }}
              >
                Peak Hour
              </p>
              <p 
                className='font-bold text-white'
                style={{ fontSize: 'var(--text-sm)' }}
              >
                12:00 PM - 2:00 PM
              </p>
            </div>
            <div 
              className='bg-slate-800/80 backdrop-blur-sm shadow-sm border border-slate-700/50'
              style={{ 
                borderRadius: 'var(--radius-md)', 
                padding: 'var(--space-sm)' 
              }}
            >
              <p 
                className='text-slate-400 font-semibold uppercase tracking-wide'
                style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--space-xs)' }}
              >
                Busiest Day
              </p>
              <p 
                className='font-bold text-white'
                style={{ fontSize: 'var(--text-sm)' }}
              >
                Saturday
              </p>
            </div>
            <div 
              className='bg-slate-800/80 backdrop-blur-sm shadow-sm border border-slate-700/50'
              style={{ 
                borderRadius: 'var(--radius-md)', 
                padding: 'var(--space-sm)' 
              }}
            >
              <p 
                className='text-slate-400 font-semibold uppercase tracking-wide'
                style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--space-xs)' }}
              >
                Top Category
              </p>
              <p 
                className='font-bold text-white'
                style={{ fontSize: 'var(--text-sm)' }}
              >
                Main Course
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Top Popular Items */}
        <GlassCard variant="elevated">
          <h3 className='text-lg font-bold text-white mb-4 flex items-center gap-2'>
            <svg className='w-5 h-5 text-secondary-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z' />
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z' />
            </svg>
            Top 5 Popular Items
          </h3>
          <div className='space-y-4'>
            {stats.popular_items?.slice(0, 5).map((item, index) => {
              const totalOrders = stats.popular_items.reduce((sum, i) => sum + i.order_count, 0);
              const percentage = Math.round((item.order_count / totalOrders) * 100);
              
              return (
                <div key={index} className='group'>
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center gap-2'>
                      <span className='w-7 h-7 rounded-full gradient-primary text-white text-xs font-bold flex items-center justify-center shadow-primary-glow'>
                        {index + 1}
                      </span>
                      <p className='text-sm font-semibold text-white'>{item.name}</p>
                    </div>
                    <PremiumBadge variant="secondary" size="sm">{percentage}%</PremiumBadge>
                  </div>
                  <div className='w-full bg-slate-800/60 rounded-full h-2.5'>
                    <div 
                      className='gradient-secondary h-2.5 rounded-full transition-all duration-1000 ease-out shadow-secondary-glow'
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className='text-xs text-slate-400 mt-1.5 font-medium'>{item.order_count} orders</p>
                </div>
              );
            })}

            {(!stats.popular_items || stats.popular_items.length === 0) && (
              <div className='text-center py-8'>
                <div className='w-16 h-16 mx-auto mb-3 rounded-full bg-slate-800/80 flex items-center justify-center'>
                  <svg className='w-8 h-8 text-slate-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                  </svg>
                </div>
                <p className='text-sm text-slate-400 font-medium'>No orders yet</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

    </div>
  );
};

export default DashboardAnalytics;
