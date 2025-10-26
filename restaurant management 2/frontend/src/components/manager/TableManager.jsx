import React, { useState, useEffect, useRef } from 'react';
import { tablesAPI } from '../../services/api';
import Card from '../shared/Card';
import toast from 'react-hot-toast';

// Table Shape Component
const TableShape = ({ table, onClick, position }) => {
  const statusColors = {
    'Available': { bg: '#10b981', border: '#059669', text: '#ffffff' },
    'Occupied': { bg: '#f59e0b', border: '#d97706', text: '#ffffff' },
    'Needs Service': { bg: '#3b82f6', border: '#2563eb', text: '#ffffff' },
    'Cleaning': { bg: '#6b7280', border: '#4b5563', text: '#ffffff' },
  };
  
  const colors = statusColors[table.status] || statusColors['Available'];
  const isRound = table.capacity <= 4;
  
  return (
    <div
      onClick={() => onClick(table)}
      className="absolute cursor-pointer transition-all duration-300 hover:scale-110 group"
      style={{
        left: position?.x || (table.id * 120) % 800,
        top: position?.y || Math.floor((table.id * 120) / 800) * 150 + 50,
        width: isRound ? '100px' : '120px',
        height: isRound ? '100px' : '80px',
      }}
    >
      <div
        className="w-full h-full flex flex-col items-center justify-center shadow-lg hover:shadow-2xl transition-shadow"
        style={{
          backgroundColor: colors.bg,
          borderRadius: isRound ? '50%' : '12px',
          border: `4px solid ${colors.border}`,
        }}
      >
        <div className="text-center">
          <p className="text-xl font-bold" style={{ color: colors.text }}>
            {table.table_number}
          </p>
          <div className="flex items-center justify-center gap-1 mt-1">
            {[...Array(Math.min(table.capacity, 6))].map((_, i) => (
              <svg key={i} className="w-3 h-3 opacity-70" fill={colors.text} viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            ))}
          </div>
          <p className="text-xs mt-1 opacity-90" style={{ color: colors.text }}>
            {table.capacity} seats
          </p>
        </div>
      </div>
      
      {/* Tooltip on hover */}
      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 glass-card border border-slate-700/50 text-white px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
        Table {table.table_number} - {table.status}
      </div>
    </div>
  );
};

