import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI, authAPI } from '../../services/api';
import { GlassCard } from '../shared/PremiumUI';
import ChefSidebar from '../shared/ChefSidebar';
import toast from 'react-hot-toast';

const ChefDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('orders');
  const [activeOrders, setActiveOrders] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [usageData, setUsageData] = useState({
    ingredient_id: null,
    quantity_used: 0,
    unit: 'kg',
    used_by: '',
    notes: ''
  });

  useEffect(() => {
    fetchActiveOrders();
    fetchIngredients();
    fetchAlerts();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchActiveOrders();
      fetchAlerts();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchActiveOrders = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/orders/');
      const data = await response.json();
      // Filter for orders that are pending or in progress
      const active = data.filter(order => 
        order.status === 'Pending' || order.status === 'In Progress'
      );
      setActiveOrders(active);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await inventoryAPI.getAllIngredients();
      setIngredients(response.data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await inventoryAPI.getLowStockAlerts();
      setLowStockAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetch(`http://localhost:8000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      toast.success(`Order #${orderId} updated to ${newStatus}`);
      fetchActiveOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const handleRecordUsage = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.recordUsage(usageData);
      toast.success('Usage recorded successfully!');
      fetchIngredients();
      fetchAlerts();
      setShowUsageModal(false);
      setUsageData({
        ingredient_id: null,
        quantity_used: 0,
        unit: 'kg',
        used_by: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error recording usage:', error);
      toast.error(error.response?.data?.detail || 'Failed to record usage');
    }
  };

  const openUsageModal = (ingredient) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUsageData({
      ingredient_id: ingredient.id,
      quantity_used: 0,
      unit: ingredient.unit,
      used_by: user.full_name || user.username || '',
      notes: ''
    });
    setShowUsageModal(true);
  };

  return (
    <div className='min-h-screen bg-slate-950 flex'>
      <ChefSidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className='flex-1 lg:ml-72 transition-all duration-300'>
        <div className='p-6 lg:p-8 pt-20 lg:pt-8'>
          {activeView === 'orders' && (
            <div>
              {/* Stats Row */}
              <div className='grid grid-cols-1 md:grid-cols-3' style={{ gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                <GlassCard variant='elevated' className='border-l-4 border-primary-500'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <p className='text-slate-400' style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>
                        Active Orders
                      </p>
                      <p className='font-extrabold text-white' style={{ fontSize: 'var(--text-3xl)' }}>
                        {activeOrders.length}
                      </p>
                    </div>
                    <span style={{ fontSize: 'var(--text-3xl)' }}>🍳</span>
                  </div>
                </GlassCard>

                <GlassCard variant='elevated' className='border-l-4 border-warning-500'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <p className='text-slate-400' style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>
                        Low Stock Items
                      </p>
                      <p className='font-extrabold text-white' style={{ fontSize: 'var(--text-3xl)' }}>
                        {lowStockAlerts.length}
                      </p>
                    </div>
                    <span style={{ fontSize: 'var(--text-3xl)' }}>⚠️</span>
                  </div>
                </GlassCard>

                <GlassCard variant='elevated' className='border-l-4 border-success-500'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <p className='text-slate-400' style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>
                        Total Ingredients
                      </p>
                      <p className='font-extrabold text-white' style={{ fontSize: 'var(--text-3xl)' }}>
                        {ingredients.length}
                      </p>
                    </div>
                    <span style={{ fontSize: 'var(--text-3xl)' }}>📦</span>
                  </div>
                </GlassCard>
              </div>

              <div>
                <h2 className='font-bold text-white' style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-lg)' }}>
                  Active Orders
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  {activeOrders.length === 0 ? (
                    <GlassCard variant='elevated'>
                      <div className='text-center' style={{ padding: 'var(--space-xl)' }}>
                        <span style={{ fontSize: '64px' }}>✅</span>
                        <p className='text-slate-400' style={{ fontSize: 'var(--text-lg)', marginTop: 'var(--space-md)' }}>
                          No active orders
                        </p>
                      </div>
                    </GlassCard>
                  ) : (
                    activeOrders.map(order => (
                  <GlassCard key={order.id} variant='interactive' className='hover:border-primary-500'>
                    <div className='flex justify-between items-start' style={{ marginBottom: 'var(--space-md)' }}>
                      <div>
                        <h3 className='font-bold text-white' style={{ fontSize: 'var(--text-lg)' }}>
                          Order #{order.id}
                        </h3>
                        <p className='text-slate-400' style={{ fontSize: 'var(--text-sm)' }}>
                          Table {order.table_id}
                        </p>
                      </div>
                      <span 
                        className='font-semibold'
                        style={{ 
                          padding: 'var(--space-xs)', 
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--text-xs)',
                          backgroundColor: order.status === 'Pending' ? '#f59e0b' : '#10b981',
                          color: 'white'
                        }}
                      >
                        {order.status}
                      </span>
                    </div>

                    {order.order_items && order.order_items.length > 0 && (
                      <div style={{ marginBottom: 'var(--space-md)' }}>
                        <p className='text-slate-300 font-semibold' style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>
                          Items:
                        </p>
                        {order.order_items.map((item, idx) => (
                          <div key={idx} className='text-slate-400' style={{ fontSize: 'var(--text-sm)' }}>
                            • {item.menu_item_name} x{item.quantity}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className='flex' style={{ gap: 'var(--space-xs)' }}>
                      {order.status === 'Pending' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'In Progress')}
                          className='flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold'
                          style={{
                            padding: 'var(--space-xs)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--text-sm)',
                            transition: 'all 0.382s'
                          }}
                        >
                          Start Cooking
                        </button>
                      )}
                      {order.status === 'In Progress' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'Ready')}
                          className='flex-1 bg-success-600 hover:bg-success-700 text-white font-semibold'
                          style={{
                            padding: 'var(--space-xs)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--text-sm)',
                            transition: 'all 0.382s'
                          }}
                        >
                          Mark Ready
                        </button>
                      )}
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          </div>
            </div>
          )}

          {activeView === 'inventory' && (
            <div>
            <h2 className='font-bold text-white' style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-lg)' }}>
              Inventory Management
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {ingredients.map(ingredient => (
                <GlassCard key={ingredient.id} variant='interactive' className='hover:border-primary-500'>
                  <div className='flex justify-between items-center'>
                    <div>
                      <h4 className='font-semibold text-white' style={{ fontSize: 'var(--text-base)' }}>
                        {ingredient.name}
                      </h4>
                      <p className='text-slate-400' style={{ fontSize: 'var(--text-sm)' }}>
                        Stock: {ingredient.current_stock} {ingredient.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => openUsageModal(ingredient)}
                      className='bg-primary-600 hover:bg-primary-700 text-white font-semibold'
                      style={{
                        padding: 'var(--space-xs) var(--space-sm)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--text-xs)',
                        transition: 'all 0.382s'
                      }}
                    >
                      Use
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
            </div>
          )}

          {activeView === 'alerts' && (
            <div>
            <h2 className='font-bold text-white' style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-lg)' }}>
              Stock Alerts
            </h2>
            {lowStockAlerts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {lowStockAlerts.map(item => (
                  <GlassCard key={item.id} variant='elevated' className='border-l-4 border-warning-500 bg-warning-900/20'>
                    <h3 className='font-bold text-white flex items-center' style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-sm)', gap: 'var(--space-xs)' }}>
                      <span>⚠️</span> {item.name}
                    </h3>
                    <div className='text-slate-300' style={{ fontSize: 'var(--text-sm)' }}>
                      <p>Current Stock: {item.current_stock} {item.unit}</p>
                      <p>Minimum Required: {item.minimum_stock} {item.unit}</p>
                      <p className='text-warning-400 font-semibold mt-2'>
                        Action needed: Restock required!
                      </p>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard variant='elevated'>
                <div className='text-center' style={{ padding: 'var(--space-xl)' }}>
                  <span style={{ fontSize: '64px' }}>✅</span>
                  <p className='text-slate-400' style={{ fontSize: 'var(--text-lg)', marginTop: 'var(--space-md)' }}>
                    All stock levels are good!
                  </p>
                </div>
              </GlassCard>
            )}
            </div>
          )}
        </div>
      </main>

      {/* Usage Modal */}
      {showUsageModal && (
        <div className='fixed inset-0 bg-black/75 flex items-center justify-center z-50' style={{ padding: 'var(--space-lg)' }}>
          <GlassCard variant='elevated' className='max-w-lg w-full'>
            <div className='flex justify-between items-center' style={{ marginBottom: 'var(--space-lg)' }}>
              <h2 className='font-bold text-white' style={{ fontSize: 'var(--text-2xl)' }}>
                Record Usage
              </h2>
              <button
                onClick={() => setShowUsageModal(false)}
                className='text-slate-400 hover:text-white'
                style={{ fontSize: 'var(--text-xl)' }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleRecordUsage} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div>
                <label className='block text-slate-300 font-semibold' style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>
                  Quantity Used *
                </label>
                <input
                  type='number'
                  step='0.01'
                  value={usageData.quantity_used}
                  onChange={(e) => setUsageData({ ...usageData, quantity_used: parseFloat(e.target.value) })}
                  required
                  className='w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500'
                  style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)' }}
                />
              </div>
              
              <div>
                <label className='block text-slate-300 font-semibold' style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>
                  Notes
                </label>
                <textarea
                  value={usageData.notes}
                  onChange={(e) => setUsageData({ ...usageData, notes: e.target.value })}
                  rows={3}
                  placeholder='e.g., Used for Order #123'
                  className='w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500'
                  style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)' }}
                />
              </div>
              
              <div className='flex' style={{ gap: 'var(--space-sm)' }}>
                <button
                  type='button'
                  onClick={() => setShowUsageModal(false)}
                  className='flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold'
                  style={{
                    padding: 'var(--space-sm)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-base)',
                    transition: 'all 0.382s'
                  }}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='flex-1 gradient-primary text-white font-semibold shadow-primary-glow'
                  style={{
                    padding: 'var(--space-sm)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-base)',
                    transition: 'all 0.382s'
                  }}
                >
                  Record Usage
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default ChefDashboard;
