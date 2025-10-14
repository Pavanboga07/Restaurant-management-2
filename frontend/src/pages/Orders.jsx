import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      // Sort by date, newest first
      const sortedOrders = response.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      preparing: 'bg-blue-100 text-blue-800 border-blue-300',
      ready: 'bg-purple-100 text-purple-800 border-purple-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-5 h-5" />,
      preparing: <Package className="w-5 h-5" />,
      ready: <AlertCircle className="w-5 h-5" />,
      completed: <CheckCircle className="w-5 h-5" />,
      cancelled: <XCircle className="w-5 h-5" />,
    };
    return icons[status] || <Package className="w-5 h-5" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="p-2 hover:bg-secondary-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-secondary-800">My Orders</h1>
                <p className="text-secondary-600">Track your order history</p>
              </div>
            </div>
            <Link
              to="/menu"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Order Again
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            <p className="text-secondary-600 mt-4">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-secondary-800 mb-2">No orders yet</h2>
            <p className="text-secondary-600 mb-6">
              Start ordering from our delicious menu!
            </p>
            <Link
              to="/menu"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                {/* Order Header */}
                <div className="bg-secondary-50 border-b border-secondary-200 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-secondary-800 mb-1">
                        Order #{order.id}
                      </h3>
                      <p className="text-secondary-600 text-sm">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold border-2 ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </div>
                      <p className="text-2xl font-bold text-secondary-800 mt-2">
                        ${order.total_amount?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-6">
                  {order.items && order.items.length > 0 ? (
                    <div className="space-y-3">
                      <p className="font-semibold text-secondary-800 mb-3">Order Items:</p>
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-secondary-100 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🍽️</span>
                            <div>
                              <p className="font-medium text-secondary-800">
                                {item.menu_item?.name || `Item ${item.menu_item_id}`}
                              </p>
                              <p className="text-sm text-secondary-600">
                                Qty: {item.quantity} × ${item.price?.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-secondary-800">
                            ${(item.quantity * (item.price || 0)).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-secondary-600">No items in this order</p>
                  )}

                  {/* Order Info */}
                  <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-secondary-200">
                    <div>
                      <p className="text-sm text-secondary-600">Order Type</p>
                      <p className="font-semibold text-secondary-800 capitalize">
                        {order.order_type || 'Delivery'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-600">Payment Status</p>
                      <p className="font-semibold text-secondary-800">
                        {order.payment_status || 'Pending'}
                      </p>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="mt-6 pt-4 border-t border-secondary-200">
                    <p className="text-sm font-semibold text-secondary-700 mb-3">
                      Order Progress
                    </p>
                    <div className="flex items-center justify-between">
                      {['pending', 'preparing', 'ready', 'completed'].map((status, index) => (
                        <div key={status} className="flex-1 relative">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                order.status === status ||
                                (order.status === 'completed' && index <= 3)
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-secondary-200 text-secondary-500'
                              }`}
                            >
                              {getStatusIcon(status)}
                            </div>
                            <p className="text-xs text-secondary-600 mt-2 capitalize">
                              {status}
                            </p>
                          </div>
                          {index < 3 && (
                            <div
                              className={`absolute top-5 left-1/2 w-full h-0.5 ${
                                order.status === 'completed' ||
                                (['preparing', 'ready', 'completed'].includes(order.status) &&
                                  index < 2)
                                  ? 'bg-primary-600'
                                  : 'bg-secondary-200'
                              }`}
                            ></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