// Table Detail Modal
const TableDetailModal = ({ table, onClose, onUpdateStatus, onViewOrder }) => {
  if (!table) return null;
  
  const [timeElapsed, setTimeElapsed] = useState('0:00');
  
  useEffect(() => {
    if (table.status === 'Occupied') {
      // Mock time calculation - in real app, this would come from when the table was occupied
      const interval = setInterval(() => {
        // This is a mock - you'd calculate from actual timestamp
        setTimeElapsed('1:23:45');
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [table]);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="glass-premium rounded-2xl max-w-2xl w-full border border-slate-700/50">
        <div className="gradient-primary text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-2xl font-bold">Table {table.table_number}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {table.status === 'Available' ? (
            <>
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🪑</div>
                <h3 className="text-2xl font-bold text-white mb-2">Table Available</h3>
                <p className="text-slate-400 mb-6">
                  This table is ready for new guests. Capacity: {table.capacity} people.
                </p>
                <button
                  onClick={() => {
                    onUpdateStatus(table.id, 'Occupied');
                    onClose();
                  }}
                  className="px-8 py-4 bg-success-600 text-white rounded-xl font-semibold hover:bg-success-700 transition-all text-lg shadow-lg hover:shadow-xl"
                >
                  Seat Customer
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Status</p>
                  <p className={`text-lg font-bold ${
                    table.status === 'Occupied' ? 'text-warning-400' :
                    table.status === 'Needs Service' ? 'text-primary-400' :
                    'text-slate-200'
                  }`}>
                    {table.status}
                  </p>
                </div>
                
                <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Time Elapsed</p>
                  <p className="text-lg font-bold text-white">{timeElapsed}</p>
                </div>
                
                <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Capacity</p>
                  <p className="text-lg font-bold text-white">{table.capacity} guests</p>
                </div>
                
                <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Table Number</p>
                  <p className="text-lg font-bold text-white">#{table.table_number}</p>
                </div>
              </div>
              
              <div className="border-t pt-6 space-y-3">
                <button
                  onClick={() => onViewOrder(table)}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <span>📋</span> View Current Order/Bill
                </button>
                
                <button
                  onClick={() => {
                    onUpdateStatus(table.id, 'Needs Service');
                    onClose();
                  }}
                  className="w-full px-6 py-3 bg-yellow-600 text-white rounded-xl font-semibold hover:bg-yellow-700 transition-all flex items-center justify-center gap-2"
                >
                  <span>🔔</span> Request Service
                </button>
                
                <button
                  onClick={() => {
                    onUpdateStatus(table.id, 'Cleaning');
                    onClose();
                  }}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  <span>💳</span> Mark as Paid (Needs Cleaning)
                </button>
                
                <button
                  onClick={() => {
                    onUpdateStatus(table.id, 'Available');
                    onClose();
                  }}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <span>✨</span> Mark as Clean & Available
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TableManager = () => {
  const [tables, setTables] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('floorplan'); // 'floorplan' or 'list'
  const [formData, setFormData] = useState({
    table_number: '',
    capacity: 4,
    shape: 'round',
    status: 'Available',
  });

  useEffect(() => {
    fetchTables();
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchTables, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTables = async () => {
    try {
      const response = await tablesAPI.getAll();
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Failed to load tables');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await tablesAPI.create({
        ...formData,
        table_number: parseInt(formData.table_number),
        capacity: parseInt(formData.capacity),
      });
      toast.success('Table added successfully!');
      fetchTables();
      resetForm();
    } catch (error) {
      console.error('Error creating table:', error);
      toast.error('Failed to create table');
    }
  };

  const updateTableStatus = async (id, status) => {
    try {
      await tablesAPI.update(id, { status });
      toast.success(`Table status updated to ${status}`);
      fetchTables();
    } catch (error) {
      console.error('Error updating table:', error);
      toast.error('Failed to update table status');
    }
  };

  const handleViewOrder = (table) => {
    toast.info('Order management integration coming soon!');
    // This would navigate to the order/billing page for this table
  };

  const resetForm = () => {
    setFormData({ table_number: '', capacity: 4, shape: 'round', status: 'Available' });
    setShowAddModal(false);
  };

  // Filter tables based on search and status
  const filteredTables = tables.filter(table => {
    const matchesSearch = searchTerm === '' || 
      table.table_number.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || table.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'Available').length,
    occupied: tables.filter(t => t.status === 'Occupied').length,
    needsService: tables.filter(t => t.status === 'Needs Service').length,
    cleaning: tables.filter(t => t.status === 'Cleaning').length,
  };

  return (
    <div className="w-full rounded-xl overflow-hidden" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/30 px-6 py-5">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                Table Management
              </h1>
              <p className="text-slate-400 text-lg">
                Interactive Floorplan View
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search table number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 glass-card border border-slate-700/50 rounded-xl focus:outline-none focus:border-primary-500 w-64 text-white placeholder-slate-400"
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl font-semibold focus:outline-none focus:border-primary-500 text-slate-200"
              >
                <option value="All">All Tables ({stats.total})</option>
                <option value="Available">Available ({stats.available})</option>
                <option value="Occupied">Occupied ({stats.occupied})</option>
                <option value="Needs Service">Needs Service ({stats.needsService})</option>
                <option value="Cleaning">Cleaning ({stats.cleaning})</option>
              </select>
              
              {/* View Toggle */}
              <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700/50">
                <button
                  onClick={() => setViewMode('floorplan')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    viewMode === 'floorplan'
                      ? 'gradient-primary text-white shadow-primary-glow'
                      : 'text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  🗺️ Floorplan
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    viewMode === 'list'
                      ? 'gradient-primary text-white shadow-primary-glow'
                      : 'text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  📋 List
                </button>
              </div>
              
              {/* Add Table */}
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 gradient-primary text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-primary-glow flex items-center gap-2"
              >
                <span className="text-xl">+</span> Add Table
              </button>
            </div>
          </div>
        </div>

        {/* Floorplan Canvas or List View */}
        <div className="flex-1 overflow-auto p-6">
          {viewMode === 'floorplan' ? (
            <div className="glass-card rounded-xl border border-slate-700/50 min-h-[600px] relative shadow-inner"
                 style={{ 
                   backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.1) 1px, transparent 1px)',
                   backgroundSize: '40px 40px'
                 }}>
              {filteredTables.length > 0 ? (
                filteredTables.map((table) => (
                  <TableShape
                    key={table.id}
                    table={table}
                    onClick={setSelectedTable}
                  />
                ))
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🪑</div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {searchTerm || statusFilter !== 'All' ? 'No tables match your filter' : 'No tables added yet'}
                    </h3>
                    <p className="text-slate-400 mb-6">
                      {searchTerm || statusFilter !== 'All' 
                        ? 'Try adjusting your search or filter'
                        : 'Click "Add Table" to start setting up your restaurant floor'
                      }
                    </p>
                    {!searchTerm && statusFilter === 'All' && (
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="px-8 py-4 gradient-primary text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-primary-glow"
                      >
                        Add First Table
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // List View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
              {filteredTables.map((table) => (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className="glass-card rounded-xl p-6 border border-slate-700/50 hover:border-primary-500 cursor-pointer transition-all shadow-lg hover:shadow-primary-glow hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white">Table {table.table_number}</h3>
                      <p className="text-sm text-slate-400">Capacity: {table.capacity} guests</p>
                    </div>
                    <div className="text-3xl">
                      {table.capacity <= 4 ? '⭕' : '▭'}
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className={`inline-block px-4 py-2 rounded-lg font-semibold text-sm ${
                      table.status === 'Available' ? 'bg-success-500/20 text-success-400 border border-success-500/30' :
                      table.status === 'Occupied' ? 'bg-warning-500/20 text-warning-400 border border-warning-500/30' :
                      table.status === 'Needs Service' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' :
                      'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                    }`}>
                      {table.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Status Legend & Stats */}
      <div 
        className="glass-card border-l border-slate-700/50 overflow-y-auto"
        style={{ 
          width: 'var(--card-width-md)',
          padding: 'var(--space-lg)',
          height: 'calc(100vh - 55px)',
          position: 'sticky',
          top: '55px'
        }}
      >
        <h3 
          className="font-bold text-white"
          style={{ 
            fontSize: 'var(--text-xl)', 
            lineHeight: 'var(--leading-tight)',
            marginBottom: 'var(--space-lg)'
          }}
        >
          Status Legend
        </h3>
        
        <div 
          className="mb-8"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
        >
          <div 
            className="flex items-center glass-card border-2 border-success-500/30 bg-success-900/20"
            style={{ 
              gap: 'var(--space-sm)', 
              padding: 'var(--space-sm)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div 
              className="bg-success-500 rounded-full flex-shrink-0 shadow-md"
              style={{ width: '55px', height: '55px' }}
            ></div>
            <div className="flex-1">
              <p className="font-bold text-white" style={{ fontSize: 'var(--text-base)' }}>Available</p>
              <p className="text-slate-400" style={{ fontSize: 'var(--text-xs)' }}>Ready for seating</p>
            </div>
            <p 
              className="font-bold text-success-400"
              style={{ fontSize: 'var(--text-xl)', lineHeight: 'var(--leading-tight)' }}
            >
              {stats.available}
            </p>
          </div>
          
          <div 
            className="flex items-center glass-card border-2 border-warning-500/30 bg-warning-900/20"
            style={{ 
              gap: 'var(--space-sm)', 
              padding: 'var(--space-sm)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div 
              className="bg-warning-500 rounded-full flex-shrink-0 shadow-md"
              style={{ width: '55px', height: '55px' }}
            ></div>
            <div className="flex-1">
              <p className="font-bold text-white" style={{ fontSize: 'var(--text-base)' }}>Occupied</p>
              <p className="text-slate-400" style={{ fontSize: 'var(--text-xs)' }}>Customers seated</p>
            </div>
            <p 
              className="font-bold text-warning-400"
              style={{ fontSize: 'var(--text-xl)', lineHeight: 'var(--leading-tight)' }}
            >
              {stats.occupied}
            </p>
          </div>
          
          <div 
            className="flex items-center glass-card border-2 border-primary-500/30 bg-primary-900/20"
            style={{ 
              gap: 'var(--space-sm)', 
              padding: 'var(--space-sm)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div 
              className="bg-primary-500 rounded-full flex-shrink-0 shadow-md"
              style={{ width: '55px', height: '55px' }}
            ></div>
            <div className="flex-1">
              <p className="font-bold text-white" style={{ fontSize: 'var(--text-base)' }}>Needs Service</p>
              <p className="text-slate-400" style={{ fontSize: 'var(--text-xs)' }}>Requested assistance</p>
            </div>
            <p 
              className="font-bold text-primary-400"
              style={{ fontSize: 'var(--text-xl)', lineHeight: 'var(--leading-tight)' }}
            >
              {stats.needsService}
            </p>
          </div>
          
          <div 
            className="flex items-center glass-card border-2 border-slate-600/30 bg-slate-800/20"
            style={{ 
              gap: 'var(--space-sm)', 
              padding: 'var(--space-sm)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div 
              className="bg-slate-500 rounded-full flex-shrink-0 shadow-md"
              style={{ width: '55px', height: '55px' }}
            ></div>
            <div className="flex-1">
              <p className="font-bold text-white" style={{ fontSize: 'var(--text-base)' }}>Cleaning</p>
              <p className="text-slate-400" style={{ fontSize: 'var(--text-xs)' }}>Being prepared</p>
            </div>
            <p 
              className="font-bold text-slate-400"
              style={{ fontSize: 'var(--text-xl)', lineHeight: 'var(--leading-tight)' }}
            >
              {stats.cleaning}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="border-t-2 pt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-semibold">Total Tables</span>
              <span className="text-2xl font-bold text-teal-600">{stats.total}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-semibold">Occupancy Rate</span>
              <span className="text-2xl font-bold text-teal-600">
                {stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-semibold">Available Now</span>
              <span className="text-2xl font-bold text-green-600">{stats.available}</span>
            </div>
          </div>
        </div>

        {/* Legend Info */}
        <div className="border-t-2 pt-6 mt-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Table Shapes</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-200 rounded-full border-2 border-teal-400"></div>
              <span>Round tables (2-4 seats)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-6 bg-teal-200 rounded border-2 border-teal-400"></div>
              <span>Rectangular (5+ seats)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-bold">Add New Table</h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Table Number *
                </label>
                <input
                  type="number"
                  value={formData.table_number}
                  onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                  placeholder="e.g., 1, 2, 3..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Capacity (Number of Seats) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                  placeholder="e.g., 2, 4, 6..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Table Shape
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, shape: 'round' })}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      formData.shape === 'round'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-12 h-12 bg-teal-200 rounded-full mx-auto mb-2"></div>
                    <p className="font-semibold text-sm">Round</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, shape: 'rectangle' })}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      formData.shape === 'rectangle'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-16 h-8 bg-teal-200 rounded mx-auto mb-2"></div>
                    <p className="font-semibold text-sm">Rectangle</p>
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg"
                >
                  Add Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Detail Modal */}
      {selectedTable && (
        <TableDetailModal
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
          onUpdateStatus={updateTableStatus}
          onViewOrder={handleViewOrder}
        />
      )}
    </div>
  );
};

export default TableManager;
 