import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI, chefAPI, menuAPI } from '../../services/api';
import { GlassCard } from '../shared/PremiumUI';
import ChefSidebar from '../shared/ChefSidebar';
import toast from 'react-hot-toast';

const EnhancedChefDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('orders');
  const [activeOrders, setActiveOrders] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // Modals
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showBatchUsageModal, setShowBatchUsageModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showEstimateModal, setShowEstimateModal] = useState(false);
  
  // Selected data
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  // Form data
  const [usageData, setUsageData] = useState({
    ingredient_id: null,
    quantity_used: 0,
    unit: 'kg',
    used_by: '',
    notes: ''
  });
  
  const [batchUsages, setBatchUsages] = useState([]);
  
  const [messageData, setMessageData] = useState({
    order_id: null,
    sender: '',
    recipient: 'server',
    message: '',
    message_type: 'info'
  });
  
  const [handoverData, setHandoverData] = useState({
    chef_name: '',
    prep_completed: '',
    low_stock_items: '',
    pending_tasks: '',
    incidents: '',
    notes: ''
  });
  
  const [estimateTime, setEstimateTime] = useState(15);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setMessageData(prev => ({ ...prev, sender: user.full_name || user.username || 'Chef' }));
    setHandoverData(prev => ({ ...prev, chef_name: user.full_name || user.username || 'Chef' }));
    setUsageData(prev => ({ ...prev, used_by: user.full_name || user.username || '' }));
    
    fetchActiveOrders();
    fetchIngredients();
    fetchAlerts();
    fetchMenuItems();
    fetchMessages();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchActiveOrders();
      fetchAlerts();
      fetchMessages();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchActiveOrders = async () => {
    try {
      const response = await chefAPI.getActiveOrders();
      setActiveOrders(response.data);
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
  
  const fetchMenuItems = async () => {
    try {
      const response = await menuAPI.getAll();
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };
  
  const fetchMessages = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await chefAPI.getMessages({ 
        recipient: 'chef', 
        unread_only: false 
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Calculate elapsed time and get color
  const getOrderTimeInfo = (order) => {
    const createdAt = new Date(order.created_at);
    const now = new Date();
    const elapsedMinutes = Math.floor((now - createdAt) / 60000);
    
    let color = 'success';
    let bgColor = 'bg-green-500/20';
    let textColor = 'text-green-400';
    
    if (elapsedMinutes > 20) {
      color = 'danger';
      bgColor = 'bg-red-500/20';
      textColor = 'text-red-400';
    } else if (elapsedMinutes > 10) {
      color = 'warning';
      bgColor = 'bg-yellow-500/20';
      textColor = 'text-yellow-400';
    }
    
    return { elapsedMinutes, color, bgColor, textColor };
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await chefAPI.updateOrder(orderId, { status: newStatus });
      toast.success(`Order #${orderId} updated to ${newStatus}`);
      fetchActiveOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };
  
  const handleSetEstimate = async () => {
    try {
      await chefAPI.updateOrder(selectedOrder.id, { 
        estimated_completion_time: estimateTime 
      });
      toast.success(`Estimated time set to ${estimateTime} minutes`);
      setShowEstimateModal(false);
      fetchActiveOrders();
    } catch (error) {
      toast.error('Failed to set estimate');
    }
  };

  const handleToggleAvailability = async (itemId, currentStatus) => {
    try {
      const response = await chefAPI.toggleAvailability(itemId, !currentStatus);
      toast.success(response.data.message);
      fetchMenuItems();
    } catch (error) {
      toast.error('Failed to update item availability');
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
      resetUsageForm();
    } catch (error) {
      console.error('Error recording usage:', error);
      toast.error(error.response?.data?.detail || 'Failed to record usage');
    }
  };
  
  const handleRecordBatchUsage = async () => {
    if (batchUsages.length === 0) {
      toast.error('Add at least one item to record');
      return;
    }
    
    try {
      const response = await chefAPI.recordBatchUsage(batchUsages);
      toast.success(`Recorded ${response.data.recorded_count} usage entries`);
      fetchIngredients();
      fetchAlerts();
      setShowBatchUsageModal(false);
      setBatchUsages([]);
    } catch (error) {
      toast.error('Failed to record batch usage');
    }
  };
  
  const addToBatchUsage = (ingredient) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setBatchUsages([...batchUsages, {
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      quantity_used: 0,
      unit: ingredient.unit,
      used_by: user.full_name || user.username || '',
      notes: ''
    }]);
  };
  
  const updateBatchUsageItem = (index, field, value) => {
    const updated = [...batchUsages];
    updated[index][field] = value;
    setBatchUsages(updated);
  };
  
  const removeBatchUsageItem = (index) => {
    setBatchUsages(batchUsages.filter((_, i) => i !== index));
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await chefAPI.sendMessage(messageData);
      toast.success('Message sent successfully');
      setShowMessageModal(false);
      setMessageData(prev => ({
        ...prev,
        order_id: null,
        message: '',
        message_type: 'info'
      }));
    } catch (error) {
      toast.error('Failed to send message');
    }
  };
  
  const handleCreateHandover = async (e) => {
    e.preventDefault();
    try {
      await chefAPI.createHandover(handoverData);
      toast.success('Shift handover created successfully');
      setShowHandoverModal(false);
      setHandoverData(prev => ({
        ...prev,
        prep_completed: '',
        low_stock_items: '',
        pending_tasks: '',
        incidents: '',
        notes: ''
      }));
    } catch (error) {
      toast.error('Failed to create handover');
    }
  };

  const openUsageModal = (ingredient) => {
    setUsageData({
      ingredient_id: ingredient.id,
      quantity_used: 0,
      unit: ingredient.unit,
      used_by: usageData.used_by,
      notes: ''
    });
    setShowUsageModal(true);
  };
  
  const resetUsageForm = () => {
    setUsageData({
      ingredient_id: null,
      quantity_used: 0,
      unit: 'kg',
      used_by: usageData.used_by,
      notes: ''
    });
  };
  
  const openRecipeModal = (item) => {
    setSelectedRecipe(item);
    setShowRecipeModal(true);
  };
  
  const openMessageModal = (order = null) => {
    if (order) {
      setMessageData(prev => ({ ...prev, order_id: order.id }));
    }
    setShowMessageModal(true);
  };
  
  const openEstimateModal = (order) => {
    setSelectedOrder(order);
    setEstimateTime(order.estimated_completion_time || 15);
    setShowEstimateModal(true);
  };

  return (
    <div className='min-h-screen bg-slate-950 flex'>
      <ChefSidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className='flex-1 lg:ml-72 transition-all duration-300'>
        <div className='p-6 lg:p-8 pt-20 lg:pt-8'>
          
          {/* Stats Row */}
          <div className='grid grid-cols-1 md:grid-cols-4' style={{ gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
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
            
            <GlassCard variant='elevated' className='border-l-4 border-pink-500'>
              <div className='flex justify-between items-start'>
                <div>
                  <p className='text-slate-400' style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>
                    Unread Messages
                  </p>
                  <p className='font-extrabold text-white' style={{ fontSize: 'var(--text-3xl)' }}>
                    {messages.filter(m => !m.is_read).length}
                  </p>
                </div>
                <span style={{ fontSize: 'var(--text-3xl)' }}>💬</span>
              </div>
            </GlassCard>
          </div>

          {/* Active Orders View */}
          {activeView === 'orders' && (
            <div>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='font-bold text-white' style={{ fontSize: 'var(--text-2xl)' }}>
                  Active Orders
                </h2>
                <button
                  onClick={() => setShowHandoverModal(true)}
                  className='bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 px-4 py-2 rounded-lg flex items-center gap-2'
                >
                  <span>📝</span> Shift Handover
                </button>
              </div>
              
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
                  activeOrders.map(order => {
                    const timeInfo = getOrderTimeInfo(order);
                    
                    return (
                      <GlassCard key={order.id} variant='interactive' className={`hover:border-${timeInfo.color}-500 border-l-4 border-${timeInfo.color}-500`}>
                        <div className='flex justify-between items-start' style={{ marginBottom: 'var(--space-md)' }}>
                          <div>
                            <h3 className='font-bold text-white flex items-center gap-2' style={{ fontSize: 'var(--text-lg)' }}>
                              Order #{order.id}
                              {order.priority === 'urgent' && <span className='text-red-500'>🔥</span>}
                              {order.priority === 'high' && <span className='text-orange-500'>⚡</span>}
                            </h3>
                            <p className='text-slate-400' style={{ fontSize: 'var(--text-sm)' }}>
                              Table {order.table_id}
                            </p>
                          </div>
                          
                          <div className='flex flex-col items-end gap-2'>
                            <span 
                              className='font-semibold px-3 py-1 rounded-full'
                              style={{ 
                                fontSize: 'var(--text-xs)',
                                backgroundColor: order.status === 'Pending' ? '#f59e0b' : '#10b981',
                                color: 'white'
                              }}
                            >
                              {order.status}
                            </span>
                            
                            <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${timeInfo.bgColor}`}>
                              <div className={`w-2 h-2 rounded-full ${timeInfo.textColor.replace('text-', 'bg-')}`} />
                              <span className={`text-xs font-semibold ${timeInfo.textColor}`}>
                                {timeInfo.elapsedMinutes}m elapsed
                              </span>
                            </div>
                            
                            {order.estimated_completion_time && (
                              <span className='text-xs text-slate-400'>
                                ETA: {order.estimated_completion_time}min
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Special Notes */}
                        {order.special_notes && (
                          <div className='mb-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg'>
                            <p className='text-yellow-400 text-sm font-semibold flex items-center gap-2'>
                              <span>⚠️</span> Special Request:
                            </p>
                            <p className='text-yellow-200 text-sm mt-1'>{order.special_notes}</p>
                          </div>
                        )}

                        {order.items && order.items.length > 0 && (
                          <div style={{ marginBottom: 'var(--space-md)' }}>
                            <p className='text-slate-300 font-semibold' style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>
                              Items:
                            </p>
                            <div className='flex flex-wrap gap-2'>
                              {order.items.map((item, idx) => (
                                <div key={idx} className='flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700'>
                                  <span className='text-slate-300 text-sm'>
                                    {item.name}
                                  </span>
                                  <span className='bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center'>
                                    {item.quantity || 1}
                                  </span>
                                  <button
                                    onClick={() => openRecipeModal(item)}
                                    className='text-primary-400 hover:text-primary-300 text-xs'
                                  >
                                    📖
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className='flex flex-wrap gap-2'>
                          {order.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'In Progress')}
                                className='flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg transition-all'
                              >
                                🍳 Start Cooking
                              </button>
                              <button
                                onClick={() => openEstimateModal(order)}
                                className='bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg'
                              >
                                ⏱️ Set ETA
                              </button>
                            </>
                          )}
                          {order.status === 'In Progress' && (
                            <>
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'Ready')}
                                className='flex-1 bg-success-600 hover:bg-success-700 text-white font-semibold px-4 py-2 rounded-lg transition-all'
                              >
                                ✓ Mark Ready
                              </button>
                              <button
                                onClick={() => openEstimateModal(order)}
                                className='bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg'
                              >
                                ⏱️ Update ETA
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => openMessageModal(order)}
                            className='bg-pink-600 hover:bg-pink-700 text-white font-semibold px-4 py-2 rounded-lg'
                          >
                            💬 Message
                          </button>
                        </div>
                      </GlassCard>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Inventory View */}
          {activeView === 'inventory' && (
            <div>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='font-bold text-white' style={{ fontSize: 'var(--text-2xl)' }}>
                  Inventory Management
                </h2>
                <button
                  onClick={() => setShowBatchUsageModal(true)}
                  className='bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 px-4 py-2 rounded-lg flex items-center gap-2'
                >
                  <span>📝</span> Batch Usage
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {ingredients.map(ingredient => {
                  const isLow = ingredient.current_stock <= ingredient.minimum_stock;
                  const isCritical = ingredient.current_stock <= ingredient.minimum_stock * 0.5;
                  
                  return (
                    <GlassCard key={ingredient.id} variant='interactive' className={`hover:border-primary-500 ${isCritical ? 'border-l-4 border-red-500' : isLow ? 'border-l-4 border-yellow-500' : ''}`}>
                      <div className='flex justify-between items-center'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2'>
                            <h4 className='font-semibold text-white' style={{ fontSize: 'var(--text-base)' }}>
                              {ingredient.name}
                            </h4>
                            {isCritical && <span className='text-red-500 text-sm font-bold'>CRITICAL!</span>}
                            {isLow && !isCritical && <span className='text-yellow-500 text-sm font-bold'>LOW</span>}
                          </div>
                          <div className='flex items-center gap-3 mt-1'>
                            <p className={`text-sm ${isCritical ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-slate-400'}`}>
                              Stock: {ingredient.current_stock} {ingredient.unit}
                            </p>
                            <p className='text-xs text-slate-500'>
                              Min: {ingredient.minimum_stock} {ingredient.unit}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => openUsageModal(ingredient)}
                          className='bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg transition-all'
                        >
                          Use
                        </button>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Alerts View */}
          {activeView === 'alerts' && (
            <div>
              <h2 className='font-bold text-white' style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-lg)' }}>
                Stock Alerts
              </h2>
              {lowStockAlerts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  {lowStockAlerts.map(item => {
                    const isCritical = item.current_stock <= item.minimum_stock * 0.5;
                    
                    return (
                      <GlassCard key={item.id} variant='elevated' className={`border-l-4 ${isCritical ? 'border-red-500 bg-red-900/20' : 'border-warning-500 bg-warning-900/20'}`}>
                        <h3 className='font-bold text-white flex items-center gap-2' style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-sm)' }}>
                          <span>{isCritical ? '🚨' : '⚠️'}</span> {item.name}
                          {isCritical && <span className='text-xs bg-red-500 text-white px-2 py-1 rounded-full'>CRITICAL</span>}
                        </h3>
                        <div className='text-slate-300' style={{ fontSize: 'var(--text-sm)' }}>
                          <div className='flex justify-between items-center mb-2'>
                            <p>Current Stock:</p>
                            <p className={`font-bold ${isCritical ? 'text-red-400' : 'text-yellow-400'}`}>
                              {item.current_stock} {item.unit}
                            </p>
                          </div>
                          <div className='flex justify-between items-center mb-2'>
                            <p>Minimum Required:</p>
                            <p className='font-semibold text-slate-400'>{item.minimum_stock} {item.unit}</p>
                          </div>
                          <div className='mt-3 pt-3 border-t border-slate-700'>
                            <p className={`font-semibold ${isCritical ? 'text-red-400' : 'text-warning-400'}`}>
                              {isCritical ? '🚨 URGENT: Notify manager immediately!' : '⚠️ Action needed: Request restock'}
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                    );
                  })}
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
          
          {/* Menu Items (86 Feature) View */}
          {activeView === 'menu86' && (
            <div>
              <h2 className='font-bold text-white mb-6' style={{ fontSize: 'var(--text-2xl)' }}>
                Menu Item Availability (86)
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {menuItems.map(item => (
                  <GlassCard key={item.id} variant='interactive'>
                    <div className='flex justify-between items-start mb-3'>
                      <div>
                        <h4 className='font-semibold text-white text-lg'>{item.name}</h4>
                        <p className='text-slate-400 text-sm capitalize'>{item.category}</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${item.is_available ? 'bg-green-400' : 'bg-red-400'}`} />
                    </div>
                    <button
                      onClick={() => handleToggleAvailability(item.id, item.is_available)}
                      className={`w-full font-semibold px-4 py-2 rounded-lg transition-all ${
                        item.is_available 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {item.is_available ? '🚫 Mark 86 (Unavailable)' : '✓ Mark Available'}
                    </button>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
          
          {/* Messages View */}
          {activeView === 'messages' && (
            <div>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='font-bold text-white' style={{ fontSize: 'var(--text-2xl)' }}>
                  Kitchen Messages
                </h2>
                <button
                  onClick={() => openMessageModal()}
                  className='bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 px-4 py-2 rounded-lg flex items-center gap-2'
                >
                  <span>✉️</span> New Message
                </button>
              </div>
              
              {messages.length > 0 ? (
                <div className='space-y-3'>
                  {messages.map(msg => (
                    <GlassCard key={msg.id} variant='interactive' className={`${!msg.is_read ? 'border-l-4 border-pink-500' : ''}`}>
                      <div className='flex justify-between items-start mb-2'>
                        <div>
                          <p className='text-white font-semibold'>
                            From: {msg.sender} → To: {msg.recipient}
                            {!msg.is_read && <span className='ml-2 text-xs bg-pink-500 text-white px-2 py-1 rounded-full'>NEW</span>}
                          </p>
                          <p className='text-xs text-slate-400'>
                            {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          msg.message_type === 'urgent' ? 'bg-red-500 text-white' :
                          msg.message_type === 'warning' ? 'bg-yellow-500 text-black' :
                          'bg-blue-500 text-white'
                        }`}>
                          {msg.message_type.toUpperCase()}
                        </span>
                      </div>
                      <p className='text-slate-300'>{msg.message}</p>
                      {msg.order_id && (
                        <p className='text-xs text-slate-400 mt-2'>
                          Related to Order #{msg.order_id}
                        </p>
                      )}
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <GlassCard variant='elevated'>
                  <div className='text-center py-8'>
                    <span className='text-6xl'>📭</span>
                    <p className='text-slate-400 mt-3'>No messages yet</p>
                  </div>
                </GlassCard>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      
      {/* Usage Modal */}
      {showUsageModal && (
        <div className='fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4'>
          <GlassCard variant='elevated' className='max-w-lg w-full'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='font-bold text-white text-2xl'>Record Usage</h2>
              <button onClick={() => setShowUsageModal(false)} className='text-slate-400 hover:text-white text-xl'>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleRecordUsage} className='space-y-4'>
              <div>
                <label className='block text-slate-300 font-semibold text-sm mb-2'>
                  Quantity Used *
                </label>
                <input
                  type='number'
                  step='0.01'
                  value={usageData.quantity_used}
                  onChange={(e) => setUsageData({ ...usageData, quantity_used: parseFloat(e.target.value) })}
                  required
                  className='w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500 px-4 py-2 rounded-lg'
                />
              </div>
              
              <div>
                <label className='block text-slate-300 font-semibold text-sm mb-2'>Notes</label>
                <textarea
                  value={usageData.notes}
                  onChange={(e) => setUsageData({ ...usageData, notes: e.target.value })}
                  rows={3}
                  placeholder='e.g., Used for Order #123'
                  className='w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500 px-4 py-2 rounded-lg'
                />
              </div>
              
              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={() => setShowUsageModal(false)}
                  className='flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg'
                >
                  Record Usage
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
      
      {/* Batch Usage Modal */}
      {showBatchUsageModal && (
        <div className='fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4'>
          <GlassCard variant='elevated' className='max-w-3xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='font-bold text-white text-2xl'>Batch Usage Recording</h2>
              <button onClick={() => setShowBatchUsageModal(false)} className='text-slate-400 hover:text-white text-xl'>
                ✕
              </button>
            </div>
            
            <div className='mb-4'>
              <p className='text-slate-300 mb-3'>Select ingredients to add:</p>
              <div className='grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-900/50 rounded-lg'>
                {ingredients.map(ing => (
                  <button
                    key={ing.id}
                    onClick={() => addToBatchUsage(ing)}
                    className='bg-slate-800 hover:bg-slate-700 text-white text-sm px-3 py-2 rounded-lg text-left'
                  >
                    {ing.name}
                  </button>
                ))}
              </div>
            </div>
            
            {batchUsages.length > 0 && (
              <div className='space-y-3 mb-4'>
                <h3 className='text-white font-semibold'>Items to Record:</h3>
                {batchUsages.map((usage, idx) => (
                  <div key={idx} className='bg-slate-800/50 p-3 rounded-lg'>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='text-white font-semibold'>{usage.ingredient_name}</span>
                      <button
                        onClick={() => removeBatchUsageItem(idx)}
                        className='text-red-400 hover:text-red-300 text-sm'
                      >
                        Remove
                      </button>
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                      <input
                        type='number'
                        step='0.01'
                        placeholder='Quantity'
                        value={usage.quantity_used}
                        onChange={(e) => updateBatchUsageItem(idx, 'quantity_used', parseFloat(e.target.value))}
                        className='bg-slate-700 text-white border border-slate-600 px-3 py-2 rounded-lg text-sm'
                      />
                      <input
                        type='text'
                        placeholder='Notes (optional)'
                        value={usage.notes}
                        onChange={(e) => updateBatchUsageItem(idx, 'notes', e.target.value)}
                        className='bg-slate-700 text-white border border-slate-600 px-3 py-2 rounded-lg text-sm'
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className='flex gap-3'>
              <button
                onClick={() => setShowBatchUsageModal(false)}
                className='flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg'
              >
                Cancel
              </button>
              <button
                onClick={handleRecordBatchUsage}
                disabled={batchUsages.length === 0}
                className='flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Record All ({batchUsages.length})
              </button>
            </div>
          </GlassCard>
        </div>
      )}
      
      {/* Message Modal */}
      {showMessageModal && (
        <div className='fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4'>
          <GlassCard variant='elevated' className='max-w-lg w-full'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='font-bold text-white text-2xl'>Send Message</h2>
              <button onClick={() => setShowMessageModal(false)} className='text-slate-400 hover:text-white text-xl'>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSendMessage} className='space-y-4'>
              <div>
                <label className='block text-slate-300 font-semibold text-sm mb-2'>Recipient *</label>
                <select
                  value={messageData.recipient}
                  onChange={(e) => setMessageData({ ...messageData, recipient: e.target.value })}
                  className='w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500 px-4 py-2 rounded-lg'
                >
                  <option value='server'>Server/Waiter</option>
                  <option value='manager'>Manager</option>
                  <option value='chef'>Another Chef</option>
                </select>
              </div>
              
              <div>
                <label className='block text-slate-300 font-semibold text-sm mb-2'>Message Type *</label>
                <select
                  value={messageData.message_type}
                  onChange={(e) => setMessageData({ ...messageData, message_type: e.target.value })}
                  className='w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500 px-4 py-2 rounded-lg'
                >
                  <option value='info'>Info</option>
                  <option value='warning'>Warning</option>
                  <option value='urgent'>Urgent</option>
                </select>
              </div>
              
              <div>
                <label className='block text-slate-300 font-semibold text-sm mb-2'>Message *</label>
                <textarea
                  value={messageData.message}
                  onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                  required
                  rows={4}
                  placeholder='e.g., Need more time for Order #45, ingredient issue'
                  className='w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500 px-4 py-2 rounded-lg'
                />
              </div>
              
              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={() => setShowMessageModal(false)}
                  className='flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg'
                >
                  Send Message
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
      
      {/* Handover Modal */}
      {showHandoverModal && (
        <div className='fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4'>
          <GlassCard variant='elevated' className='max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='font-bold text-white text-2xl'>Shift Handover Notes</h2>
              <button onClick={() => setShowHandoverModal(false)} className='text-slate-400 hover:text-white text-xl'>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateHandover} className='space-y-4'>
              <div>
                <label className='block text-slate-300 font-semibold text-sm mb-2'>Prep Completed</label>
                <textarea
                  value={handoverData.prep_completed}
                  onChange={(e) => setHandoverData({ ...handoverData, prep_completed: e.target.value })}
                  rows={3}
                  placeholder='e.g., Chopped 5kg onions, marinated chicken'
                  className='w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500 px-4 py-2 rounded-lg'
                />
              </div>
              
              <div>
                <label className='block text-slate-300 font-semibold text-sm mb-2'>Low Stock Items</label>
                <textarea
                  value={handoverData.low_stock_items}
                  onChange={(e) => setHandoverData({ ...handoverData, low_stock_items: e.target.value })}
                  rows={2}
                  placeholder='e.g., Tomatoes, cheese'
                  className='w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500 px-4 py-2 rounded-lg'
                />
              </div>
              
              <div>
                <label className='block text-slate-300 font-semibold text-sm mb-2'>Pending Tasks</label>
                <textarea
                  value={handoverData.pending_tasks}
                  onChange={(e) => setHandoverData({ ...handoverData, pending_tasks: e.target.value })}
                  rows={2}
                  placeholder='e.g., Clean fryer, prep desserts'
                  className='w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500 px-4 py-2 rounded-lg'
                />
              </div>
              
              <div>
                <label className='block text-slate-300 font-semibold text-sm mb-2'>Incidents / Issues</label>
                <textarea
                  value={handoverData.incidents}
                  onChange={(e) => setHandoverData({ ...handoverData, incidents: e.target.value })}
                  rows={2}
                  placeholder='e.g., Oven acting up, need maintenance'
                  className='w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500 px-4 py-2 rounded-lg'
                />
              </div>
              
              <div>
                <label className='block text-slate-300 font-semibold text-sm mb-2'>Additional Notes</label>
                <textarea
                  value={handoverData.notes}
                  onChange={(e) => setHandoverData({ ...handoverData, notes: e.target.value })}
                  rows={3}
                  placeholder='Any other information for the next shift'
                  className='w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500 px-4 py-2 rounded-lg'
                />
              </div>
              
              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={() => setShowHandoverModal(false)}
                  className='flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg'
                >
                  Create Handover
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
      
      {/* Recipe Modal */}
      {showRecipeModal && selectedRecipe && (
        <div className='fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4'>
          <GlassCard variant='elevated' className='max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='font-bold text-white text-2xl'>{selectedRecipe.name}</h2>
              <button onClick={() => setShowRecipeModal(false)} className='text-slate-400 hover:text-white text-xl'>
                ✕
              </button>
            </div>
            
            <div className='space-y-4'>
              {selectedRecipe.description && (
                <div>
                  <h3 className='text-white font-semibold mb-2'>Description</h3>
                  <p className='text-slate-300'>{selectedRecipe.description}</p>
                </div>
              )}
              
              <div className='grid grid-cols-2 gap-4'>
                {selectedRecipe.prep_time && (
                  <div className='bg-slate-800/50 p-3 rounded-lg'>
                    <p className='text-slate-400 text-sm'>Prep Time</p>
                    <p className='text-white font-semibold text-lg'>{selectedRecipe.prep_time} min</p>
                  </div>
                )}
                {selectedRecipe.cook_time && (
                  <div className='bg-slate-800/50 p-3 rounded-lg'>
                    <p className='text-slate-400 text-sm'>Cook Time</p>
                    <p className='text-white font-semibold text-lg'>{selectedRecipe.cook_time} min</p>
                  </div>
                )}
              </div>
              
              {selectedRecipe.diet && (
                <div>
                  <h3 className='text-white font-semibold mb-2'>Dietary Info</h3>
                  <span className='bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm'>
                    {selectedRecipe.diet}
                  </span>
                </div>
              )}
              
              {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
                <div>
                  <h3 className='text-white font-semibold mb-2'>Ingredients Required</h3>
                  <div className='bg-slate-800/50 p-3 rounded-lg space-y-2'>
                    {selectedRecipe.ingredients.map((ing, idx) => (
                      <div key={idx} className='flex justify-between items-center'>
                        <span className='text-slate-300'>{ing.name}</span>
                        <span className='text-slate-400 text-sm'>
                          Stock: {ing.current_stock} {ing.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setShowRecipeModal(false)}
                className='w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-4 py-3 rounded-lg'
              >
                Close
              </button>
            </div>
          </GlassCard>
        </div>
      )}
      
      {/* Estimate Time Modal */}
      {showEstimateModal && selectedOrder && (
        <div className='fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4'>
          <GlassCard variant='elevated' className='max-w-md w-full'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='font-bold text-white text-xl'>Set Estimated Time</h2>
              <button onClick={() => setShowEstimateModal(false)} className='text-slate-400 hover:text-white text-xl'>
                ✕
              </button>
            </div>
            
            <div className='mb-6'>
              <p className='text-slate-300 mb-4'>Order #{selectedOrder.id} - Estimated completion time:</p>
              <div className='flex items-center gap-3'>
                <input
                  type='range'
                  min='5'
                  max='60'
                  step='5'
                  value={estimateTime}
                  onChange={(e) => setEstimateTime(parseInt(e.target.value))}
                  className='flex-1'
                />
                <span className='text-white font-bold text-2xl w-20 text-center'>{estimateTime} min</span>
              </div>
            </div>
            
            <div className='flex gap-3'>
              <button
                onClick={() => setShowEstimateModal(false)}
                className='flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg'
              >
                Cancel
              </button>
              <button
                onClick={handleSetEstimate}
                className='flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg'
              >
                Set Estimate
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default EnhancedChefDashboard;
