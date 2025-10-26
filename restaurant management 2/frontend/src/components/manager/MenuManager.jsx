import React, { useState, useEffect, useRef } from 'react';
import { menuAPI, dishesAPI } from '../../services/api';
import Card from '../shared/Card';
import toast from 'react-hot-toast';

// Kebab Menu Component
const KebabMenu = ({ item, onEdit, onDuplicate, onToggleStock, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 hover:bg-slate-800 rounded-full transition-colors"
      >
        <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-10 w-48 glass-card rounded-lg shadow-xl border border-slate-700/50 z-50 py-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-2"
          >
            <span>✏️</span> Edit Item
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-2"
          >
            <span>📋</span> Duplicate Item
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStock();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-2"
          >
            <span>{item.is_available ? '❌' : '✅'}</span> 
            {item.is_available ? 'Set Out of Stock' : 'Set In Stock'}
          </button>
          <div className="border-t border-slate-700/50 my-1"></div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-danger-900/40 text-danger-400 flex items-center gap-2"
          >
            <span>🗑️</span> Delete
          </button>
        </div>
      )}
    </div>
  );
};

const MenuManager = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDishSearch, setShowDishSearch] = useState(false);
  const [dishSearchQuery, setDishSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingDishes, setSearchingDishes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDietary, setFilterDietary] = useState('All');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    is_available: true,
    dietary_tags: [],
    ingredients: '',
    stock_level: 100,
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    filterMenuItems();
  }, [searchTerm, filterCategory, menuItems]);

  const fetchMenuItems = async () => {
    try {
      const response = await menuAPI.getAll();
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    }
  };

  const filterMenuItems = () => {
    let filtered = menuItems;

    // Category filter
    if (filterCategory !== 'All') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Status filter
    if (filterStatus === 'In Stock') {
      filtered = filtered.filter(item => item.is_available);
    } else if (filterStatus === 'Out of Stock') {
      filtered = filtered.filter(item => !item.is_available);
    }

    // Dietary filter (mock implementation)
    if (filterDietary !== 'All') {
      // This would need backend support
      filtered = filtered.filter(item => 
        item.dietary_tags && item.dietary_tags.includes(filterDietary)
      );
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }

    setFilteredItems(filtered);
  };

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  const getCategoryCount = (category) => {
    if (category === 'All') return menuItems.length;
    return menuItems.filter(item => item.category === category).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('is_available', formData.is_available);
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (editingId) {
        await menuAPI.update(editingId, formData);
        toast.success('Menu item updated successfully!');
      } else {
        await fetch('http://localhost:8000/api/menu/', {
          method: 'POST',
          body: formDataToSend,
        });
        toast.success('Menu item created successfully!');
      }
      fetchMenuItems();
      resetForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Failed to save menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await menuAPI.delete(id);
        toast.success('Menu item deleted successfully!');
        fetchMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
        toast.error('Failed to delete menu item');
      }
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      is_available: item.is_available,
      dietary_tags: item.dietary_tags || [],
      ingredients: item.ingredients || '',
      stock_level: item.stock_level || 100,
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleDuplicate = (item) => {
    setFormData({
      name: `${item.name} (Copy)`,
      category: item.category,
      price: item.price,
      description: item.description,
      is_available: item.is_available,
      dietary_tags: item.dietary_tags || [],
      ingredients: item.ingredients || '',
      stock_level: item.stock_level || 100,
    });
    setEditingId(null);
    setShowModal(true);
  };

  const handleToggleStock = async (item) => {
    try {
      await menuAPI.update(item.id, { ...item, is_available: !item.is_available });
      toast.success(`Item ${!item.is_available ? 'marked as in stock' : 'marked as out of stock'}!`);
      fetchMenuItems();
    } catch (error) {
      console.error('Error updating stock status:', error);
      toast.error('Failed to update stock status');
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) return;

    try {
      if (bulkAction === 'delete') {
        if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
          await Promise.all(selectedItems.map(id => menuAPI.delete(id)));
          toast.success('Items deleted successfully!');
        }
      } else if (bulkAction === 'out-of-stock') {
        await Promise.all(selectedItems.map(id => {
          const item = menuItems.find(i => i.id === id);
          return menuAPI.update(id, { ...item, is_available: false });
        }));
        toast.success('Items marked as out of stock!');
      } else if (bulkAction === 'in-stock') {
        await Promise.all(selectedItems.map(id => {
          const item = menuItems.find(i => i.id === id);
          return menuAPI.update(id, { ...item, is_available: true });
        }));
        toast.success('Items marked as in stock!');
      }
      
      setSelectedItems([]);
      setBulkAction('');
      fetchMenuItems();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      description: '',
      is_available: true,
      dietary_tags: [],
      ingredients: '',
      stock_level: 100,
    });
    setImageFile(null);
    setEditingId(null);
    setShowForm(false);
    setShowModal(false);
  };

  const handleDishSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearchingDishes(true);
    try {
      const response = await dishesAPI.search(query);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching dishes:', error);
      toast.error('Failed to search dishes');
    } finally {
      setSearchingDishes(false);
    }
  };

  const handleSelectDish = (dish) => {
    setFormData({
      name: dish.name,
      category: dish.course || 'Main Course',
      price: '',
      description: dish.description || `${dish.flavor_profile || ''} ${dish.region || ''}`.trim(),
      is_available: true,
      dietary_tags: dish.diet ? [dish.diet] : [],
      ingredients: dish.ingredients || '',
      stock_level: 100,
    });
    setEditingId(null);
    setShowDishSearch(false);
    setShowModal(true);
    setDishSearchQuery('');
    setSearchResults([]);
    toast.success(`Auto-filled from: ${dish.name}`);
  };

  return (
    <div className="flex bg-slate-950 rounded-xl overflow-hidden" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* Collapsible Sidebar */}
      <div 
        className={`${sidebarOpen ? 'glass-card border-r border-slate-700/50 overflow-y-auto flex-shrink-0' : 'w-0 overflow-hidden'}`}
        style={{ 
          width: sidebarOpen ? '280px' : '0',
          transition: 'all 0.382s cubic-bezier(0.4, 0, 0.2, 1)',
          maxHeight: 'calc(100vh - 120px)'
        }}
      >
        <div style={{ padding: 'var(--space-lg)' }}>
          <div 
            className="flex items-center justify-between"
            style={{ marginBottom: 'var(--space-lg)' }}
          >
            <h3 
              className="font-bold text-white"
              style={{ 
                fontSize: 'var(--text-lg)', 
                lineHeight: 'var(--leading-tight)' 
              }}
            >
              Filters
            </h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden hover:bg-slate-800 rounded text-slate-400"
              style={{ padding: 'var(--space-xs)' }}
            >
              ✕
            </button>
          </div>

          {/* Categories Filter */}
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h4 
              className="font-semibold text-slate-400 uppercase tracking-wide"
              style={{ 
                fontSize: 'var(--text-xs)', 
                marginBottom: 'var(--space-sm)' 
              }}
            >
              Categories
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`w-full text-left transition-all rounded-lg ${
                    filterCategory === category
                      ? 'bg-slate-700/80 text-white font-semibold border-l-3 border-pink-500 shadow-sm'
                      : 'hover:bg-slate-800/50 text-slate-300 border-l-3 border-transparent'
                  }`}
                  style={{
                    padding: 'var(--space-xs) var(--space-sm)',
                    fontSize: 'var(--text-sm)',
                    transition: 'all 0.2s ease',
                    borderLeftWidth: '3px'
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span>{category}</span>
                    <span 
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        filterCategory === category 
                          ? 'bg-pink-500/20 text-pink-300' 
                          : 'bg-slate-700/50 text-slate-400'
                      }`}
                    >
                      {getCategoryCount(category)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h4 
              className="font-semibold text-slate-400 uppercase tracking-wide"
              style={{ 
                fontSize: 'var(--text-xs)', 
                marginBottom: 'var(--space-sm)' 
              }}
            >
              Status
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              {['All', 'In Stock', 'Out of Stock'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`w-full text-left transition-all rounded-lg ${
                    filterStatus === status
                      ? 'bg-slate-700/80 text-white font-semibold border-l-3 border-pink-500 shadow-sm'
                      : 'hover:bg-slate-800/50 text-slate-300 border-l-3 border-transparent'
                  }`}
                  style={{
                    padding: 'var(--space-xs) var(--space-sm)',
                    fontSize: 'var(--text-sm)',
                    transition: 'all 0.2s ease',
                    borderLeftWidth: '3px'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Tags Filter */}
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h4 
              className="font-semibold text-slate-400 uppercase tracking-wide"
              style={{ 
                fontSize: 'var(--text-xs)', 
                marginBottom: 'var(--space-sm)' 
              }}
            >
              Dietary Tags
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              {['All', 'Vegetarian', 'Vegan', 'Gluten-Free'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilterDietary(tag)}
                  className={`w-full text-left transition-all rounded-lg ${
                    filterDietary === tag
                      ? 'bg-slate-700/80 text-white font-semibold border-l-3 border-pink-500 shadow-sm'
                      : 'hover:bg-slate-800/50 text-slate-300 border-l-3 border-transparent'
                  }`}
                  style={{
                    padding: 'var(--space-xs) var(--space-sm)',
                    fontSize: 'var(--text-sm)',
                    transition: 'all 0.2s ease',
                    borderLeftWidth: '3px'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setFilterCategory('All');
              setFilterStatus('All');
              setFilterDietary('All');
              setSearchTerm('');
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 font-semibold text-slate-200 border border-slate-700/50"
            style={{
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              transition: 'all 0.382s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            Reset All Filters
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div style={{ padding: 'var(--space-lg)' }}>
          {/* Header */}
          <div 
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center"
            style={{ gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}
          >
            <div className="flex items-center" style={{ gap: 'var(--space-md)' }}>
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="hover:bg-gray-200 transition-colors"
                  style={{
                    padding: 'var(--space-xs)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <svg style={{ width: '21px', height: '21px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <div>
                <h1 
                  className="font-bold text-white"
                  style={{ 
                    fontSize: 'var(--text-3xl)', 
                    lineHeight: 'var(--leading-tight)',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Menu Management
                </h1>
                <p 
                  className="text-slate-400"
                  style={{ 
                    fontSize: 'var(--text-base)', 
                    marginTop: 'var(--space-xs)' 
                  }}
                >
                  Manage your restaurant's food catalogue
                </p>
              </div>
            </div>
            <div className="flex" style={{ gap: 'var(--space-sm)' }}>
              <button
                onClick={() => setShowDishSearch(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold border border-primary-500/50 hover:border-primary-500 flex items-center"
                style={{
                  padding: 'var(--space-sm) var(--space-lg)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  gap: 'var(--space-xs)',
                  transition: 'all 0.382s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <span style={{ fontSize: 'var(--text-xl)' }}>🔍</span> Search Dishes
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold hover:from-pink-600 hover:to-purple-700 hover:scale-105 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 flex items-center"
                style={{
                  padding: 'var(--space-sm) var(--space-lg)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  gap: 'var(--space-xs)',
                  transition: 'all 0.382s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <span style={{ fontSize: 'var(--text-xl)' }}>+</span> Add Item
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search menu items by name, category, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full glass-card border border-slate-700/50 focus:outline-none focus:border-primary-500 text-white placeholder-slate-400"
                style={{
                  padding: 'var(--space-sm) var(--space-md) var(--space-sm) 55px',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  transition: 'all 0.382s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
              <svg 
                className="text-slate-400 absolute top-4"
                style={{ width: '21px', height: '21px', left: 'var(--space-md)' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedItems.length > 0 && (
            <div 
              className="glass-card border border-primary-500/50 flex items-center justify-between"
              style={{
                marginBottom: 'var(--space-lg)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div className="flex items-center" style={{ gap: 'var(--space-md)' }}>
                <span 
                  className="font-semibold text-white"
                  style={{ fontSize: 'var(--text-base)' }}
                >
                  {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                </span>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="bg-slate-800 border border-slate-700 focus:outline-none focus:border-primary-500 text-slate-200"
                  style={{
                    padding: 'var(--space-xs) var(--space-md)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  <option value="">Bulk Actions</option>
                  <option value="in-stock">Set In Stock</option>
                  <option value="out-of-stock">Set Out of Stock</option>
                  <option value="delete">Delete Selected</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="gradient-primary text-white font-semibold hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-primary-glow"
                  style={{
                    padding: 'var(--space-xs) var(--space-lg)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    transition: 'all 0.382s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  Apply
                </button>
              </div>
              <button
                onClick={() => setSelectedItems([])}
                className="text-slate-400 hover:text-white font-semibold"
                style={{ fontSize: 'var(--text-sm)' }}
              >
                Clear Selection
              </button>
            </div>
          )}

          {/* Items Count & Select All */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-semibold text-slate-200">Select All</span>
              </label>
              <span className="text-slate-400">
                Showing <span className="font-bold text-white">{filteredItems.length}</span> of{' '}
                <span className="font-bold text-white">{menuItems.length}</span> items
              </span>
            </div>
          </div>

          {/* Menu Items Grid */}
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6"
          >
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleEdit(item)}
                className="glass-card overflow-hidden border border-slate-700/50 hover:border-primary-500 cursor-pointer group shadow-lg hover:shadow-primary-glow hover:-translate-y-1 relative"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  transition: 'all 0.382s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {/* Checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectItem(item.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                </div>

                {/* Kebab Menu */}
                <div className="absolute top-3 right-3 z-10">
                  <KebabMenu
                    item={item}
                    onEdit={() => handleEdit(item)}
                    onDuplicate={() => handleDuplicate(item)}
                    onToggleStock={() => handleToggleStock(item)}
                    onDelete={() => handleDelete(item.id)}
                  />
                </div>

                {/* Image */}
                <div className="relative h-56 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={`http://localhost:8000${item.image_url}`}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      style={{ objectPosition: 'center' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">
                      🍽️
                    </div>
                  )}
                  
                  {/* Status Indicator - Circular dot */}
                  <div className="absolute top-3 left-3">
                    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full backdrop-blur-sm ${
                      item.is_available
                        ? 'bg-green-500/20 border border-green-500/50'
                        : 'bg-red-500/20 border border-red-500/50'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        item.is_available ? 'bg-green-400' : 'bg-red-400'
                      } ${item.is_available ? 'animate-pulse' : ''}`} />
                      <span className={`text-xs font-semibold ${
                        item.is_available ? 'text-green-100' : 'text-red-100'
                      }`}>
                        {item.is_available ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-2xl font-extrabold text-white mb-2 line-clamp-1 group-hover:text-pink-400 transition-colors capitalize">
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 capitalize font-medium">{item.category}</p>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-4xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                      ₹{parseFloat(item.price).toFixed(0)}
                    </span>
                    <span className="text-lg text-slate-500">.{(parseFloat(item.price) % 1).toFixed(2).substring(2)}</span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-20">
              <div className="text-8xl mb-4">🍽️</div>
              <h3 className="text-2xl font-bold text-white mb-2">No items found</h3>
              <p className="text-slate-400 mb-6">
                {searchTerm || filterCategory !== 'All' || filterStatus !== 'All'
                  ? 'Try adjusting your filters or search term'
                  : 'Start by adding your first menu item'}
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-primary-glow"
              >
                Add First Item
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Full-Screen Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="glass-premium rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/50">
            <div className="sticky top-0 glass-premium border-b border-slate-700/50 px-8 py-6 flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">
                {editingId ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Item Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-all"
                    placeholder="e.g., Margherita Pizza"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-all"
                    placeholder="e.g., Italian, Fast Food"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-all"
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-all"
                    placeholder="Brief description of the item"
                  />
                </div>

                {/* Ingredients */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ingredients
                  </label>
                  <input
                    type="text"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-all"
                    placeholder="e.g., Cheese, Tomato, Basil"
                  />
                </div>

                {/* Stock Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Level
                  </label>
                  <input
                    type="number"
                    value={formData.stock_level}
                    onChange={(e) => setFormData({ ...formData, stock_level: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-all"
                    placeholder="100"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-all"
                  />
                </div>

                {/* Availability */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="w-6 h-6 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Item is available for ordering
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Saving...' : editingId ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dish Search Modal */}
      {showDishSearch && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50" style={{ padding: 'var(--space-lg)' }}>
          <div className="glass-card border border-slate-700/50 max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ borderRadius: 'var(--radius-xl)' }}>
            <div className="sticky top-0 glass-card border-b border-slate-700/50 flex justify-between items-center" style={{ padding: 'var(--space-lg)', zIndex: 10 }}>
              <div>
                <h2 className="font-bold text-white" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-xs)' }}>
                  Search Global Dishes
                </h2>
                <p className="text-slate-400" style={{ fontSize: 'var(--text-sm)' }}>
                  Search from 255+ authentic Indian dishes
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDishSearch(false);
                  setDishSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-slate-400 hover:text-white transition-colors"
                style={{ fontSize: 'var(--text-2xl)' }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ padding: 'var(--space-lg)' }}>
              {/* Search Input */}
              <div className="relative" style={{ marginBottom: 'var(--space-lg)' }}>
                <input
                  type="text"
                  placeholder="Search by dish name (e.g., biryani, paneer, dosa)..."
                  value={dishSearchQuery}
                  onChange={(e) => {
                    setDishSearchQuery(e.target.value);
                    handleDishSearch(e.target.value);
                  }}
                  autoFocus
                  className="w-full bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-primary-500"
                  style={{
                    padding: 'var(--space-md) var(--space-md) var(--space-md) 55px',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-base)'
                  }}
                />
                <svg 
                  className="text-slate-400 absolute top-4"
                  style={{ width: '21px', height: '21px', left: 'var(--space-md)' }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Loading State */}
              {searchingDishes && (
                <div className="text-center" style={{ padding: 'var(--space-xl)' }}>
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                  <p className="text-slate-400 mt-4">Searching dishes...</p>
                </div>
              )}

              {/* No Query */}
              {!dishSearchQuery && !searchingDishes && (
                <div className="text-center" style={{ padding: 'var(--space-xl)' }}>
                  <span style={{ fontSize: '64px' }}>🔍</span>
                  <p className="text-slate-400" style={{ fontSize: 'var(--text-lg)', marginTop: 'var(--space-md)' }}>
                    Start typing to search dishes
                  </p>
                  <p className="text-slate-500" style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-xs)' }}>
                    Try searching: "biryani", "paneer", "dosa", "curry"
                  </p>
                </div>
              )}

              {/* No Results */}
              {dishSearchQuery && !searchingDishes && searchResults.length === 0 && (
                <div className="text-center" style={{ padding: 'var(--space-xl)' }}>
                  <span style={{ fontSize: '64px' }}>😕</span>
                  <p className="text-slate-400" style={{ fontSize: 'var(--text-lg)', marginTop: 'var(--space-md)' }}>
                    No dishes found for "{dishSearchQuery}"
                  </p>
                  <p className="text-slate-500" style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-xs)' }}>
                    Try a different search term
                  </p>
                </div>
              )}

              {/* Results Grid */}
              {searchResults.length > 0 && !searchingDishes && (
                <div>
                  <p className="text-slate-400" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-md)' }}>
                    Found {searchResults.length} dish{searchResults.length !== 1 ? 'es' : ''}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-md)' }}>
                    {searchResults.map(dish => (
                      <div
                        key={dish.id}
                        onClick={() => handleSelectDish(dish)}
                        className="glass-card border border-slate-700/50 hover:border-primary-500 cursor-pointer transition-all hover:scale-[1.02]"
                        style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)' }}
                      >
                        <div className="flex justify-between items-start" style={{ marginBottom: 'var(--space-sm)' }}>
                          <h3 className="font-bold text-white" style={{ fontSize: 'var(--text-lg)' }}>
                            {dish.name}
                          </h3>
                          {dish.diet && (
                            <span 
                              className={`font-semibold text-xs`}
                              style={{ 
                                padding: 'var(--space-xs)',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: dish.diet === 'vegetarian' ? '#10b981' : '#f59e0b',
                                color: 'white'
                              }}
                            >
                              {dish.diet === 'vegetarian' ? '🥬 Veg' : '🍖 Non-Veg'}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap" style={{ gap: 'var(--space-xs)', marginBottom: 'var(--space-sm)' }}>
                          {dish.course && (
                            <span className="bg-slate-800 text-slate-300 font-medium" style={{ padding: 'var(--space-xs)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)' }}>
                              {dish.course}
                            </span>
                          )}
                          {dish.region && (
                            <span className="bg-slate-800 text-slate-300 font-medium" style={{ padding: 'var(--space-xs)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)' }}>
                              📍 {dish.region}
                            </span>
                          )}
                          {dish.state && (
                            <span className="bg-slate-800 text-slate-300 font-medium" style={{ padding: 'var(--space-xs)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)' }}>
                              {dish.state}
                            </span>
                          )}
                        </div>

                        {(dish.prep_time || dish.cook_time) && (
                          <div className="flex" style={{ gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                            {dish.prep_time && (
                              <span className="text-slate-400" style={{ fontSize: 'var(--text-sm)' }}>
                                ⏱️ Prep: {dish.prep_time}min
                              </span>
                            )}
                            {dish.cook_time && (
                              <span className="text-slate-400" style={{ fontSize: 'var(--text-sm)' }}>
                                🔥 Cook: {dish.cook_time}min
                              </span>
                            )}
                          </div>
                        )}

                        {dish.flavor_profile && (
                          <p className="text-slate-400 italic" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-sm)' }}>
                            {dish.flavor_profile}
                          </p>
                        )}

                        {dish.ingredients && (
                          <p className="text-slate-500 line-clamp-2" style={{ fontSize: 'var(--text-xs)' }}>
                            {dish.ingredients}
                          </p>
                        )}

                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                          <button className="text-primary-400 font-semibold hover:text-primary-300" style={{ fontSize: 'var(--text-sm)' }}>
                            Click to auto-fill →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManager;
