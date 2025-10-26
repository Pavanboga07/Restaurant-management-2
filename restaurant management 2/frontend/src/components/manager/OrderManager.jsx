import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ordersAPI, tablesAPI, menuAPI } from '../../services/api';
import Card from '../shared/Card';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    table_id: '',
    items: [],
    order_type: 'Dine-in',
    customer_name: '',
    special_notes: ''
  });
  
  // New state for KDS features
  const [searchTerm, setSearchTerm] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('All');
  const [draggedOrder, setDraggedOrder] = useState(null);
  const [itemCheckStates, setItemCheckStates] = useState({}); // Track checked items per order
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(null);
  const audioRef = useRef(null);
  const previousOrderCount = useRef(0);

  useEffect(() => {
    fetchOrders();
    fetchTables();
    fetchMenuItems();
    
    // Poll for new orders every 10 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll(true);
      const newOrders = response.data;
      
      // Check for new orders and play alert
      if (newOrders.length > previousOrderCount.current && previousOrderCount.current > 0) {
        playNewOrderAlert();
      }
      previousOrderCount.current = newOrders.length;
      
      setOrders(newOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };
  
  const playNewOrderAlert = () => {
    // Play audio alert
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
    
    // Visual flash effect
    document.body.style.animation = 'flash 0.5s';
    setTimeout(() => {
      document.body.style.animation = '';
    }, 500);
  };

  const fetchTables = async () => {
    try {
      const response = await tablesAPI.getAll();
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await menuAPI.getAll();
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ordersAPI.create({
        table_id: parseInt(formData.table_id),
        items: formData.items.map((item) => ({
          menu_item_id: parseInt(item.menu_item_id),
          quantity: parseInt(item.quantity),
          notes: item.notes || ''
        })),
        order_type: formData.order_type,
        customer_name: formData.customer_name,
        special_notes: formData.special_notes
      });
      fetchOrders();
      fetchTables();
      resetForm();
      
      // Show success toast
      showToast('Order created successfully!', 'success');
    } catch (error) {
      console.error('Error creating order:', error);
      showToast('Failed to create order', 'error');
    }
  };

  const addMenuItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { menu_item_id: '', quantity: 1 }],
    });
  };

  const updateOrderItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const removeOrderItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.update(orderId, { status: newStatus });
      fetchOrders();
      if (newStatus === 'Completed') {
        fetchTables();
        playCompletionSound();
      }
      showToast(`Order moved to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating order:', error);
      showToast('Failed to update order', 'error');
    }
  };
  
  const playCompletionSound = () => {
    // Visual confirmation flash
    setShowCompleteConfirm(true);
    setTimeout(() => setShowCompleteConfirm(false), 1000);
  };
  
  const toggleItemCheck = (orderId, itemIndex) => {
    setItemCheckStates(prev => {
      const orderKey = `order_${orderId}`;
      const current = prev[orderKey] || [];
      const newState = current.includes(itemIndex)
        ? current.filter(i => i !== itemIndex)
        : [...current, itemIndex];
      return { ...prev, [orderKey]: newState };
    });
  };
  
  const getCheckedItems = (orderId) => {
    return itemCheckStates[`order_${orderId}`] || [];
  };

  const resetForm = () => {
    setFormData({ 
      table_id: '', 
      items: [],
      order_type: 'Dine-in',
      customer_name: '',
      special_notes: ''
    });
    setShowForm(false);
  };
  
  const showToast = (message, type = 'info') => {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    } text-white font-semibold`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Helper function to group items by name and count quantities
  const groupOrderItems = (items) => {
    const grouped = {};
    items.forEach(item => {
      if (grouped[item.name]) {
        grouped[item.name].quantity += 1;
      } else {
        grouped[item.name] = {
          name: item.name,
          price: item.price,
          quantity: 1,
          notes: item.notes
        };
      }
    });
    return Object.values(grouped);
  };
  
  // Calculate time elapsed and urgency level
  const getOrderUrgency = (createdAt, status) => {
    const now = new Date();
    const created = new Date(createdAt);
    const minutesElapsed = Math.floor((now - created) / 1000 / 60);
    
    if (status === 'Completed') return { color: 'gray', level: 'completed', minutesElapsed };
    if (minutesElapsed < 10) return { color: 'green', level: 'low', minutesElapsed };
    if (minutesElapsed < 20) return { color: 'yellow', level: 'medium', minutesElapsed };
    return { color: 'red', level: 'high', minutesElapsed };
  };
  
  // Filter and organize orders by status
  const organizedOrders = useMemo(() => {
    let filtered = orders;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => {
        const table = tables.find(t => t.id === order.table_id);
        const tableNum = table?.table_number?.toString() || '';
        const orderId = order.id?.toString() || '';
        return tableNum.includes(searchTerm) || orderId.includes(searchTerm);
      });
    }
    
    // Filter by order type
    if (orderTypeFilter !== 'All') {
      filtered = filtered.filter(order => 
        (order.order_type || 'Dine-in') === orderTypeFilter
      );
    }
    
    // Group by status
    const statusMap = {
      'Pending': 'new',
      'In Progress': 'cooking',
      'Ready': 'ready',
      'Completed': 'completed'
    };
    
    return {
      new: filtered.filter(o => o.status === 'Pending'),
      cooking: filtered.filter(o => o.status === 'In Progress'),
      ready: filtered.filter(o => o.status === 'Ready'),
      completed: filtered.filter(o => o.status === 'Completed')
    };
  }, [orders, searchTerm, orderTypeFilter, tables]);
  
  // Drag and drop handlers
  const handleDragStart = (e, order) => {
    setDraggedOrder(order);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedOrder) {
      updateOrderStatus(draggedOrder.id, newStatus);
      setDraggedOrder(null);
    }
  };
  
  const getNextStatus = (currentStatus) => {
    const flow = {
      'Pending': 'In Progress',
      'In Progress': 'Ready',
      'Ready': 'Completed',
      'Completed': 'Completed'
    };
    return flow[currentStatus] || currentStatus;
  };
  
  const getStatusButtonText = (status) => {
    const buttonText = {
      'Pending': '🔥 Start Cooking',
      'In Progress': '✅ Mark Ready',
      'Ready': '🍽️ Mark Served',
      'Completed': '✓ Completed'
    };
    return buttonText[status] || 'Next Step';
  };
  
  // OrderCard Component
  const OrderCard = ({ order }) => {
    const table = tables.find(t => t.id === order.table_id);
    const groupedItems = groupOrderItems(order.items || []);
    const urgency = getOrderUrgency(order.created_at, order.status);
    const checkedItems = getCheckedItems(order.id);
    const orderType = order.order_type || 'Dine-in';
    
    const orderTypeIcons = {
      'Dine-in': '🍽️',
      'Takeaway': '🥡',
      'Delivery': '🚗'
    };
    
    return (
      <div
        draggable={order.status !== 'Completed'}
        onDragStart={(e) => handleDragStart(e, order)}
        className={`bg-gray-800 rounded-lg p-4 mb-3 border-2 cursor-move transition-all hover:shadow-xl ${
          urgency.color === 'red' ? 'border-red-500 animate-pulse' :
          urgency.color === 'yellow' ? 'border-yellow-500' :
          urgency.color === 'green' ? 'border-green-500' :
          'border-gray-600'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{orderTypeIcons[orderType]}</span>
              <h3 className="text-2xl font-bold text-white">
                {orderType === 'Dine-in' ? `Table ${table?.table_number || order.table_id}` : 
                 orderType === 'Takeaway' ? `Takeaway #${order.id}` :
                 `Delivery #${order.id}`}
              </h3>
            </div>
            <p className="text-sm text-gray-400">Order #{order.id}</p>
            {order.customer_name && (
              <p className="text-sm text-gray-300 font-semibold">{order.customer_name}</p>
            )}
          </div>
          
          {/* Timer */}
          <div className={`text-center px-3 py-2 rounded-lg ${
            urgency.color === 'red' ? 'bg-red-600' :
            urgency.color === 'yellow' ? 'bg-yellow-600' :
            urgency.color === 'green' ? 'bg-green-600' :
            'bg-gray-600'
          }`}>
            <div className="text-3xl font-bold text-white">
              {urgency.minutesElapsed}
            </div>
            <div className="text-xs text-white uppercase tracking-wide">
              minutes
            </div>
          </div>
        </div>
        
        {/* Special Notes */}
        {order.special_notes && (
          <div className="mb-3 p-2 bg-yellow-900 border-l-4 border-yellow-500 rounded">
            <p className="text-yellow-200 font-semibold text-sm">
              ⚠️ {order.special_notes}
            </p>
          </div>
        )}
        
        {/* Items List */}
        <div className="mb-3 space-y-2">
          {groupedItems.map((item, idx) => {
            const isChecked = checkedItems.includes(idx);
            return (
              <div
                key={idx}
                onClick={() => order.status !== 'Completed' && toggleItemCheck(order.id, idx)}
                className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-all ${
                  isChecked ? 'bg-green-900 bg-opacity-50' : 'bg-gray-700 hover:bg-gray-650'
                }`}
              >
                {/* Checkbox */}
                <div className={`w-6 h-6 rounded border-2 flex-shrink-0 mt-1 flex items-center justify-center ${
                  isChecked ? 'bg-green-500 border-green-500' : 'border-gray-500'
                }`}>
                  {isChecked && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                
                {/* Item Details */}
                <div className="flex-1">
                  <p className={`text-lg font-bold text-white ${isChecked ? 'line-through' : ''}`}>
                    {item.quantity}x {item.name}
                  </p>
                  {item.notes && (
                    <p className="text-sm bg-yellow-700 text-yellow-100 px-2 py-1 rounded inline-block mt-1 font-semibold">
                      🔔 {item.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Action Button */}
        {order.status !== 'Completed' && (
          <button
            onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
            className={`w-full py-3 rounded-lg font-bold text-white text-lg transition-all ${
              order.status === 'Pending' ? 'bg-orange-600 hover:bg-orange-700' :
              order.status === 'In Progress' ? 'bg-blue-600 hover:bg-blue-700' :
              order.status === 'Ready' ? 'bg-green-600 hover:bg-green-700' :
              'bg-gray-600'
            }`}
          >
            {getStatusButtonText(order.status)}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full rounded-xl overflow-hidden" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* Audio element for new order alert */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0OVKni7KxaFQ1Lotvyv3AlBjiM0vLWgDAHHm/A7+OZSA0OVKni7KxaFQ1Lotvyv3AlBjiM0vLWgDAHHm/A7+OZSA0OVKni7KxaFQ1Lotvyv3AlBjiM0vLWgDAHHm/A7+OZSA0OVKni7KxaFQ1Lotvyv3AlBjiM0vLWgDAHHm/A7+OZSA0OVKni7KxaFQ1Lotvyv3AlBjiM0vLWgDAHHm/A7+OZSA0OVKni7KxaFQ1Lotvyv3AlBjiM0vLWgDAHHm/A7+OZSA0OVKni7KxaFQ1Lotvyv3AlBjiM0vLWgDAHHm/A7+OZSA0OVKni7KxaFQ1Lotvyv3AlBjiM0vLWgDAHHm/A7+OZSA0OVKni7KxaFQ1Lotvyv3AlBjiM0vLWgDAH" />
      
      {/* Completion Confirmation Flash */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 bg-green-500 bg-opacity-30 z-50 flex items-center justify-center pointer-events-none animate-pulse">
          <div className="bg-green-600 text-white px-12 py-6 rounded-2xl shadow-2xl text-4xl font-bold">
            ✓ Order Completed!
          </div>
        </div>
      )}
      
      {/* Sticky Control Bar */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/30 shadow-lg z-40 px-6 py-5">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
              Kitchen Display System
            </h1>
            <p className="text-slate-400 text-lg">
              Real-time Order Management
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search order or table..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500 w-64"
                style={{
                  padding: 'var(--space-xs) var(--space-md) var(--space-xs) 42px',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-sm)',
                  transition: 'all 0.382s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
              <svg 
                className="text-slate-400 absolute top-3"
                style={{ width: '21px', height: '21px', left: 'var(--space-sm)' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Order Type Filter */}
            <select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
              className="bg-slate-800 text-white border border-slate-700 font-semibold focus:outline-none focus:border-primary-500"
              style={{
                padding: 'var(--space-xs) var(--space-md)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-sm)',
                transition: 'all 0.382s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <option value="All">All Orders ({orders.length})</option>
              <option value="Dine-in">🍽️ Dine-in</option>
              <option value="Takeaway">🥡 Takeaway</option>
              <option value="Delivery">🚗 Delivery</option>
            </select>
            
            {/* New Order Button */}
            <button
              onClick={() => setShowForm(!showForm)}
              className="gradient-primary text-white font-semibold hover:scale-105 shadow-primary-glow flex items-center"
              style={{
                padding: 'var(--space-xs) var(--space-lg)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-sm)',
                gap: 'var(--space-xs)',
                transition: 'all 0.382s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <span style={{ fontSize: 'var(--text-xl)' }}>+</span>
              {showForm ? 'Cancel' : 'New Order'}
            </button>
          </div>
        </div>
      </div>
      
      {/* New Order Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-3xl w-full my-8">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-bold">Create New Order</h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Order Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Order Type *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Dine-in', 'Takeaway', 'Delivery'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, order_type: type })}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        formData.order_type === type
                          ? 'border-teal-500 bg-teal-900 bg-opacity-30'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-3xl mb-2">
                        {type === 'Dine-in' ? '🍽️' : type === 'Takeaway' ? '🥡' : '🚗'}
                      </div>
                      <p className="font-semibold text-white">{type}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Table or Customer */}
              {formData.order_type === 'Dine-in' ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Select Table *
                  </label>
                  <select
                    value={formData.table_id}
                    onChange={(e) => setFormData({ ...formData, table_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 text-white border-2 border-gray-600 rounded-xl focus:outline-none focus:border-teal-500"
                    required
                  >
                    <option value="">Choose a table</option>
                    {tables
                      .filter((t) => t.status === 'Available')
                      .map((table) => (
                        <option key={table.id} value={table.id}>
                          Table {table.table_number} (Capacity: {table.capacity})
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 text-white border-2 border-gray-600 rounded-xl focus:outline-none focus:border-teal-500"
                    placeholder="Enter customer name"
                    required
                  />
                </div>
              )}
              
              {/* Special Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Special Notes
                </label>
                <textarea
                  value={formData.special_notes}
                  onChange={(e) => setFormData({ ...formData, special_notes: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 text-white border-2 border-gray-600 rounded-xl focus:outline-none focus:border-teal-500"
                  placeholder="Any special instructions..."
                  rows={2}
                />
              </div>
              
              {/* Order Items */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-300">Order Items *</label>
                  <button
                    type="button"
                    onClick={addMenuItem}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                  >
                    + Add Item
                  </button>
                </div>
                
                {formData.items.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No items added yet</p>
                )}
                
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-3 bg-gray-700 p-3 rounded-lg">
                    <div className="flex-1">
                      <select
                        value={item.menu_item_id}
                        onChange={(e) => updateOrderItem(index, 'menu_item_id', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 text-white border-2 border-gray-500 rounded-lg focus:outline-none focus:border-teal-500 mb-2"
                        required
                      >
                        <option value="">Select item</option>
                        {menuItems.map((menuItem) => (
                          <option key={menuItem.id} value={menuItem.id}>
                            {menuItem.name} - ₹{menuItem.price}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => updateOrderItem(index, 'notes', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 text-white border-2 border-gray-500 rounded-lg focus:outline-none focus:border-teal-500"
                        placeholder="Special requests (NO ONIONS, EXTRA CHEESE, etc.)"
                      />
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)}
                      className="w-20 px-3 py-2 bg-gray-600 text-white border-2 border-gray-500 rounded-lg focus:outline-none focus:border-teal-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeOrderItem(index)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border-2 border-gray-600 text-gray-300 rounded-xl font-semibold hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Kanban Board - 4 Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex h-full min-w-max" style={{ gap: 'var(--space-md)' }}>
          {/* Column 1: New Orders */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'Pending')}
            className="flex-1 min-w-[320px] glass-card border border-danger-500/30 flex flex-col"
            style={{ borderRadius: 'var(--radius-lg)' }}
          >
            <div 
              className="bg-gradient-to-r from-danger-600 to-danger-500 text-white flex items-center"
              style={{ 
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                gap: 'var(--space-xs)'
              }}
            >
              <span style={{ fontSize: 'var(--text-lg)' }}>🆕</span>
              <h2 
                className="font-bold"
                style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-tight)' }}
              >
                New Orders
              </h2>
              <span 
                className="ml-auto bg-white text-danger-600 font-bold"
                style={{ 
                  padding: 'var(--space-xs) var(--space-sm)',
                  borderRadius: 'var(--radius-xl)',
                  fontSize: 'var(--text-xs)'
                }}
              >
                {organizedOrders.new.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ padding: 'var(--space-md)' }}>
              {organizedOrders.new.length === 0 ? (
                <div className="text-center text-slate-500" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-xl)' }}>
                  <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-md)' }}>📭</div>
                  <p style={{ fontSize: 'var(--text-sm)' }}>No new orders</p>
                </div>
              ) : (
                organizedOrders.new.map(order => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>
          
          {/* Column 2: In Progress */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'In Progress')}
            className="flex-1 min-w-[320px] glass-card border border-warning-500/30 flex flex-col"
            style={{ borderRadius: 'var(--radius-lg)' }}
          >
            <div 
              className="bg-gradient-to-r from-warning-600 to-warning-500 text-white flex items-center"
              style={{ 
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                gap: 'var(--space-xs)'
              }}
            >
              <span style={{ fontSize: 'var(--text-lg)' }}>🔥</span>
              <h2 
                className="font-bold"
                style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-tight)' }}
              >
                Cooking
              </h2>
              <span 
                className="ml-auto bg-white text-warning-600 font-bold"
                style={{ 
                  padding: 'var(--space-xs) var(--space-sm)',
                  borderRadius: 'var(--radius-xl)',
                  fontSize: 'var(--text-xs)'
                }}
              >
                {organizedOrders.cooking.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ padding: 'var(--space-md)' }}>
              {organizedOrders.cooking.length === 0 ? (
                <div className="text-center text-slate-500" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-xl)' }}>
                  <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-md)' }}>👨‍🍳</div>
                  <p style={{ fontSize: 'var(--text-sm)' }}>No orders cooking</p>
                </div>
              ) : (
                organizedOrders.cooking.map(order => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>
          
          {/* Column 3: Ready for Service */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'Ready')}
            className="flex-1 min-w-[320px] glass-card border border-primary-500/30 flex flex-col"
            style={{ borderRadius: 'var(--radius-lg)' }}
          >
            <div 
              className="bg-gradient-to-r from-primary-600 to-primary-500 text-white flex items-center"
              style={{ 
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                gap: 'var(--space-xs)'
              }}
            >
              <span style={{ fontSize: 'var(--text-lg)' }}>✅</span>
              <h2 
                className="font-bold"
                style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-tight)' }}
              >
                Ready
              </h2>
              <span 
                className="ml-auto bg-white text-primary-600 font-bold"
                style={{ 
                  padding: 'var(--space-xs) var(--space-sm)',
                  borderRadius: 'var(--radius-xl)',
                  fontSize: 'var(--text-xs)'
                }}
              >
                {organizedOrders.ready.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ padding: 'var(--space-md)' }}>
              {organizedOrders.ready.length === 0 ? (
                <div className="text-center text-slate-500" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-xl)' }}>
                  <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-md)' }}>⏳</div>
                  <p style={{ fontSize: 'var(--text-sm)' }}>No orders ready</p>
                </div>
              ) : (
                organizedOrders.ready.map(order => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>
          
          {/* Column 4: Completed */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'Completed')}
            className="flex-1 min-w-[320px] bg-gray-850 rounded-xl border-2 border-gray-700 flex flex-col"
          >
            <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-3 rounded-t-xl">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">🍽️</span>
                Served
                <span className="ml-auto bg-white text-green-600 px-3 py-1 rounded-full text-sm font-bold">
                  {organizedOrders.completed.length}
                </span>
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {organizedOrders.completed.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <p>No completed orders</p>
                </div>
              ) : (
                organizedOrders.completed.map(order => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Global CSS for animations */}
      <style jsx>{`
        @keyframes flash {
          0%, 100% { background-color: transparent; }
          50% { background-color: rgba(16, 185, 129, 0.2); }
        }
        .bg-gray-850 {
          background-color: #1a1f2e;
        }
        .bg-gray-650 {
          background-color: #4a5568;
        }
      `}</style>
    </div>
  );
};

export default OrderManager;

