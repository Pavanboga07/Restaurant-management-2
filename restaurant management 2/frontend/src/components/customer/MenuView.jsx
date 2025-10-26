import React, { useState, useEffect } from 'react';
import { menuAPI, tablesAPI, ordersAPI } from '../../services/api';
import Card from '../shared/Card';
import toast, { Toaster } from 'react-hot-toast';

const MenuView = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [showTableModal, setShowTableModal] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState('All');
  const [orderNotes, setOrderNotes] = useState({});
  const [showWaiterCall, setShowWaiterCall] = useState(false);

  useEffect(() => {
    fetchMenuItems();
    fetchTables();
    
    const savedTable = localStorage.getItem('customerTable');
    if (savedTable) {
      setSelectedTable(savedTable);
      setShowTableModal(false);
    }
  }, []);

  useEffect(() => {
    filterMenuItems();
  }, [selectedCategory, menuItems, searchQuery, dietFilter]);

  const fetchMenuItems = async () => {
    try {
      const response = await menuAPI.getAll();
      const available = response.data.filter(item => item.is_available);
      setMenuItems(available);
    } catch (error) {
      console.error('Error fetching menu:', error);
      toast.error('Failed to load menu');
    }
  };

  const fetchTables = async () => {
    try {
      const response = await tablesAPI.getAll();
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const filterMenuItems = () => {
    let filtered = menuItems;

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        item.category.toLowerCase().includes(query)
      );
    }

    // Diet filter (you can enhance this by adding tags to menu items)
    if (dietFilter === 'Veg') {
      filtered = filtered.filter(item => 
        item.category.toLowerCase().includes('veg') ||
        item.name.toLowerCase().includes('veg') ||
        item.description?.toLowerCase().includes('veg')
      );
    } else if (dietFilter === 'Non-Veg') {
      filtered = filtered.filter(item => 
        item.category.toLowerCase().includes('non-veg') ||
        item.name.toLowerCase().includes('chicken') ||
        item.name.toLowerCase().includes('meat') ||
        item.name.toLowerCase().includes('fish')
      );
    }

    setFilteredItems(filtered);
  };

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  const selectTable = () => {
    if (!selectedTable) {
      toast.error('Please select a table number');
      return;
    }
    localStorage.setItem('customerTable', selectedTable);
    setShowTableModal(false);
    toast.success(`Table ${selectedTable} selected!`);
  };

  const changeTable = () => {
    localStorage.removeItem('customerTable');
    setSelectedTable('');
    setShowTableModal(true);
    setCart([]);
    setOrderPlaced(false);
    setOrderNotes({});
  };

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      toast.success(`${item.name} quantity increased!`);
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
      toast.success(`${item.name} added to cart!`);
    }
  };

  const removeFromCart = (itemId) => {
    const item = cart.find(c => c.id === itemId);
    setCart(cart.filter(c => c.id !== itemId));
    // Remove notes for this item
    const newNotes = { ...orderNotes };
    delete newNotes[itemId];
    setOrderNotes(newNotes);
    toast.success(`${item.name} removed from cart`);
  };

  const updateQuantity = (itemId, change) => {
    setCart(cart.map(c => {
      if (c.id === itemId) {
        const newQty = c.quantity + change;
        return newQty > 0 ? { ...c, quantity: newQty } : c;
      }
      return c;
    }).filter(c => c.quantity > 0));
  };

  const updateItemNotes = (itemId, notes) => {
    setOrderNotes({ ...orderNotes, [itemId]: notes });
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const callWaiter = () => {
    setShowWaiterCall(true);
    toast.success('Waiter has been notified! 🔔');
    setTimeout(() => setShowWaiterCall(false), 3000);
  };

  const placeOrder = async () => {
    if (!selectedTable) {
      toast.error('Please select a table first');
      return;
    }

    if (cart.length === 0) {
      toast.error('Cart is empty!');
      return;
    }

    const loadingToast = toast.loading('Placing your order...');

    const orderData = {
      table_id: parseInt(selectedTable),
      items: cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        notes: orderNotes[item.id] || ''
      }))
    };

    try {
      const response = await ordersAPI.create(orderData);
      
      toast.dismiss(loadingToast);
      setCurrentOrderId(response.data.id);
      setOrderPlaced(true);
      setCart([]);
      setShowCart(false);
      setOrderNotes({});
      toast.success('Order placed successfully! 🎉', {
        duration: 4000,
        icon: '✅',
      });
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error placing order:', error);
      
      if (error.response) {
        toast.error(`Error: ${error.response.data.detail || 'Failed to place order'}`, {
          duration: 5000,
        });
      } else if (error.request) {
        toast.error('Cannot connect to server. Please check if backend is running.', {
          duration: 5000,
        });
      } else {
        toast.error('Failed to place order. Please try again.', {
          duration: 5000,
        });
      }
    }
  };

  const startNewOrder = () => {
    setOrderPlaced(false);
    setCurrentOrderId(null);
    setCart([]);
    setOrderNotes({});
  };

  // Table Selection Modal
  if (showTableModal) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4'>
        <Toaster position="top-center" />
        <Card className='max-w-md w-full'>
          <div className='text-center mb-6'>
            <div className='text-6xl mb-4'>🍽️</div>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>Welcome!</h1>
            <p className='text-gray-600'>Please select your table number to get started</p>
          </div>
          
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 text-lg focus:border-orange-500 focus:outline-none'
          >
            <option value=''>-- Select Your Table --</option>
            {tables.map(table => (
              <option key={table.id} value={table.id}>
                Table {table.table_number} (Seats {table.capacity})
              </option>
            ))}
          </select>
          
          <button
            onClick={selectTable}
            disabled={!selectedTable}
            className='w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition font-bold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed'
          >
            Continue to Menu →
          </button>
        </Card>
      </div>
    );
  }

  // Order Success Screen with Tracking
  if (orderPlaced) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4'>
        <Toaster position="top-center" />
        <Card className='max-w-md w-full text-center'>
          <div className='text-6xl mb-4 animate-bounce'>✅</div>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>Order Placed!</h1>
          <p className='text-gray-600 mb-4'>Order #{currentOrderId} has been sent to the kitchen</p>
          
          {/* Order Status Tracker */}
          <div className='bg-white border-2 border-blue-200 rounded-lg p-6 mb-6'>
            <h3 className='font-bold text-lg mb-4 text-gray-800'>Order Status</h3>
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold'>✓</div>
                <div className='text-left flex-1'>
                  <p className='font-semibold text-gray-800'>Order Received</p>
                  <p className='text-xs text-gray-500'>Your order has been confirmed</p>
                </div>
              </div>
              <div className='flex items-center gap-3 opacity-50'>
                <div className='w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center'>2</div>
                <div className='text-left flex-1'>
                  <p className='font-semibold text-gray-600'>Preparing</p>
                  <p className='text-xs text-gray-400'>Chef is cooking your food</p>
                </div>
              </div>
              <div className='flex items-center gap-3 opacity-50'>
                <div className='w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center'>3</div>
                <div className='text-left flex-1'>
                  <p className='font-semibold text-gray-600'>Ready to Serve</p>
                  <p className='text-xs text-gray-400'>Waiter will bring it shortly</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className='bg-blue-50 p-4 rounded-lg mb-6'>
            <p className='text-sm text-gray-700'>
              <strong>Table:</strong> #{selectedTable}
            </p>
            <p className='text-sm text-gray-700 mt-2'>
              ⏱️ Estimated time: 15-20 minutes
            </p>
          </div>
          
          <div className='flex gap-3'>
            <button
              onClick={startNewOrder}
              className='flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition font-bold'
            >
              Order More
            </button>
            <button
              onClick={changeTable}
              className='flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition font-bold'
            >
              Change Table
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-50 to-red-50'>
      <Toaster position="top-center" />
      
      <div className='container mx-auto px-4 py-6'>
        {/* Header */}
        <div className='bg-white rounded-lg shadow-md p-4 mb-4'>
          <div className='flex justify-between items-center mb-3'>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>🍽️ Our Menu</h1>
              <p className='text-gray-600 text-sm'>Table #{selectedTable}</p>
            </div>
            <div className='flex gap-2'>
              <button
                onClick={callWaiter}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium'
              >
                🔔 Call Waiter
              </button>
              <button
                onClick={changeTable}
                className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm'
              >
                Change Table
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <input
            type='text'
            placeholder='🔍 Search for dishes...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none'
          />
        </div>

        {/* Diet Filter */}
        <div className='flex gap-2 mb-4'>
          {['All', 'Veg', 'Non-Veg'].map(diet => (
            <button
              key={diet}
              onClick={() => setDietFilter(diet)}
              className={`px-4 py-2 rounded-full font-medium transition ${
                dietFilter === diet
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-green-100'
              }`}
            >
              {diet === 'Veg' && '🥗'} {diet === 'Non-Veg' && '🍗'} {diet}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className='flex gap-2 mb-6 overflow-x-auto pb-2'>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-orange-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-20'>
          {filteredItems.map(item => (
            <Card key={item.id} className='hover:shadow-xl transition-shadow'>
              {item.image_url && (
                <img
                  src={`http://localhost:8000${item.image_url}`}
                  alt={item.name}
                  className='w-full h-48 object-cover rounded-lg mb-4'
                />
              )}
              <h3 className='text-xl font-bold text-gray-800 mb-2'>{item.name}</h3>
              <p className='text-sm text-gray-600 mb-3 line-clamp-2'>{item.description}</p>
              <div className='flex justify-between items-center'>
                <span className='text-2xl font-bold text-orange-600'>₹{item.price}</span>
                <button
                  onClick={() => addToCart(item)}
                  className='px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium'
                >
                  + Add
                </button>
              </div>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className='text-center py-12 text-gray-500'>
            <div className='text-6xl mb-4'>🔍</div>
            <p className='text-xl'>No items found</p>
            <p className='text-sm mt-2'>Try a different search or filter</p>
          </div>
        )}

        {/* Waiter Call Notification */}
        {showWaiterCall && (
          <div className='fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-bounce'>
            <p className='font-bold'>🔔 Waiter notified! Coming to your table...</p>
          </div>
        )}

        {/* Floating Cart Button */}
        {cart.length > 0 && (
          <div className='fixed bottom-6 right-6 z-50'>
            <button
              onClick={() => setShowCart(!showCart)}
              className='bg-orange-600 text-white px-6 py-4 rounded-full shadow-2xl hover:bg-orange-700 transition flex items-center gap-3'
              style={{ animation: 'bounce 1s infinite' }}
            >
              <span className='text-xl'>🛒</span>
              <span className='font-bold'>Cart ({cart.length})</span>
              <span className='bg-white text-orange-600 px-3 py-1 rounded-full font-bold'>
                ₹{getTotalPrice().toFixed(2)}
              </span>
            </button>
          </div>
        )}

        {/* Cart Sidebar */}
        {showCart && (
          <div className='fixed inset-0 bg-black bg-opacity-50 z-50' onClick={() => setShowCart(false)}>
            <div
              className='fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl overflow-y-auto'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='p-6'>
                <div className='flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b'>
                  <h2 className='text-2xl font-bold'>Your Cart</h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className='text-gray-500 hover:text-gray-700 text-3xl'
                  >
                    ×
                  </button>
                </div>

                {cart.length === 0 ? (
                  <p className='text-gray-500 text-center py-12'>Your cart is empty</p>
                ) : (
                  <>
                    <div className='space-y-4 mb-6'>
                      {cart.map(item => (
                        <div key={item.id} className='p-4 bg-gray-50 rounded-lg'>
                          <div className='flex gap-4 mb-3'>
                            {item.image_url && (
                              <img
                                src={`http://localhost:8000${item.image_url}`}
                                alt={item.name}
                                className='w-20 h-20 object-cover rounded'
                              />
                            )}
                            <div className='flex-1'>
                              <h4 className='font-bold text-lg'>{item.name}</h4>
                              <p className='text-orange-600 font-bold text-lg'>₹{item.price}</p>
                              <div className='flex items-center gap-2 mt-2'>
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className='bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 font-bold'
                                >
                                  -
                                </button>
                                <span className='font-bold text-lg'>{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className='bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 font-bold'
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className='ml-auto text-red-600 hover:text-red-800 text-xl'
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Special Instructions */}
                          <input
                            type='text'
                            placeholder='✏️ Special instructions (e.g., extra spicy, no onions)'
                            value={orderNotes[item.id] || ''}
                            onChange={(e) => updateItemNotes(item.id, e.target.value)}
                            className='w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-orange-500 focus:outline-none'
                          />
                        </div>
                      ))}
                    </div>

                    <div className='border-t pt-4 sticky bottom-0 bg-white'>
                      <div className='flex justify-between text-xl font-bold mb-4'>
                        <span>Total:</span>
                        <span className='text-orange-600'>₹{getTotalPrice().toFixed(2)}</span>
                      </div>
                      <button
                        onClick={placeOrder}
                        className='w-full bg-orange-600 text-white py-4 rounded-lg hover:bg-orange-700 transition font-bold text-lg shadow-lg'
                      >
                        Place Order 🎉
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default MenuView;
