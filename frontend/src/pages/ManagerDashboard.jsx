import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { menuAPI, ordersAPI, globalDishesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  LayoutDashboard, ChefHat, Package, Users, Receipt, TrendingUp,
  DollarSign, Clock, AlertTriangle, Plus, Edit, Trash2, Search,
  Brain, ShoppingCart, Sparkles, X, Save, Upload, Download,
  Settings, Grid3x3, FileText, Calendar, Target, TrendingDown,
  CheckCircle, XCircle, Image as ImageIcon, Zap
} from 'lucide-react';

const ManagerDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Overview Stats
  const [stats, setStats] = useState({
    todaySales: 0,
    weekSales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
  });

  // Menu Management
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    is_vegetarian: false,
    spice_level: 0,
    prep_time_minutes: 15,
    image_url: '',
    calories: null,
    allergens: [],
    tags: [],
  });

  // Inventory Management
  const [inventory, setInventory] = useState([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    quantity: '',
    unit: 'kg',
    min_quantity: '',
    expiry_date: '',
    image_url: '',
    supplier: '',
    cost_per_unit: '',
  });

  // Staff Management
  const [staff, setStaff] = useState([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    phone: '',
  });

  // AI Insights
  const [aiInsights, setAiInsights] = useState({
    topDishes: [],
    lowStock: [],
    priceSuggestions: [],
    demandForecast: [],
  });
  const [aiInsightsLoaded, setAiInsightsLoaded] = useState(false);

  // Global Library
  const [globalDishes, setGlobalDishes] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSelectedCategory, setGlobalSelectedCategory] = useState('');
  const [globalSelectedCuisine, setGlobalSelectedCuisine] = useState('');
  const [globalCategories, setGlobalCategories] = useState([]);
  const [globalCuisines, setGlobalCuisines] = useState([]);
  const [showGlobalPreview, setShowGlobalPreview] = useState(false);
  const [selectedGlobalDish, setSelectedGlobalDish] = useState(null);
  const [globalPreviewData, setGlobalPreviewData] = useState(null);
  const [addingDish, setAddingDish] = useState(false);
  const [customPrice, setCustomPrice] = useState('');

  // PERFORMANCE FIX: Load data only once on mount, not on every activeTab change
  useEffect(() => {
    // Redirect if not manager
    if (user?.role !== 'manager') {
      toast.error('Access denied. Manager role required.');
      navigate('/dashboard');
      return;
    }
    
    // Load initial data only once
    if (menuItems.length === 0) {
      loadMenuData();
    }
  }, [user, navigate]); // Removed activeTab dependency

  // PERFORMANCE FIX: Load AI insights only when AI tab is opened
  useEffect(() => {
    if (activeTab === 'ai' && !aiInsightsLoaded) {
      loadAIInsights();
    }
  }, [activeTab, aiInsightsLoaded]);

  // Load inventory data when inventory tab is opened
  useEffect(() => {
    if (activeTab === 'inventory' && inventory.length === 0) {
      loadInventoryData();
    }
  }, [activeTab]);

  // Load global library data when global-library tab is opened
  useEffect(() => {
    if (activeTab === 'global-library') {
      if (globalDishes.length === 0) {
        loadGlobalLibraryData();
      }
    }
  }, [activeTab]);

  // Debounced search for global library
  useEffect(() => {
    if (activeTab === 'global-library') {
      const debounce = setTimeout(() => {
        fetchGlobalDishes();
      }, 300);
      return () => clearTimeout(debounce);
    }
  }, [globalSearchQuery, globalSelectedCategory, globalSelectedCuisine, activeTab]);

  const loadTabData = useCallback(async (tab) => {
    // Load data on-demand when switching tabs (not on mount)
    if (tab === 'overview' && stats.todaySales === 0) {
      loadDashboardData();
    }
    // Add other tab-specific loading as needed
  }, [stats]);

  const loadMenuData = async () => {
    try {
      setLoading(true);
      const menuRes = await menuAPI.getAll();
      setMenuItems(menuRes.data);
    } catch (error) {
      console.error('Failed to load menu:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersRes, menuRes] = await Promise.all([
        ordersAPI.getAll(),
        menuAPI.getAll(),
      ]);

      const orders = ordersRes.data;
      const today = new Date().toDateString();
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const todayOrders = orders.filter(
        (o) => new Date(o.created_at).toDateString() === today
      );
      const weekOrders = orders.filter(
        (o) => new Date(o.created_at) >= weekAgo
      );

      setStats({
        todaySales: todayOrders.reduce((sum, o) => sum + (o.final_amount || 0), 0),
        weekSales: weekOrders.reduce((sum, o) => sum + (o.final_amount || 0), 0),
        totalOrders: orders.length,
        avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + (o.final_amount || 0), 0) / orders.length : 0,
      });

      setMenuItems(menuRes.data);

      // AI insights are now loaded separately when AI tab is opened
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // PERFORMANCE FIX: Separate function to load AI insights only when needed
  const loadAIInsights = async () => {
    try {
      const [ordersRes, menuRes] = await Promise.all([
        ordersAPI.getAll(),
        menuAPI.getAll(),
      ]);
      generateMockAIInsights(menuRes.data, ordersRes.data);
      setAiInsightsLoaded(true);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
      toast.error('Failed to load AI insights');
    }
  };

  const generateMockAIInsights = (menu, orders) => {
    // Mock top dishes
    const dishCounts = {};
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const dishName = item.menu_item?.name || 'Unknown';
        dishCounts[dishName] = (dishCounts[dishName] || 0) + item.quantity;
      });
    });

    const topDishes = Object.entries(dishCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    setAiInsights({
      topDishes,
      lowStock: [
        { name: 'Tomatoes', current: 5, min: 10, unit: 'kg', urgency: 'high' },
        { name: 'Cheese', current: 15, min: 20, unit: 'kg', urgency: 'medium' },
      ],
      priceSuggestions: [
        {
          dish: 'Margherita Pizza',
          current: 12.99,
          suggested: 13.99,
          reason: 'High demand, low supply',
        },
      ],
      demandForecast: [
        { day: 'Mon', predicted: 45 },
        { day: 'Tue', predicted: 52 },
        { day: 'Wed', predicted: 48 },
        { day: 'Thu', predicted: 61 },
        { day: 'Fri', predicted: 78 },
        { day: 'Sat', predicted: 95 },
        { day: 'Sun', predicted: 82 },
      ],
    });
  };

  // Menu Management Functions
  const handleAddMenuItem = () => {
    setSelectedMenuItem(null);
    setMenuForm({
      name: '',
      description: '',
      price: '',
      category: 'Main Course',
      is_vegetarian: false,
      spice_level: 0,
      prep_time_minutes: 15,
      image_url: '',
      calories: null,
      allergens: [],
      tags: [],
    });
    setShowMenuModal(true);
  };

  const handleEditMenuItem = (item) => {
    setSelectedMenuItem(item);
    setMenuForm({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      is_vegetarian: item.is_vegetarian || false,
      spice_level: item.spice_level || 0,
      prep_time_minutes: item.prep_time_minutes || 15,
      image_url: item.image_url || '',
      calories: item.calories || null,
      allergens: item.allergens || [],
      tags: item.tags || [],
    });
    setShowMenuModal(true);
  };

  const handleSaveMenuItem = async () => {
    try {
      const restaurantId = user?.restaurant_id || 1;
      
      const itemData = {
        name: menuForm.name,
        description: menuForm.description,
        category: menuForm.category,
        price: parseFloat(menuForm.price),
        restaurant_id: restaurantId,
        is_vegetarian: menuForm.is_vegetarian || false,
        spice_level: parseInt(menuForm.spice_level) || 0,
        prep_time_minutes: parseInt(menuForm.prep_time_minutes) || 15,
        image_url: menuForm.image_url || null,
        calories: menuForm.calories ? parseInt(menuForm.calories) : null,
        allergens: menuForm.allergens || [],
        tags: menuForm.tags || [],
      };

      if (selectedMenuItem) {
        await menuAPI.update(selectedMenuItem.id, itemData);
        toast.success('Menu item updated successfully');
      } else {
        await menuAPI.create(itemData);
        toast.success('Menu item added successfully');
      }

      setShowMenuModal(false);
      setMenuForm({
        name: '',
        description: '',
        price: '',
        category: 'Main Course',
        is_vegetarian: false,
        spice_level: 0,
        prep_time_minutes: 15,
        image_url: '',
        calories: null,
        allergens: [],
        tags: [],
      });
      // PERFORMANCE FIX: Only reload menu, not entire dashboard
      await loadMenuData();
    } catch (error) {
      console.error('Save menu error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to save menu item';
      toast.error(errorMsg);
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      // PERFORMANCE FIX: Optimistic update - remove from UI immediately
      const previousItems = menuItems;
      setMenuItems(menuItems.filter(item => item.id !== itemId));
      toast.success('Menu item deleted');
      
      // Delete in background
      await menuAPI.delete(itemId);
    } catch (error) {
      console.error('Delete menu error:', error);
      toast.error('Failed to delete menu item');
      // Revert on error
      await loadMenuData();
    }
  };

  // Inventory Management Functions
  const loadInventoryData = async () => {
    try {
      // For now, use mock data until inventory API is ready
      // In future: const response = await inventoryAPI.getAll();
      // setInventory(response.data);
      
      // Mock inventory data
      const mockInventory = [
        { id: 1, name: 'Tomatoes', quantity: 25, unit: 'kg', min_quantity: 10, expiry_date: '2025-10-20', image_url: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400', supplier: 'Fresh Farm', cost_per_unit: 2.50, status: 'good' },
        { id: 2, name: 'Cheese', quantity: 8, unit: 'kg', min_quantity: 15, expiry_date: '2025-10-18', image_url: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400', supplier: 'Dairy Co', cost_per_unit: 8.99, status: 'low' },
        { id: 3, name: 'Olive Oil', quantity: 30, unit: 'L', min_quantity: 20, expiry_date: '2025-12-30', image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', supplier: 'Mediterranean Oils', cost_per_unit: 12.50, status: 'good' },
        { id: 4, name: 'Flour', quantity: 5, unit: 'kg', min_quantity: 25, expiry_date: '2025-11-15', image_url: 'https://images.unsplash.com/photo-1628449930374-9caf9cd61816?w=400', supplier: 'Grain Mills', cost_per_unit: 1.80, status: 'critical' },
        { id: 5, name: 'Fresh Basil', quantity: 15, unit: 'bunches', min_quantity: 10, expiry_date: '2025-10-15', image_url: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400', supplier: 'Herb Garden', cost_per_unit: 0.75, status: 'good' },
        { id: 6, name: 'Chicken Breast', quantity: 12, unit: 'kg', min_quantity: 20, expiry_date: '2025-10-16', image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400', supplier: 'Poultry Farm', cost_per_unit: 6.50, status: 'low' },
      ];
      setInventory(mockInventory);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      toast.error('Failed to load inventory data');
    }
  };

  const handleAddInventory = () => {
    setSelectedInventory(null);
    setInventoryForm({
      name: '',
      quantity: '',
      unit: 'kg',
      min_quantity: '',
      expiry_date: '',
      image_url: '',
      supplier: '',
      cost_per_unit: '',
    });
    setShowInventoryModal(true);
  };

  const handleEditInventory = (item) => {
    setSelectedInventory(item);
    setInventoryForm({
      name: item.name,
      quantity: item.quantity.toString(),
      unit: item.unit,
      min_quantity: item.min_quantity.toString(),
      expiry_date: item.expiry_date,
      image_url: item.image_url || '',
      supplier: item.supplier || '',
      cost_per_unit: item.cost_per_unit?.toString() || '',
    });
    setShowInventoryModal(true);
  };

  const handleSaveInventory = async () => {
    try {
      if (selectedInventory) {
        // Update existing item
        const updatedInventory = inventory.map(item => 
          item.id === selectedInventory.id 
            ? { 
                ...item, 
                ...inventoryForm, 
                quantity: parseFloat(inventoryForm.quantity),
                min_quantity: parseFloat(inventoryForm.min_quantity),
                cost_per_unit: parseFloat(inventoryForm.cost_per_unit),
                status: parseFloat(inventoryForm.quantity) < parseFloat(inventoryForm.min_quantity) 
                  ? (parseFloat(inventoryForm.quantity) < parseFloat(inventoryForm.min_quantity) * 0.5 ? 'critical' : 'low')
                  : 'good'
              }
            : item
        );
        setInventory(updatedInventory);
        toast.success('Inventory item updated successfully');
      } else {
        // Add new item
        const newItem = {
          id: inventory.length + 1,
          ...inventoryForm,
          quantity: parseFloat(inventoryForm.quantity),
          min_quantity: parseFloat(inventoryForm.min_quantity),
          cost_per_unit: parseFloat(inventoryForm.cost_per_unit),
          status: parseFloat(inventoryForm.quantity) < parseFloat(inventoryForm.min_quantity) 
            ? (parseFloat(inventoryForm.quantity) < parseFloat(inventoryForm.min_quantity) * 0.5 ? 'critical' : 'low')
            : 'good'
        };
        setInventory([newItem, ...inventory]);
        toast.success('Inventory item added successfully');
      }
      setShowInventoryModal(false);
    } catch (error) {
      toast.error('Failed to save inventory item');
    }
  };

  const handleDeleteInventory = (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      setInventory(inventory.filter(item => item.id !== id));
      toast.success('Inventory item deleted');
    }
  };

  // Global Library Functions
  const loadGlobalLibraryData = async () => {
    try {
      const [categoriesRes, cuisinesRes, dishesRes] = await Promise.all([
        globalDishesAPI.getCategories(),
        globalDishesAPI.getCuisines(),
        globalDishesAPI.search({ limit: 50 }),
      ]);
      // Backend returns [{category: "Main Course", count: 10}, ...] - extract names
      setGlobalCategories((categoriesRes.data || []).map(item => item.category));
      setGlobalCuisines((cuisinesRes.data || []).map(item => item.cuisine));
      setGlobalDishes(dishesRes.data || []);
    } catch (error) {
      console.error('Failed to load global library:', error);
      toast.error('Failed to load global dishes');
    }
  };

  const fetchGlobalDishes = async () => {
    setGlobalLoading(true);
    try {
      const params = {
        limit: 50,
        ...(globalSearchQuery && { q: globalSearchQuery }),  // Backend uses 'q' not 'search_query'
        ...(globalSelectedCategory && { category: globalSelectedCategory }),
        ...(globalSelectedCuisine && { cuisine: globalSelectedCuisine }),
      };
      const response = await globalDishesAPI.search(params);
      setGlobalDishes(response.data || []);  // Backend returns direct array
    } catch (error) {
      console.error('Failed to fetch dishes:', error);
      toast.error('Failed to search dishes');
    } finally {
      setGlobalLoading(false);
    }
  };

  const handlePreviewGlobalDish = async (dish) => {
    setSelectedGlobalDish(dish);
    setCustomPrice(dish.default_price?.toString() || '');
    setShowGlobalPreview(true);
    
    try {
      const restaurantId = user?.restaurant_id || 1;
      const response = await globalDishesAPI.previewMapping(restaurantId, dish.id);
      setGlobalPreviewData(response.data);
    } catch (error) {
      console.error('Failed to load preview:', error);
      toast.error('Failed to load ingredient preview');
    }
  };

  const handleAddGlobalDish = async () => {
    if (!selectedGlobalDish || !customPrice) {
      toast.error('Please set a menu price');
      return;
    }

    setAddingDish(true);
    try {
      const restaurantId = user?.restaurant_id || 1;
      await globalDishesAPI.addToMenu(restaurantId, selectedGlobalDish.id, {
        custom_price: parseFloat(customPrice),
      });
      
      toast.success(`${selectedGlobalDish.name} added to menu successfully!`);
      setShowGlobalPreview(false);
      setSelectedGlobalDish(null);
      setGlobalPreviewData(null);
      
      // Reload menu
      await loadMenuData();
    } catch (error) {
      console.error('Failed to add dish:', error);
      toast.error(error.response?.data?.detail || 'Failed to add dish to menu');
    } finally {
      setAddingDish(false);
    }
  };

  const clearGlobalFilters = () => {
    setGlobalSearchQuery('');
    setGlobalSelectedCategory('');
    setGlobalSelectedCuisine('');
  };

  // Staff Management Functions
  const handleAddStaff = () => {
    setStaffForm({
      name: '',
      email: '',
      password: '',
      role: 'staff',
      phone: '',
    });
    setShowStaffModal(true);
  };

  const handleSaveStaff = async () => {
    try {
      const restaurantId = user?.restaurant_id || 1;
      await staffAPI.create(restaurantId, staffForm);
      toast.success('Staff member added successfully');
      setShowStaffModal(false);
    } catch (error) {
      console.error('Save staff error:', error);
      toast.error('Failed to add staff member');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Modern Header with Glass Effect */}
      <header className="glass sticky top-0 z-10 animate-fade-in">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">🍽️ Manager Dashboard</h1>
              <p className="text-white" style={{ opacity: 0.9 }}>Welcome back, {user?.name}</p>
            </div>
            <button
              onClick={logout}
              className="btn-outline"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Modern Tabs with Glass Effect */}
      <div className="glass-dark">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-4">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'menu', label: 'Menu', icon: ChefHat },
              { id: 'global-library', label: 'Global Library', icon: Sparkles },
              { id: 'inventory', label: 'Inventory', icon: Package },
              { id: 'staff', label: 'Staff', icon: Users },
              { id: 'billing', label: 'Billing', icon: Receipt },
              { id: 'ai', label: 'AI Insights', icon: Brain },
            ].map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-t-lg transition animate-fade-in ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Modern Stats Grid with Animations */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="stat-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Today's Sales</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">${stats.todaySales.toFixed(2)}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                </div>
                <p className="text-xs text-green-600 font-medium">↑ 12% from yesterday</p>
              </div>

              <div className="stat-card animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Week Sales</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">${stats.weekSales.toFixed(2)}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                </div>
                <p className="text-xs text-blue-600 font-medium">↑ 8% from last week</p>
              </div>

              <div className="stat-card animate-scale-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
                    <Receipt className="w-8 h-8 text-white" />
                  </div>
                </div>
                <p className="text-xs text-purple-600 font-medium">↑ 23 orders today</p>
              </div>

              <div className="stat-card animate-scale-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Avg Order Value</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">${stats.avgOrderValue.toFixed(2)}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                </div>
                <p className="text-xs text-orange-600 font-medium">↑ 5% from average</p>
              </div>
            </div>

            {/* Top Selling Dishes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top Selling Dishes</h3>
              <div className="space-y-3">
                {aiInsights.topDishes.map((dish, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-primary-600">#{index + 1}</span>
                      </div>
                      <span className="font-medium text-gray-900">{dish.name}</span>
                    </div>
                    <span className="text-gray-600">{dish.count} orders</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Demand Forecast Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Demand Forecast</h3>
              <div className="flex items-end justify-between h-48 gap-2">
                {aiInsights.demandForecast.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-primary-500 rounded-t-lg transition-all hover:bg-primary-600"
                      style={{ height: `${(day.predicted / 100) * 100}%` }}
                    ></div>
                    <span className="text-sm text-gray-600">{day.day}</span>
                    <span className="text-xs font-medium text-gray-900">{day.predicted}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white">🍽️ Menu Management</h2>
              <button
                onClick={handleAddMenuItem}
                className="btn-modern flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Menu Item
              </button>
            </div>

            {/* Zomato-Style Category Filter */}
            <div className="mb-6 animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
              <div className="category-filter-container flex items-center gap-3 overflow-x-auto pb-2">
                {['All', ...new Set(menuItems.map(item => item.category))].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="px-6 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-300"
                    style={
                      selectedCategory === category
                        ? {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                            transform: 'translateY(-2px)',
                            border: '2px solid transparent',
                          }
                        : {
                            background: 'rgba(255, 255, 255, 0.95)',
                            color: '#667eea',
                            border: '2px solid rgba(102, 126, 234, 0.3)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          }
                    }
                    onMouseEnter={(e) => {
                      if (selectedCategory !== category) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                        e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategory !== category) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                        e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems
                .filter(item => selectedCategory === 'All' || item.category === selectedCategory)
                .map((item, index) => (
                <div key={item.id} className="menu-card animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="menu-image">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <ChefHat className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}
                    <div className="menu-overlay">
                      <span className="text-white text-xs font-medium px-3 py-1 bg-black bg-opacity-50 rounded-full">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                      <span className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ${item.price}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2" style={{ minHeight: '2.5rem' }}>
                      {item.description || 'No description available'}
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.available ? '✓ Available' : '✕ Unavailable'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditMenuItem(item)}
                        className="flex-1 btn-outline flex items-center justify-center gap-2 text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="flex-1 btn-danger flex items-center justify-center gap-2 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Library Tab */}
        {activeTab === 'global-library' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-8 h-8" />
                  Global Dish Library
                </h2>
                <p className="text-white opacity-90 mt-1">
                  Add popular dishes to your menu with one click - ingredients auto-mapped!
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="glass animate-slide-in-left">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white opacity-60" />
                  <input
                    type="text"
                    placeholder="Search dishes... (e.g., Butter Chicken, Paneer Tikka)"
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-purple-400 text-white placeholder-white placeholder-opacity-60"
                  />
                </div>

                {/* Filter Row */}
                <div className="flex items-center gap-4 flex-wrap">
                  <select
                    value={globalSelectedCategory}
                    onChange={(e) => setGlobalSelectedCategory(e.target.value)}
                    className="px-4 py-2 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-lg text-white"
                    style={{ color: 'white' }}
                  >
                    <option value="" style={{ background: '#1f2937', color: 'white' }}>All Categories</option>
                    {globalCategories.map((cat) => (
                      <option key={cat} value={cat} style={{ background: '#1f2937', color: 'white' }}>{cat}</option>
                    ))}
                  </select>

                  <select
                    value={globalSelectedCuisine}
                    onChange={(e) => setGlobalSelectedCuisine(e.target.value)}
                    className="px-4 py-2 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-lg text-white"
                    style={{ color: 'white' }}
                  >
                    <option value="" style={{ background: '#1f2937', color: 'white' }}>All Cuisines</option>
                    {globalCuisines.map((cuisine) => (
                      <option key={cuisine} value={cuisine} style={{ background: '#1f2937', color: 'white' }}>{cuisine}</option>
                    ))}
                  </select>

                  {(globalSearchQuery || globalSelectedCategory || globalSelectedCuisine) && (
                    <button
                      onClick={clearGlobalFilters}
                      className="btn-outline flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  )}

                  <span className="text-white opacity-80 ml-auto">
                    {globalDishes.length} dishes found
                  </span>
                </div>
              </div>
            </div>

            {/* Dishes Grid */}
            {globalLoading ? (
              <div className="glass text-center py-16">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">Loading dishes...</p>
              </div>
            ) : globalDishes.length === 0 ? (
              <div className="glass text-center py-16">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-white opacity-50" />
                <p className="text-white text-lg font-medium mb-2">No dishes found</p>
                <p className="text-white opacity-70 text-sm mb-4">Try adjusting your search or filters</p>
                <button onClick={clearGlobalFilters} className="btn-modern">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {globalDishes.map((dish, index) => (
                  <div key={dish.id} className="menu-card animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    {/* Dish Image */}
                    <div className="menu-image">
                      {dish.image_url ? (
                        <img src={dish.image_url} alt={dish.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                          <ChefHat className="w-16 h-16 text-white opacity-50" />
                        </div>
                      )}
                      <div className="menu-overlay">
                        <div className="flex items-center gap-2">
                          {dish.is_vegetarian && (
                            <span className="text-white text-xs font-bold px-3 py-1 bg-green-600 rounded-full">
                              🟢 VEG
                            </span>
                          )}
                          <span className="text-white text-xs font-medium px-3 py-1 bg-black bg-opacity-50 rounded-full">
                            {dish.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-900 text-lg flex-1">{dish.name}</h3>
                        <span className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          ₹{dish.default_price}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2" style={{ minHeight: '2.5rem' }}>
                        {dish.description || 'Delicious dish from our global collection'}
                      </p>

                      <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {dish.prep_time_minutes} min
                        </span>
                        {dish.spice_level > 0 && (
                          <span className="flex items-center gap-1">
                            {'🌶️'.repeat(dish.spice_level)}
                          </span>
                        )}
                        <span className="ml-auto">
                          {dish.cuisine}
                        </span>
                      </div>

                      <button
                        onClick={() => handlePreviewGlobalDish(dish)}
                        className="w-full btn-modern flex items-center justify-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Add to Menu
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white">📦 Inventory Management</h2>
              <button
                onClick={handleAddInventory}
                className="btn-modern flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Ingredient
              </button>
            </div>

            {/* Low Stock Alert Banner */}
            {inventory.filter(item => item.status === 'critical' || item.status === 'low').length > 0 && (
              <div className="glass animate-slide-in-left" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)', border: '2px solid rgba(239, 68, 68, 0.3)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Low Stock Alert!</h3>
                    <p className="text-white opacity-80 text-sm">
                      {inventory.filter(item => item.status === 'critical').length} critical items, 
                      {inventory.filter(item => item.status === 'low').length} low stock items
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Inventory Grid - Professional Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventory.map((item, index) => (
                <div key={item.id} className="menu-card animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  {/* Image Section */}
                  <div className="menu-image">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <Package className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}
                    {/* Status Overlay */}
                    <div className="menu-overlay">
                      <span className={`text-white text-xs font-bold px-3 py-1 rounded-full ${
                        item.status === 'critical' ? 'bg-red-600' : 
                        item.status === 'low' ? 'bg-yellow-600' : 
                        'bg-green-600'
                      }`}>
                        {item.status === 'critical' ? '🚨 CRITICAL' : 
                         item.status === 'low' ? '⚠️ LOW STOCK' : 
                         '✓ IN STOCK'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.supplier || 'No supplier'}</p>
                      </div>
                      <span className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ${item.cost_per_unit}/{item.unit}
                      </span>
                    </div>

                    {/* Stock Info */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Current Stock:</span>
                        <span className={`text-lg font-bold ${
                          item.status === 'critical' ? 'text-red-600' : 
                          item.status === 'low' ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Min Required:</span>
                        <span className="text-sm font-semibold text-gray-900">{item.min_quantity} {item.unit}</span>
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            item.status === 'critical' ? 'bg-red-600' : 
                            item.status === 'low' ? 'bg-yellow-600' : 
                            'bg-green-600'
                          }`}
                          style={{ width: `${Math.min((item.quantity / item.min_quantity) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Expiry Date */}
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Expires: <span className="font-semibold">{new Date(item.expiry_date).toLocaleDateString()}</span>
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditInventory(item)}
                        className="flex-1 btn-outline flex items-center justify-center gap-2 text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteInventory(item.id)}
                        className="flex-1 btn-danger flex items-center justify-center gap-2 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {inventory.length === 0 && (
                <div className="col-span-full glass text-center py-16">
                  <Package className="w-16 h-16 mx-auto mb-4 text-white opacity-50" />
                  <p className="text-white text-lg font-medium mb-2">No inventory items yet</p>
                  <p className="text-white opacity-70 text-sm mb-4">Start by adding your first ingredient</p>
                  <button onClick={handleAddInventory} className="btn-modern">
                    <Plus className="w-5 h-5 inline mr-2" />
                    Add First Item
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white">👥 Staff Management</h2>
              <button
                onClick={handleAddStaff}
                className="btn-modern flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Staff Member
              </button>
            </div>

            <div className="glass overflow-hidden animate-scale-in">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-white hover:bg-opacity-50 transition-all duration-200 animate-fade-in">
                      <td className="px-6 py-4 text-white font-semibold">John Doe</td>
                      <td className="px-6 py-4 text-white">staff@demo.com</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full font-bold">Staff</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-bold">Active</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="btn-outline text-sm px-3 py-1">
                            Edit
                          </button>
                          <button className="btn-danger text-sm px-3 py-1">Remove</button>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-white hover:bg-opacity-50 transition-all duration-200 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                      <td className="px-6 py-4 text-white font-semibold">Jane Chef</td>
                      <td className="px-6 py-4 text-white">chef@demo.com</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full font-bold">Chef</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-bold">Active</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="btn-outline text-sm px-3 py-1">
                            Edit
                          </button>
                          <button className="btn-danger text-sm px-3 py-1">Remove</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6 animate-fade-in">
              <div className="w-12 h-12 rounded-full flex items-center justify-center animate-pulse" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">✨ AI-Powered Insights</h2>
            </div>

            {/* Loading State */}
            {!aiInsightsLoaded ? (
              <div className="glass text-center py-16 animate-fade-in">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center animate-spin" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <p className="text-white text-lg font-medium">Analyzing data with AI...</p>
                <p className="text-white opacity-70 text-sm mt-2">This will take just a moment</p>
              </div>
            ) : (
              <>
                {/* Smart Pricing Suggestions */}
                <div className="glass animate-slide-in-left">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                Smart Pricing Suggestions
              </h3>
              <div className="space-y-3">
                {aiInsights.priceSuggestions.map((suggestion, index) => (
                  <div key={index} className="card animate-scale-in" style={{ animationDelay: `${index * 0.1}s`, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-white">{suggestion.dish}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-white opacity-75">${suggestion.current}</span>
                        <span className="text-white opacity-50">→</span>
                        <span className="text-green-400 font-bold text-lg">${suggestion.suggested}</span>
                      </div>
                    </div>
                    <p className="text-sm text-white opacity-80">{suggestion.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Grocery List Generation */}
            <div className="glass animate-slide-in-right">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                AI-Generated Grocery List
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {['Tomatoes - 20kg', 'Cheese - 15kg', 'Flour - 30kg', 'Olive Oil - 5L'].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <input type="checkbox" className="w-5 h-5 rounded" />
                    <span className="text-white font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full btn-modern">
                Generate New List Based on Trends
              </button>
            </div>

            {/* Inventory Suggestions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Inventory Optimization Suggestions
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="font-medium text-gray-900 mb-1">Reduce Tomato Order Next Week</p>
                  <p className="text-sm text-gray-600">
                    Based on usage trends, reduce order by 15% to minimize waste
                  </p>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="font-medium text-gray-900 mb-1">Increase Cheese Stock</p>
                  <p className="text-sm text-gray-600">
                    Pizza demand trending up 25% - recommend 30% stock increase
                  </p>
                </div>
              </div>
            </div>

            {/* Near-Expiry Pricing */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-orange-600" />
                Near-Expiry Smart Pricing
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">Caesar Salad</p>
                    <span className="text-orange-600 font-bold">-20% Suggested</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Lettuce expires in 2 days - reduce price to increase sales
                  </p>
                  <button className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm">
                    Apply Discount
                  </button>
                </div>
              </div>
            </div>
              </>
            )}
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Billing & Transactions</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600 text-sm mb-2">Total Revenue (Month)</p>
                <p className="text-3xl font-bold text-gray-900">${(stats.weekSales * 4.3).toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600 text-sm mb-2">Pending Payments</p>
                <p className="text-3xl font-bold text-yellow-600">$245.00</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600 text-sm mb-2">Completed Transactions</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalOrders}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">#ORD-001</td>
                    <td className="px-6 py-4 text-gray-600">Oct 13, 2025</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">$45.99</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Paid</span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View Receipt
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Menu Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in" style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-dark rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl">
            <div className="p-6 border-b border-white border-opacity-20 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <ChefHat className="w-7 h-7" />
                {selectedMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h3>
              <button onClick={() => setShowMenuModal(false)} className="text-white hover:text-red-400 transition btn-icon">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Name</label>
                <input
                  type="text"
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-white placeholder-opacity-60"
                  placeholder="e.g., Margherita Pizza"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Description</label>
                <textarea
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-white placeholder-opacity-60"
                  rows="3"
                  placeholder="Describe the dish..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={menuForm.price}
                    onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-white placeholder-opacity-60"
                    placeholder="12.99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Category</label>
                  <select
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white"
                  >
                    <option value="Appetizer">Appetizer</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Beverage">Beverage</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Pasta">Pasta</option>
                    <option value="Salad">Salad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Image URL</label>
                <input
                  type="text"
                  value={menuForm.image_url}
                  onChange={(e) => setMenuForm({ ...menuForm, image_url: e.target.value })}
                  className="w-full px-4 py-3 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-white placeholder-opacity-60"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-white bg-opacity-10 rounded-lg">
                <input
                  type="checkbox"
                  checked={menuForm.is_vegetarian}
                  onChange={(e) => setMenuForm({ ...menuForm, is_vegetarian: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label className="text-sm font-bold text-white">Vegetarian Dish</label>
              </div>
            </div>

            <div className="p-6 border-t border-white border-opacity-20 flex gap-3">
              <button
                onClick={() => setShowMenuModal(false)}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMenuItem}
                className="flex-1 btn-success flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in" style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-dark rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl">
            <div className="p-6 border-b border-white border-opacity-20 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Package className="w-7 h-7" />
                {selectedInventory ? 'Edit Inventory Item' : 'Add Inventory Item'}
              </h3>
              <button onClick={() => setShowInventoryModal(false)} className="text-white hover:text-red-400 transition btn-icon">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Ingredient Name</label>
                <input
                  type="text"
                  value={inventoryForm.name}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-white placeholder-opacity-60"
                  placeholder="e.g., Tomatoes"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Quantity</label>
                  <input
                    type="number"
                    value={inventoryForm.quantity}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-white placeholder-opacity-60"
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Unit</label>
                  <select
                    value={inventoryForm.unit}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="L">Liters (L)</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="bunches">Bunches</option>
                    <option value="g">Grams (g)</option>
                    <option value="ml">Milliliters (ml)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Minimum Quantity (Alert Threshold)</label>
                <input
                  type="number"
                  value={inventoryForm.min_quantity}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, min_quantity: e.target.value })}
                  className="w-full px-4 py-3 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-white placeholder-opacity-60"
                  placeholder="10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={inventoryForm.expiry_date}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, expiry_date: e.target.value })}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Cost per Unit ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={inventoryForm.cost_per_unit}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, cost_per_unit: e.target.value })}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-white placeholder-opacity-60"
                    placeholder="2.50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Supplier Name</label>
                <input
                  type="text"
                  value={inventoryForm.supplier}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, supplier: e.target.value })}
                  className="w-full px-4 py-3 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-white placeholder-opacity-60"
                  placeholder="e.g., Fresh Farm Co"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Image URL</label>
                <input
                  type="text"
                  value={inventoryForm.image_url}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, image_url: e.target.value })}
                  className="w-full px-4 py-3 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-white placeholder-opacity-60"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="p-6 border-t border-white border-opacity-20 flex gap-3">
              <button
                onClick={() => setShowInventoryModal(false)}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInventory}
                className="flex-1 btn-success flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {selectedInventory ? 'Update Item' : 'Add to Inventory'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Dish Preview Modal */}
      {showGlobalPreview && selectedGlobalDish && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in" style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-dark rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl">
            <div className="p-6 border-b border-white border-opacity-20 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-7 h-7" />
                Preview: {selectedGlobalDish.name}
              </h3>
              <button 
                onClick={() => {
                  setShowGlobalPreview(false);
                  setSelectedGlobalDish(null);
                  setGlobalPreviewData(null);
                }}
                className="text-white hover:text-red-400 transition btn-icon"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Dish Info */}
              <div className="flex items-start gap-4">
                {selectedGlobalDish.image_url && (
                  <img 
                    src={selectedGlobalDish.image_url} 
                    alt={selectedGlobalDish.name}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-white mb-2">{selectedGlobalDish.name}</h4>
                  <p className="text-white opacity-80 text-sm mb-2">{selectedGlobalDish.description}</p>
                  <div className="flex items-center gap-3 text-sm text-white opacity-70">
                    <span>{selectedGlobalDish.cuisine} • {selectedGlobalDish.category}</span>
                    <span>⏱️ {selectedGlobalDish.prep_time_minutes} min</span>
                    {selectedGlobalDish.spice_level > 0 && (
                      <span>🌶️ {'🌶️'.repeat(selectedGlobalDish.spice_level)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Custom Price Input */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Set Your Menu Price (Base: ₹{selectedGlobalDish.default_price})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-purple-400 text-white placeholder-white placeholder-opacity-60"
                  placeholder="Enter price"
                />
              </div>

              {/* Cost & Stock Analysis */}
              {globalPreviewData && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Cost Analysis */}
                  <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)', border: '2px solid rgba(59, 130, 246, 0.3)' }}>
                    <h4 className="text-sm font-bold text-white mb-3">💰 Cost Analysis</h4>
                    <div className="space-y-2 text-sm text-white">
                      <div className="flex justify-between">
                        <span className="opacity-80">Ingredient Cost:</span>
                        <span className="font-semibold">₹{globalPreviewData.total_cost?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-80">Menu Price:</span>
                        <span className="font-semibold">₹{customPrice || selectedGlobalDish.default_price}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-white border-opacity-20">
                        <span className="font-medium">Profit Margin:</span>
                        <span className={`font-bold ${
                          (customPrice || selectedGlobalDish.default_price) - (globalPreviewData.total_cost || 0) > 0 
                            ? 'text-green-400' 
                            : 'text-red-400'
                        }`}>
                          ₹{((customPrice || selectedGlobalDish.default_price) - (globalPreviewData.total_cost || 0)).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs opacity-70">
                        <span>Margin %:</span>
                        <span>
                          {(((customPrice || selectedGlobalDish.default_price) - (globalPreviewData.total_cost || 0)) / 
                            (customPrice || selectedGlobalDish.default_price) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Impact */}
                  <div className="card" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)', border: '2px solid rgba(168, 85, 247, 0.3)' }}>
                    <h4 className="text-sm font-bold text-white mb-3">📊 Stock Impact</h4>
                    <div className="space-y-2 text-sm text-white">
                      <div className="flex justify-between">
                        <span className="opacity-80">Total Ingredients:</span>
                        <span className="font-semibold">{globalPreviewData.total_ingredients}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-80">Can Make:</span>
                        <span className="font-semibold">{globalPreviewData.can_make_servings} servings</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-80">Low Stock Items:</span>
                        <span className="font-semibold text-yellow-400">
                          {globalPreviewData.ingredients?.filter(i => i.best_match && i.best_match.stock_status === 'low').length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-80">Need to Create:</span>
                        <span className="font-semibold text-yellow-400">
                          {globalPreviewData.ingredients?.filter(i => !i.best_match).length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Ingredient Mapping */}
              {globalPreviewData && (
                <div>
                  <h4 className="text-lg font-bold text-white mb-3">Ingredient Mapping Preview</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {globalPreviewData.ingredients?.map((ing, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          ing.best_match
                            ? 'bg-green-500 bg-opacity-20 border-green-500 border-opacity-30'
                            : 'bg-yellow-500 bg-opacity-20 border-yellow-500 border-opacity-30'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              {ing.global_ingredient_name}
                            </span>
                            <span className="text-xs text-white opacity-60">
                              ({ing.quantity_needed} {ing.unit})
                            </span>
                          </div>
                          {ing.best_match ? (
                            <div className="text-sm text-white opacity-80 mt-1">
                              → Mapped to: <span className="font-medium">{ing.best_match.name}</span>
                              <span className="ml-2 text-xs text-green-400">
                                ({Math.round(ing.best_match.similarity_score * 100)}% match)
                              </span>
                            </div>
                          ) : (
                            <div className="text-sm text-yellow-300 mt-1">
                              → Will be created (no match found)
                            </div>
                          )}
                        </div>
                        {ing.best_match ? (
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        ) : (
                          <Plus className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-white border-opacity-20 flex gap-3">
              <button
                onClick={() => {
                  setShowGlobalPreview(false);
                  setSelectedGlobalDish(null);
                  setGlobalPreviewData(null);
                }}
                className="flex-1 btn-outline"
                disabled={addingDish}
              >
                Cancel
              </button>
              <button
                onClick={handleAddGlobalDish}
                disabled={addingDish || !customPrice}
                className="flex-1 btn-success flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingDish ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirm & Add to Menu
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Add Staff Member</h3>
              <button onClick={() => setShowStaffModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="staff">Staff</option>
                    <option value="chef">Chef</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowStaffModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStaff}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Add Staff Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
