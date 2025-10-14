import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { ChefHat, ShoppingCart, LogOut, User, LayoutDashboard, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition">
            <ChefHat className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">RestaurantOS</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary-600 font-medium transition"
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              to="/menu"
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary-600 font-medium transition"
            >
              <ChefHat className="w-5 h-5" />
              Menu
            </Link>
            
            {/* Show Global Dishes & Inventory for Managers */}
            {(user?.role === 'manager' || user?.role === 'admin') && (
              <>
                <Link
                  to="/global-dishes"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary-600 font-medium transition"
                >
                  <Sparkles className="w-5 h-5" />
                  Global Library
                </Link>
                <Link
                  to="/inventory"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary-600 font-medium transition"
                >
                  <ChefHat className="w-5 h-5" />
                  Inventory
                </Link>
              </>
            )}
            
            <Link
              to="/orders"
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary-600 font-medium transition"
            >
              <ShoppingCart className="w-5 h-5" />
              Orders
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative px-3 py-2 text-gray-700 hover:text-primary-600 font-medium transition"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name || user?.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-primary-600 transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
