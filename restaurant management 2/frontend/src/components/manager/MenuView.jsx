import React, { useState, useEffect } from 'react';
import { menuAPI } from '../../services/api';
import Card from '../shared/Card';

const MenuView = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    filterByCategory();
  }, [selectedCategory, menuItems]);

  const fetchMenuItems = async () => {
    try {
      const response = await menuAPI.getAll();
      const available = response.data.filter(item => item.is_available);
      setMenuItems(available);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const filterByCategory = () => {
    if (selectedCategory === 'All') {
      setFilteredItems(menuItems);
    } else {
      setFilteredItems(menuItems.filter(item => item.category === selectedCategory));
    }
  };

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(c => c.id !== itemId));
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

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-50 to-red-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-800 mb-2'>🍽️ Our Menu</h1>
          <p className='text-gray-600'>Browse our delicious offerings</p>
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
              <p className='text-sm text-gray-600 mb-2'>{item.description}</p>
              <div className='flex justify-between items-center'>
                <span className='text-2xl font-bold text-orange-600'>₹{item.price}</span>
                <button
                  onClick={() => addToCart(item)}
                  className='px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition'
                >
                  + Add
                </button>
              </div>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className='text-center py-12 text-gray-500'>
            <p className='text-xl'>No items in this category</p>
          </div>
        )}

        {/* Floating Cart Button */}
        {cart.length > 0 && (
          <div className='fixed bottom-6 right-6 z-50'>
            <button
              onClick={() => setShowCart(!showCart)}
              className='bg-orange-600 text-white px-6 py-4 rounded-full shadow-2xl hover:bg-orange-700 transition flex items-center gap-3'
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
              className='fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl p-6 overflow-y-auto'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold'>Your Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className='text-gray-500 hover:text-gray-700 text-2xl'
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
                      <div key={item.id} className='flex gap-4 p-4 bg-gray-50 rounded-lg'>
                        {item.image_url && (
                          <img
                            src={`http://localhost:8000${item.image_url}`}
                            alt={item.name}
                            className='w-20 h-20 object-cover rounded'
                          />
                        )}
                        <div className='flex-1'>
                          <h4 className='font-bold'>{item.name}</h4>
                          <p className='text-orange-600 font-bold'>₹{item.price}</p>
                          <div className='flex items-center gap-2 mt-2'>
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className='bg-gray-200 px-3 py-1 rounded hover:bg-gray-300'
                            >
                              -
                            </button>
                            <span className='font-bold'>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className='bg-gray-200 px-3 py-1 rounded hover:bg-gray-300'
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className='ml-auto text-red-600 hover:text-red-800'
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className='border-t pt-4'>
                    <div className='flex justify-between text-xl font-bold mb-4'>
                      <span>Total:</span>
                      <span className='text-orange-600'>₹{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <button
                      className='w-full bg-orange-600 text-white py-4 rounded-lg hover:bg-orange-700 transition font-bold text-lg'
                      onClick={() => alert('Order placement feature coming soon! Cart: ' + JSON.stringify(cart))}
                    >
                      Call Waiter to Order
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuView;
