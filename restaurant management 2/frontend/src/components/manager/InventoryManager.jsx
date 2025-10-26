import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../../services/api';
import { GlassCard, PremiumButton } from '../shared/PremiumUI';
import toast from 'react-hot-toast';

const InventoryManager = () => {
  const [ingredients, setIngredients] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [filterView, setFilterView] = useState('all'); // all, low-stock, expiring
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    unit: 'kg',
    current_stock: 0,
    minimum_stock: 5,
    expiry_date: '',
    cost_per_unit: 0,
    supplier: ''
  });
  const [usageData, setUsageData] = useState({
    ingredient_id: null,
    quantity_used: 0,
    unit: 'kg',
    used_by: '',
    notes: ''
  });

  useEffect(() => {
    fetchIngredients();
    fetchAlerts();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await inventoryAPI.getAllIngredients();
      setIngredients(response.data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      toast.error('Failed to load ingredients');
    }
  };

  const fetchAlerts = async () => {
    try {
      const [lowStock, expiring] = await Promise.all([
        inventoryAPI.getLowStockAlerts(),
        inventoryAPI.getExpiringIngredients(7)
      ]);
      setLowStockAlerts(lowStock.data);
      setExpiringItems(expiring.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.createIngredient(formData);
      toast.success('Ingredient added successfully!');
      fetchIngredients();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding ingredient:', error);
      toast.error('Failed to add ingredient');
    }
  };

  const handleUpdateStock = async (id, newStock) => {
    try {
      await inventoryAPI.updateIngredient(id, { current_stock: parseFloat(newStock) });
      toast.success('Stock updated!');
      fetchIngredients();
      fetchAlerts();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
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

  const handleDownloadGroceryList = async () => {
    try {
      const response = await inventoryAPI.generateGroceryList();
      const list = response.data;
      
      // Create downloadable text
      let content = `GROCERY SHOPPING LIST\n`;
      content += `Generated: ${new Date().toLocaleString()}\n\n`;
      content += `Total Items: ${list.total_items}\n`;
      content += `Estimated Cost: ₹${list.total_estimated_cost?.toFixed(2) || 'N/A'}\n\n`;
      content += `ITEMS:\n${'-'.repeat(60)}\n`;
      
      list.items.forEach(item => {
        content += `${item.name}\n`;
        content += `  Current Stock: ${item.current_stock} ${item.unit}\n`;
        content += `  Needed: ${item.needed_quantity.toFixed(2)} ${item.unit}\n`;
        if (item.estimated_cost) {
          content += `  Cost: ₹${item.estimated_cost.toFixed(2)}\n`;
        }
        if (item.supplier) {
          content += `  Supplier: ${item.supplier}\n`;
        }
        content += `\n`;
      });
      
      // Download as text file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grocery-list-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      
      toast.success('Grocery list downloaded!');
    } catch (error) {
      console.error('Error generating grocery list:', error);
      toast.error('Failed to generate grocery list');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Vegetables',
      unit: 'kg',
      current_stock: 0,
      minimum_stock: 5,
      expiry_date: '',
      cost_per_unit: 0,
      supplier: ''
    });
  };

  const openUsageModal = (ingredient) => {
    setSelectedIngredient(ingredient);
    setUsageData({
      ...usageData,
      ingredient_id: ingredient.id,
      unit: ingredient.unit
    });
    setShowUsageModal(true);
  };

  const filteredIngredients = ingredients
    .filter(item => {
      if (filterView === 'low-stock') {
        return item.current_stock <= item.minimum_stock;
      }
      if (filterView === 'expiring') {
        return expiringItems.some(exp => exp.id === item.id);
      }
      return true;
    })
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getStockStatus = (ingredient) => {
    if (ingredient.current_stock === 0) return { label: 'Out of Stock', color: 'danger' };
    if (ingredient.current_stock <= ingredient.minimum_stock) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  };

  const isExpiringSoon = (ingredient) => {
    return expiringItems.some(item => item.id === ingredient.id);
  };

  return (
    <div className='w-full'>
      {/* Header */}
      <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-700/30 pb-6 mb-8'>
        <div>
          <h1 className='text-4xl font-extrabold text-white mb-2 tracking-tight'>
            Inventory Management
          </h1>
          <p className='text-slate-400 font-medium text-lg'>
            Track ingredients, manage stock, and monitor expiry dates
          </p>
        </div>
        
        <div className='flex flex-wrap items-center gap-3 mt-4 lg:mt-0'>
          <PremiumButton
            onClick={handleDownloadGroceryList}
            variant="secondary"
            size="base"
          >
            📋 Download Grocery List
          </PremiumButton>
          <PremiumButton
            onClick={() => setShowAddModal(true)}
            variant="primary"
            size="base"
          >
            + Add Ingredient
          </PremiumButton>
        </div>
      </div>

      {/* Alerts Section */}
      {(lowStockAlerts.length > 0 || expiringItems.length > 0) && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6 mb-8'>
          {lowStockAlerts.length > 0 && (
            <GlassCard variant="elevated" className='border-l-4 border-warning-500 bg-warning-900/20'>
              <div className='flex items-center' style={{ gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                <span style={{ fontSize: 'var(--text-xl)' }}>⚠️</span>
                <h3 className='font-bold text-white' style={{ fontSize: 'var(--text-lg)' }}>
                  Low Stock Alert
                </h3>
                <span className='ml-auto bg-warning-500 text-white font-bold' style={{ padding: 'var(--space-xs)', borderRadius: 'var(--radius-xl)', fontSize: 'var(--text-xs)' }}>
                  {lowStockAlerts.length}
                </span>
              </div>
              <p className='text-slate-300' style={{ fontSize: 'var(--text-sm)' }}>
                {lowStockAlerts.slice(0, 3).map(item => item.name).join(', ')}
                {lowStockAlerts.length > 3 && ` and ${lowStockAlerts.length - 3} more...`}
              </p>
            </GlassCard>
          )}
          
          {expiringItems.length > 0 && (
            <GlassCard variant="elevated" className='border-l-4 border-danger-500 bg-danger-900/20'>
              <div className='flex items-center' style={{ gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                <span style={{ fontSize: 'var(--text-xl)' }}>⏰</span>
                <h3 className='font-bold text-white' style={{ fontSize: 'var(--text-lg)' }}>
                  Expiring Soon
                </h3>
                <span className='ml-auto bg-danger-500 text-white font-bold' style={{ padding: 'var(--space-xs)', borderRadius: 'var(--radius-xl)', fontSize: 'var(--text-xs)' }}>
                  {expiringItems.length}
                </span>
              </div>
              <p className='text-slate-300' style={{ fontSize: 'var(--text-sm)' }}>
                {expiringItems.slice(0, 3).map(item => item.name).join(', ')}
                {expiringItems.length > 3 && ` and ${expiringItems.length - 3} more...`}
              </p>
            </GlassCard>
          )}
        </div>
      )}

      {/* Filters and Search */}
      <div 
        className='glass-card flex flex-col md:flex-row justify-between items-start md:items-center'
        style={{ 
          padding: 'var(--space-md)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-lg)',
          gap: 'var(--space-md)'
        }}
      >
        <div className='flex' style={{ gap: 'var(--space-xs)' }}>
          {['all', 'low-stock', 'expiring'].map(view => (
            <button
              key={view}
              onClick={() => setFilterView(view)}
              className={`font-semibold transition-all ${
                filterView === view
                  ? 'gradient-primary text-white shadow-primary-glow'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
              style={{
                padding: 'var(--space-xs) var(--space-md)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)'
              }}
            >
              {view === 'all' ? 'All' : view === 'low-stock' ? 'Low Stock' : 'Expiring Soon'}
            </button>
          ))}
        </div>
        
        <div className='relative'>
          <input
            type='text'
            placeholder='Search ingredients...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500 w-64'
            style={{
              padding: 'var(--space-xs) var(--space-md) var(--space-xs) 42px',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-sm)'
            }}
          />
          <svg 
            className='text-slate-400 absolute top-2.5'
            style={{ width: '21px', height: '21px', left: 'var(--space-sm)' }}
            fill='none' 
            stroke='currentColor' 
            viewBox='0 0 24 24'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
          </svg>
        </div>
      </div>

      {/* Ingredients Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6'>
        {filteredIngredients.map(ingredient => {
          const status = getStockStatus(ingredient);
          const expiring = isExpiringSoon(ingredient);
          
          return (
            <GlassCard 
              key={ingredient.id} 
              variant='interactive'
              className='hover:border-primary-500'
              style={{ borderRadius: 'var(--radius-lg)' }}
            >
              <div className='flex justify-between items-start' style={{ marginBottom: 'var(--space-md)' }}>
                <div>
                  <h3 className='font-bold text-white' style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-xs)' }}>
                    {ingredient.name}
                  </h3>
                  {ingredient.category && (
                    <span 
                      className='bg-slate-800 text-slate-300 font-medium'
                      style={{ 
                        padding: 'var(--space-xs)', 
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--text-xs)'
                      }}
                    >
                      {ingredient.category}
                    </span>
                  )}
                </div>
                
                <div className='flex flex-col' style={{ gap: 'var(--space-xs)' }}>
                  <span 
                    className={`text-white font-bold text-center`}
                    style={{ 
                      padding: 'var(--space-xs)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-xs)',
                      backgroundColor: status.color === 'danger' ? '#dc2626' : 
                                       status.color === 'warning' ? '#f59e0b' : '#10b981'
                    }}
                  >
                    {status.label}
                  </span>
                  {expiring && (
                    <span 
                      className='bg-danger-500 text-white font-bold text-center'
                      style={{ 
                        padding: 'var(--space-xs)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--text-xs)'
                      }}
                    >
                      ⏰ Expiring
                    </span>
                  )}
                </div>
              </div>
              
              <div className='text-slate-300' style={{ marginBottom: 'var(--space-md)' }}>
                <div className='flex justify-between' style={{ marginBottom: 'var(--space-xs)' }}>
                  <span style={{ fontSize: 'var(--text-sm)' }}>Current Stock:</span>
                  <span className='font-bold text-white' style={{ fontSize: 'var(--text-base)' }}>
                    {ingredient.current_stock} {ingredient.unit}
                  </span>
                </div>
                <div className='flex justify-between' style={{ marginBottom: 'var(--space-xs)' }}>
                  <span style={{ fontSize: 'var(--text-sm)' }}>Minimum:</span>
                  <span style={{ fontSize: 'var(--text-sm)' }}>{ingredient.minimum_stock} {ingredient.unit}</span>
                </div>
                {ingredient.expiry_date && (
                  <div className='flex justify-between'>
                    <span style={{ fontSize: 'var(--text-sm)' }}>Expiry:</span>
                    <span style={{ fontSize: 'var(--text-sm)' }}>{new Date(ingredient.expiry_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className='flex' style={{ gap: 'var(--space-xs)' }}>
                <button
                  onClick={() => openUsageModal(ingredient)}
                  className='flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold'
                  style={{
                    padding: 'var(--space-xs)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    transition: 'all 0.382s'
                  }}
                >
                  Mark Used
                </button>
                <button
                  onClick={() => {
                    const newStock = prompt(`Enter new stock for ${ingredient.name}:`, ingredient.current_stock);
                    if (newStock !== null) {
                      handleUpdateStock(ingredient.id, newStock);
                    }
                  }}
                  className='flex-1 bg-success-600 hover:bg-success-700 text-white font-semibold'
                  style={{
                    padding: 'var(--space-xs)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    transition: 'all 0.382s'
                  }}
                >
                  Restock
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Add Ingredient Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black/75 flex items-center justify-center z-50' style={{ padding: 'var(--space-lg)' }}>
          <GlassCard variant='elevated' className='max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center' style={{ marginBottom: 'var(--space-lg)' }}>
              <h2 className='font-bold text-white' style={{ fontSize: 'var(--text-2xl)' }}>
                Add New Ingredient
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className='text-slate-400 hover:text-white'
                style={{ fontSize: 'var(--text-xl)' }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddIngredient} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div>
                <label className='block text-slate-300 font-semibold' style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>
                  Ingredient Name *
                </label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className='w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500'
                  style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)' }}
                />
              </div>
              
              <div className='grid grid-cols-2' style={{ gap: 'var(--space-md)' }}>
                <div>
                  <label className='block text-slate-300 font-semibold' style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className='w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500'
                    style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)' }}
                  >
                    <option>Vegetables</option>
                    <option>Fruits</option>
                    <option>Dairy</option>
                    <option>Meat</option>
                    <option>Spices</option>
                    <option>Grains</option>
                    <option>Other</option>
                  </select>
                </div>
                
                <div>
                  <label className='block text-slate-300 font-semibold' style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className='w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500'
                    style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)' }}
                  >
                    <option>kg</option>
                    <option>liter</option>
                    <option>piece</option>
                    <option>gram</option>
                    <option>dozen</option>
                  </select>
                </div>
              </div>
              
              <div className='grid grid-cols-2' style={{ gap: 'var(--space-md)' }}>
                <div>
                  <label className='block text-slate-300 font-semibold' style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>
                    Current Stock
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    value={formData.current_stock}
                    onChange={(e) => setFormData({ ...formData, current_stock: parseFloat(e.target.value) })}
                    className='w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500'
                    style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)' }}
                  />
                </div>
                
                <div>
                  <label className='block text-slate-300 font-semibold' style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>
                    Minimum Stock
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    value={formData.minimum_stock}
                    onChange={(e) => setFormData({ ...formData, minimum_stock: parseFloat(e.target.value) })}
                    className='w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500'
                    style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)' }}
                  />
                </div>
              </div>
              
              <div className='grid grid-cols-2' style={{ gap: 'var(--space-md)' }}>
                <div>
                  <label className='block text-slate-300 font-semibold' style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>
                    Expiry Date
                  </label>
                  <input
                    type='date'
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className='w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500'
                    style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)' }}
                  />
                </div>
                
                <div>
                  <label className='block text-slate-300 font-semibold' style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>
                    Cost per Unit (₹)
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    value={formData.cost_per_unit}
                    onChange={(e) => setFormData({ ...formData, cost_per_unit: parseFloat(e.target.value) })}
                    className='w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500'
                    style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)' }}
                  />
                </div>
              </div>
              
              <div>
                <label className='block text-slate-300 font-semibold' style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>
                  Supplier
                </label>
                <input
                  type='text'
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className='w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500'
                  style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)' }}
                />
              </div>
              
              <div className='flex' style={{ gap: 'var(--space-sm)' }}>
                <button
                  type='button'
                  onClick={() => setShowAddModal(false)}
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
                  Add Ingredient
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Usage Modal */}
      {showUsageModal && selectedIngredient && (
        <div className='fixed inset-0 bg-black/75 flex items-center justify-center z-50' style={{ padding: 'var(--space-lg)' }}>
          <GlassCard variant='elevated' className='max-w-lg w-full'>
            <div className='flex justify-between items-center' style={{ marginBottom: 'var(--space-lg)' }}>
              <h2 className='font-bold text-white' style={{ fontSize: 'var(--text-2xl)' }}>
                Record Usage: {selectedIngredient.name}
              </h2>
              <button
                onClick={() => setShowUsageModal(false)}
                className='text-slate-400 hover:text-white'
                style={{ fontSize: 'var(--text-xl)' }}
              >
                ✕
              </button>
            </div>
            
            <p className='text-slate-300' style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-md)' }}>
              Available: <span className='font-bold text-white'>{selectedIngredient.current_stock} {selectedIngredient.unit}</span>
            </p>
            
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
                  Used By (Staff/Chef Name)
                </label>
                <input
                  type='text'
                  value={usageData.used_by}
                  onChange={(e) => setUsageData({ ...usageData, used_by: e.target.value })}
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

export default InventoryManager;
