import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ordersAPI } from '../services/api';
import {
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Redirect managers to their dashboard
    if (user?.role === 'manager') {
      navigate('/manager');
    }
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      const response = await ordersAPI.getAll();
      const orders = response.data;

      setStats({
        totalOrders: orders.length,
        activeOrders: orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length,
        completedOrders: orders.filter((o) => o.status === 'completed').length,
        revenue: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      preparing: <Package className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
    };
    return icons[status] || null;
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-secondary-800">Dashboard</h1>
              <p className="text-secondary-600">
                Welcome back, <span className="font-semibold">{user?.name || user?.email}</span>
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/menu"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Browse Menu
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-secondary-800 mt-2">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 text-sm font-medium">Active Orders</p>
                <p className="text-3xl font-bold text-secondary-800 mt-2">{stats.activeOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-secondary-800 mt-2">{stats.completedOrders}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 text-sm font-medium">Revenue</p>
                <p className="text-3xl font-bold text-secondary-800 mt-2">
                  ${stats.revenue.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-secondary-200">
            <h2 className="text-xl font-bold text-secondary-800">Recent Orders</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <p className="text-center text-secondary-500 py-8">Loading orders...</p>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                <p className="text-secondary-600 mb-4">No orders yet</p>
                <Link
                  to="/menu"
                  className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Order Now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-secondary-800">Order #{order.id}</p>
                      <p className="text-sm text-secondary-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                      <p className="font-bold text-secondary-800">${order.total_amount?.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link
            to="/menu"
            className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-lg p-6 hover:shadow-lg transition"
          >
            <ShoppingBag className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">Browse Menu</h3>
            <p className="text-primary-100">Explore our delicious menu items</p>
          </Link>

          <Link
            to="/orders"
            className="bg-gradient-to-br from-accent-500 to-accent-600 text-white rounded-lg p-6 hover:shadow-lg transition"
          >
            <Clock className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">My Orders</h3>
            <p className="text-accent-100">Track your order status</p>
          </Link>

          <Link
            to="/cart"
            className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white rounded-lg p-6 hover:shadow-lg transition"
          >
            <Package className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">Shopping Cart</h3>
            <p className="text-secondary-100">Review items before checkout</p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
