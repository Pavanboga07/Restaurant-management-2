import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { menuAPI } from '../services/api';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';
import { Plus, ShoppingCart, Search, Filter, ArrowLeft } from 'lucide-react';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const addItem = useCartStore((state) => state.addItem);
  const cartItemCount = useCartStore((state) => state.getItemCount());

  const categories = ['All', 'Pizza', 'Pasta', 'Salad', 'Curry', 'Dessert', 'Appetizer', 'Beverage'];

  useEffect(() => {
    loadMenu();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchTerm, selectedCategory, menuItems]);

  const loadMenu = async () => {
    // Check if we already have menu data (prevents re-fetching on navigation)
    if (menuItems.length > 0 && !searchTerm && selectedCategory === 'All') {
      setLoading(false);
      return;
    }

    try {
      const response = await menuAPI.getAll();
      setMenuItems(response.data);
      setFilteredItems(response.data);
    } catch (error) {
      console.error('Failed to load menu:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = menuItems;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const handleAddToCart = (item) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image_url,
    });
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-10">
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
                <h1 className="text-2xl font-bold text-secondary-800">Menu</h1>
                <p className="text-secondary-600">Browse our delicious offerings</p>
              </div>
            </div>
            <Link
              to="/cart"
              className="relative px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            <p className="text-secondary-600 mt-4">Loading menu...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Filter className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-600">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Image */}
                <div className="h-48 bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">🍽️</span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-secondary-800">{item.name}</h3>
                    <span className="text-xl font-bold text-primary-600">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-secondary-600 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Category & Allergens */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full">
                      {item.category}
                    </span>
                    {item.allergens && item.allergens.length > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        ⚠️ {item.allergens.join(', ')}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.available}
                    className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {item.available ? 'Add to Cart' : 'Not Available'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Menu;
