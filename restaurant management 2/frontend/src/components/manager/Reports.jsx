import React, { useState, useEffect, useMemo } from 'react';
import { analyticsAPI, billsAPI, ordersAPI } from '../../services/api';
import Card from '../shared/Card';
import toast from 'react-hot-toast';

// Simple Line Chart Component
const LineChart = ({ data, title }) => {
  if (!data || data.length === 0) return null;
  
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.value - minValue) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');
  
  const [hoveredPoint, setHoveredPoint] = useState(null);
  
  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
      <div className="relative h-64">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="0.2"
            />
          ))}
          
          {/* Area fill */}
          <polygon
            points={`0,100 ${points} 100,100`}
            fill="url(#gradient)"
            opacity="0.2"
          />
          
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#14b8a6"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((item.value - minValue) / range) * 80 - 10;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1"
                fill="#14b8a6"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Hover tooltip */}
        {hoveredPoint !== null && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
            <div className="font-bold">{data[hoveredPoint].label}</div>
            <div>₹{data[hoveredPoint].value.toFixed(2)}</div>
          </div>
        )}
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-4 text-xs text-gray-600">
        {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((item, index) => (
          <span key={index}>{item.label}</span>
        ))}
      </div>
    </div>
  );
};

// Bill Detail Modal
const BillDetailModal = ({ bill, onClose }) => {
  if (!bill) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Bill Details - #{bill.id}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="text-lg font-semibold">#{bill.order_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date & Time</p>
              <p className="text-lg font-semibold">
                {new Date(bill.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <p className={`text-lg font-semibold ${bill.paid ? 'text-green-600' : 'text-red-600'}`}>
                {bill.paid ? '✓ Paid' : '✗ Unpaid'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-teal-600">₹{bill.total_amount.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
            <p className="text-gray-600 text-sm">Item details would be loaded from order data...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Reports = () => {
  const [dateRange, setDateRange] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [stats, setStats] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, billsRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        billsAPI.getAll()
      ]);
      setStats(analyticsRes.data);
      setBills(billsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
      setLoading(false);
    }
  };

  const filterBillsByDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return bills.filter(bill => {
      const billDate = new Date(bill.created_at);
      
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        return billDate >= start && billDate <= end;
      }
      
      switch(dateRange) {
        case 'today':
          return billDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return billDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return billDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const getComparisonData = () => {
    const now = new Date();
    let comparisonStart, comparisonEnd;
    
    switch(dateRange) {
      case 'today':
        comparisonStart = new Date(now);
        comparisonStart.setDate(comparisonStart.getDate() - 1);
        comparisonEnd = new Date(now);
        comparisonEnd.setDate(comparisonEnd.getDate() - 1);
        break;
      case 'week':
        comparisonStart = new Date(now);
        comparisonStart.setDate(comparisonStart.getDate() - 14);
        comparisonEnd = new Date(now);
        comparisonEnd.setDate(comparisonEnd.getDate() - 7);
        break;
      case 'month':
        comparisonStart = new Date(now);
        comparisonStart.setMonth(comparisonStart.getMonth() - 2);
        comparisonEnd = new Date(now);
        comparisonEnd.setMonth(comparisonEnd.getMonth() - 1);
        break;
      default:
        return { bills: [], revenue: 0, paidCount: 0, unpaidCount: 0 };
    }
    
    const comparisonBills = bills.filter(bill => {
      const billDate = new Date(bill.created_at);
      return billDate >= comparisonStart && billDate <= comparisonEnd;
    });
    
    return {
      bills: comparisonBills,
      revenue: comparisonBills.reduce((sum, bill) => sum + bill.total_amount, 0),
      paidCount: comparisonBills.filter(b => b.paid).length,
      unpaidCount: comparisonBills.filter(b => !b.paid).length,
      totalCount: comparisonBills.length
    };
  };

  const filteredBills = useMemo(() => {
    let filtered = filterBillsByDateRange();
    
    // Status filter
    if (statusFilter === 'paid') {
      filtered = filtered.filter(b => b.paid);
    } else if (statusFilter === 'unpaid') {
      filtered = filtered.filter(b => !b.paid);
    }
    
    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      if (sortColumn === 'created_at') {
        aVal = new Date(a.created_at).getTime();
        bVal = new Date(b.created_at).getTime();
      } else if (sortColumn === 'amount') {
        aVal = a.total_amount;
        bVal = b.total_amount;
      } else {
        aVal = a[sortColumn];
        bVal = b[sortColumn];
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  }, [bills, dateRange, customStartDate, customEndDate, statusFilter, sortColumn, sortDirection]);

  const totalRevenue = filteredBills.reduce((sum, bill) => sum + bill.total_amount, 0);
  const paidBills = filteredBills.filter(b => b.paid);
  const unpaidBills = filteredBills.filter(b => !b.paid);
  const paidRevenue = paidBills.reduce((sum, bill) => sum + bill.total_amount, 0);
  const comparisonData = compareMode ? getComparisonData() : null;

  // Generate chart data
  const chartData = useMemo(() => {
    const dataByDate = {};
    
    filteredBills.forEach(bill => {
      const date = new Date(bill.created_at).toLocaleDateString();
      if (!dataByDate[date]) {
        dataByDate[date] = 0;
      }
      dataByDate[date] += bill.total_amount;
    });
    
    return Object.entries(dataByDate)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, value]) => ({ label: date, value }));
  }, [filteredBills]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const exportToCSV = () => {
    const headers = ['Bill ID', 'Order ID', 'Date', 'Time', 'Amount', 'Payment Status'];
    const rows = filteredBills.map(bill => [
      bill.id,
      bill.order_id,
      new Date(bill.created_at).toLocaleDateString(),
      new Date(bill.created_at).toLocaleTimeString(),
      bill.total_amount.toFixed(2),
      bill.paid ? 'Paid' : 'Unpaid'
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Report exported to CSV!');
  };

  const printReport = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Sales Report</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; padding: 20px; }
      h1 { text-align: center; color: #333; }
      .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
      .summary-card { border: 2px solid #ddd; padding: 15px; border-radius: 8px; }
      .summary-card h3 { margin: 0 0 10px 0; color: #666; font-size: 14px; }
      .summary-card p { margin: 0; font-size: 24px; font-weight: bold; color: #333; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
      th { background-color: #4F46E5; color: white; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<h1>Sales Report - ' + dateRange.charAt(0).toUpperCase() + dateRange.slice(1) + '</h1>');
    printWindow.document.write('<p style="text-align: center; color: #666;">Generated on: ' + new Date().toLocaleString() + '</p>');
    
    printWindow.document.write('<div class="summary">');
    printWindow.document.write('<div class="summary-card"><h3>Total Bills</h3><p>' + filteredBills.length + '</p></div>');
    printWindow.document.write('<div class="summary-card"><h3>Total Revenue</h3><p>₹' + totalRevenue.toFixed(2) + '</p></div>');
    printWindow.document.write('<div class="summary-card"><h3>Paid Bills</h3><p>' + paidBills.length + '</p></div>');
    printWindow.document.write('<div class="summary-card"><h3>Paid Revenue</h3><p>₹' + paidRevenue.toFixed(2) + '</p></div>');
    printWindow.document.write('</div>');
    
    printWindow.document.write('<table>');
    printWindow.document.write('<thead><tr><th>Bill ID</th><th>Order ID</th><th>Date</th><th>Time</th><th>Amount</th><th>Status</th></tr></thead>');
    printWindow.document.write('<tbody>');
    
    filteredBills.forEach(bill => {
      printWindow.document.write('<tr>');
      printWindow.document.write('<td>#' + bill.id + '</td>');
      printWindow.document.write('<td>#' + bill.order_id + '</td>');
      printWindow.document.write('<td>' + new Date(bill.created_at).toLocaleDateString() + '</td>');
      printWindow.document.write('<td>' + new Date(bill.created_at).toLocaleTimeString() + '</td>');
      printWindow.document.write('<td>₹' + bill.total_amount.toFixed(2) + '</td>');
      printWindow.document.write('<td>' + (bill.paid ? '✓ Paid' : '✗ Unpaid') + '</td>');
      printWindow.document.write('</tr>');
    });
    
    printWindow.document.write('</tbody></table>');
    printWindow.document.write('<div class="footer">');
    printWindow.document.write('<p>Restaurant Manager - Sales Report</p>');
    printWindow.document.write('<p>This is a computer generated report</p>');
    printWindow.document.write('</div>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-96'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-xl font-semibold text-slate-200'>Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sticky Control Bar */}
      <div className="sticky top-0 z-40 glass-card border-b border-slate-700/50 shadow-sm">
        <div 
          className="max-w-7xl mx-auto"
          style={{ padding: 'var(--space-md) var(--space-lg)' }}
        >
          <div 
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center"
            style={{ gap: 'var(--space-md)' }}
          >
            {/* Title */}
            <div>
              <h1 
                className="font-bold text-white"
                style={{ 
                  fontSize: 'var(--text-3xl)', 
                  lineHeight: 'var(--leading-tight)',
                  letterSpacing: '-0.02em'
                }}
              >
                Sales Reports
              </h1>
              <p 
                className="text-slate-400"
                style={{ 
                  fontSize: 'var(--text-base)', 
                  marginTop: 'var(--space-xs)' 
                }}
              >
                Business Intelligence Dashboard
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex flex-wrap items-center" style={{ gap: 'var(--space-sm)' }}>
              {/* Date Range Picker */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl font-semibold text-slate-200 focus:outline-none focus:border-primary-500 transition-all"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="custom">Custom Range</option>
                <option value="all">All Time</option>
              </select>
              
              {/* Custom Date Inputs */}
              {dateRange === 'custom' && (
                <>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-gray-600">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </>
              )}
              
              {/* Compare Period Toggle */}
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  compareMode
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📊 Compare Period
              </button>
              
              {/* Export CSV */}
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span>�</span> Export CSV
              </button>
              
              {/* Print */}
              <button
                onClick={printReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span>🖨️</span> Print
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Bills */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-500 transition-all shadow-sm hover:shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Total Bills</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                📄
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-blue-600">{filteredBills.length}</p>
                {compareMode && comparisonData && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-sm font-semibold ${
                      filteredBills.length >= comparisonData.totalCount ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {filteredBills.length >= comparisonData.totalCount ? '↑' : '↓'} 
                      {calculatePercentageChange(filteredBills.length, comparisonData.totalCount)}%
                    </span>
                    <span className="text-xs text-gray-500">vs previous period</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-green-500 transition-all shadow-sm hover:shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Total Revenue</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">
                💰
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-green-600">₹{totalRevenue.toFixed(2)}</p>
                {compareMode && comparisonData && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-sm font-semibold ${
                      totalRevenue >= comparisonData.revenue ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {totalRevenue >= comparisonData.revenue ? '↑' : '↓'} 
                      {calculatePercentageChange(totalRevenue, comparisonData.revenue)}%
                    </span>
                    <span className="text-xs text-gray-500">vs previous period</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Paid Bills */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-purple-500 transition-all shadow-sm hover:shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Paid Bills</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">
                ✓
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-purple-600">{paidBills.length}</p>
                <p className="text-sm text-gray-600 mt-1">₹{paidRevenue.toFixed(2)}</p>
                {compareMode && comparisonData && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-sm font-semibold ${
                      paidBills.length >= comparisonData.paidCount ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {paidBills.length >= comparisonData.paidCount ? '↑' : '↓'} 
                      {calculatePercentageChange(paidBills.length, comparisonData.paidCount)}%
                    </span>
                    <span className="text-xs text-gray-500">vs previous period</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Unpaid Bills */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-orange-500 transition-all shadow-sm hover:shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Unpaid Bills</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">
                ⚠️
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-orange-600">{unpaidBills.length}</p>
                <p className="text-sm text-gray-600 mt-1">₹{(totalRevenue - paidRevenue).toFixed(2)}</p>
                {compareMode && comparisonData && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-sm font-semibold ${
                      unpaidBills.length <= comparisonData.unpaidCount ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {unpaidBills.length <= comparisonData.unpaidCount ? '↓' : '↑'} 
                      {Math.abs(calculatePercentageChange(unpaidBills.length, comparisonData.unpaidCount))}%
                    </span>
                    <span className="text-xs text-gray-500">vs previous period</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        {chartData.length > 0 && (
          <div className="mb-8">
            <LineChart data={chartData} title="📈 Revenue Trend Analysis" />
          </div>
        )}

        {/* Bill Details Table */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Bill Details</h3>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid Only</option>
              <option value="unpaid">Unpaid Only</option>
            </select>
          </div>
          
          {filteredBills.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        onClick={() => handleSort('id')}
                        className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          Bill ID
                          {sortColumn === 'id' && (
                            <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Order ID</th>
                      <th 
                        onClick={() => handleSort('created_at')}
                        className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          Date
                          {sortColumn === 'created_at' && (
                            <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Time</th>
                      <th 
                        onClick={() => handleSort('amount')}
                        className="text-right py-4 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-end gap-2">
                          Amount
                          {sortColumn === 'amount' && (
                            <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Payment Method</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((bill, index) => (
                      <tr 
                        key={bill.id} 
                        className={`border-t border-gray-200 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="py-4 px-6">
                          <button
                            onClick={() => setSelectedBill(bill)}
                            className="font-bold text-teal-600 hover:text-teal-700 hover:underline"
                          >
                            #{bill.id}
                          </button>
                        </td>
                        <td className="py-4 px-6 text-gray-700">#{bill.order_id}</td>
                        <td className="py-4 px-6 text-gray-700">
                          {new Date(bill.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          {new Date(bill.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-gray-900">
                          ₹{bill.total_amount.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                            {bill.payment_method || 'Cash'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                            bill.paid 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {bill.paid ? '✓ Paid' : '✗ Unpaid'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Sticky Footer with Totals */}
              <div className="sticky bottom-0 bg-teal-600 text-white px-6 py-4 flex justify-between items-center font-bold">
                <div className="flex items-center gap-8">
                  <div>
                    <span className="text-teal-100 text-sm">Total Bills:</span>
                    <span className="ml-2 text-xl">{filteredBills.length}</span>
                  </div>
                  <div>
                    <span className="text-teal-100 text-sm">Grand Total:</span>
                    <span className="ml-2 text-2xl">₹{totalRevenue.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-sm text-teal-100">
                  {paidBills.length} Paid • {unpaidBills.length} Unpaid
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-8xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No sales activity found</h3>
              <p className="text-gray-600 mb-6">
                No sales activity found for this date range. Adjust your date filter above.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bill Detail Modal */}
      {selectedBill && (
        <BillDetailModal bill={selectedBill} onClose={() => setSelectedBill(null)} />
      )}
    </div>
  );
};

export default Reports;
