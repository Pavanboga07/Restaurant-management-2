import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { menuAPI, ordersAPI, inventoryAPI, staffAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  ChefHat,
  Package,
  Users,
  Receipt,
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Search,
  Brain,
  ShoppingCart,
  CalendarClock,
  Sparkles,
  X,
  Save,
  Upload,
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
  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    quantity: '',
    unit: 'kg',
    min_quantity: '',
    expiry_date: '',
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

  useEffect(() => {
    // Redirect if not manager
    if (user?.role !== 'manager') {
      toast.error('Access denied. Manager role required.');
      navigate('/dashboard');
      return;
    }
    // Only load data for active tab
    loadTabData(activeTab);
  }, [user, navigate, activeTab]);

  const loadTabData = useCallback(async (tab) => {
    if (tab === 'overview' && menuItems.length === 0) {
      loadDashboardData();
    } else if (tab === 'menu' && menuItems.length === 0) {
      loadMenuData();
    }
    // Add other tab-specific loading as needed
  }, [menuItems]);

  const loadMenuData = async () => {
    try {
      const menuRes = await menuAPI.getAll();
      setMenuItems(menuRes.data);
    } catch (error) {
      console.error('Failed to load menu:', error);
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

      // Generate mock AI insights (replace with actual AI service calls)
      generateMockAIInsights(menuRes.data, orders);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
      loadDashboardData();
    } catch (error) {
      console.error('Save menu error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to save menu item';
      toast.error(errorMsg);
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await menuAPI.delete(itemId);
      toast.success('Menu item deleted');
      loadDashboardData();
    } catch (error) {
      console.error('Delete menu error:', error);
      toast.error('Failed to delete menu item');
    }
  };

  // Inventory Management Functions
  const handleAddInventory = () => {
    setInventoryForm({
      name: '',
      quantity: '',
      unit: 'kg',
      min_quantity: '',
      expiry_date: '',
    });
    setShowInventoryModal(true);
  };

  const handleSaveInventory = async () => {
    try {
      // Call inventory API (implement when backend ready)
      toast.success('Inventory item added successfully');
      setShowInventoryModal(false);
    } catch (error) {
      toast.error('Failed to save inventory item');
    }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.name}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-6">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'menu', label: 'Menu', icon: ChefHat },
              { id: 'inventory', label: 'Inventory', icon: Package },
              { id: 'staff', label: 'Staff', icon: Users },
              { id: 'billing', label: 'Billing', icon: Receipt },
              { id: 'ai', label: 'AI Insights', icon: Brain },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-sm">Today's Sales</p>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">${stats.todaySales.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-sm">Week Sales</p>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">${stats.weekSales.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-sm">Total Orders</p>
                  <Receipt className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-sm">Avg Order Value</p>
                  <DollarSign className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">${stats.avgOrderValue.toFixed(2)}</p>
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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
              <button
                onClick={handleAddMenuItem}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <Plus className="w-5 h-5" />
                Add Menu Item
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="h-40 bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ChefHat className="w-16 h-16 text-white" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <span className="text-lg font-bold text-primary-600">${item.price}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {item.category}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditMenuItem(item)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
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

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
              <button
                onClick={handleAddInventory}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <Plus className="w-5 h-5" />
                Add Ingredient
              </button>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-red-900">Low Stock Alerts</h3>
              </div>
              <div className="space-y-2">
                {aiInsights.lowStock.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Current: {item.current}{item.unit} | Min: {item.min}{item.unit}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.urgency === 'high'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {item.urgency} urgency
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ingredient</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quantity</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Unit</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Expiry Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {aiInsights.lowStock.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-gray-900">{item.current}</td>
                      <td className="px-6 py-4 text-gray-600">{item.unit}</td>
                      <td className="px-6 py-4 text-gray-600">2025-10-20</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          Low Stock
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
              <button
                onClick={handleAddStaff}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <Plus className="w-5 h-5" />
                Add Staff Member
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">John Doe</td>
                    <td className="px-6 py-4 text-gray-600">staff@demo.com</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Staff</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">Remove</button>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">Jane Chef</td>
                    <td className="px-6 py-4 text-gray-600">chef@demo.com</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Chef</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">Remove</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h2>
            </div>

            {/* Smart Pricing Suggestions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Smart Pricing Suggestions
              </h3>
              <div className="space-y-3">
                {aiInsights.priceSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{suggestion.dish}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600">${suggestion.current}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-green-600 font-bold">${suggestion.suggested}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{suggestion.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Grocery List Generation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                AI-Generated Grocery List
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {['Tomatoes - 20kg', 'Cheese - 15kg', 'Flour - 30kg', 'Olive Oil - 5L'].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <input type="checkbox" className="w-4 h-4 text-primary-600" />
                    <span className="text-gray-900">{item}</span>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h3>
              <button onClick={() => setShowMenuModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Margherita Pizza"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="3"
                  placeholder="Describe the dish..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={menuForm.price}
                    onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="12.99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="text"
                  value={menuForm.image_url}
                  onChange={(e) => setMenuForm({ ...menuForm, image_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={menuForm.is_vegetarian}
                  onChange={(e) => setMenuForm({ ...menuForm, is_vegetarian: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label className="text-sm font-medium text-gray-700">Vegetarian</label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowMenuModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMenuItem}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Add Inventory Item</h3>
              <button onClick={() => setShowInventoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ingredient Name</label>
                <input
                  type="text"
                  value={inventoryForm.name}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Tomatoes"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={inventoryForm.quantity}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <select
                    value={inventoryForm.unit}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="pcs">pcs</option>
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Quantity (Alert Threshold)</label>
                <input
                  type="number"
                  value={inventoryForm.min_quantity}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, min_quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={inventoryForm.expiry_date}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, expiry_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowInventoryModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInventory}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Add to Inventory
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
