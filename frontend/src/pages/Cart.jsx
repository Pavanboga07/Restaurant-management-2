import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, ShoppingCart, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { useState } from 'react';

const Cart = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, removeItem, updateQuantity, clearCart, getTotal, getItemCount } = useCartStore();

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        restaurant_id: 1, // Demo Restaurant
        items: items.map((item) => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        total_amount: getTotal(),
        order_type: 'delivery',
        status: 'pending',
      };

      const response = await ordersAPI.create(orderData);
      
      toast.success('Order placed successfully! 🎉');
      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      toast.success('Item removed from cart');
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId, itemName) => {
    removeItem(itemId);
    toast.success(`${itemName} removed from cart`);
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                to="/menu"
                className="p-2 hover:bg-secondary-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-secondary-800">Shopping Cart</h1>
                <p className="text-secondary-600">{getItemCount()} items</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          // Empty Cart
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-secondary-800 mb-2">Your cart is empty</h2>
            <p className="text-secondary-600 mb-6">Add some delicious items from our menu!</p>
            <Link
              to="/menu"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md p-6 flex items-center gap-6"
                >
                  {/* Item Image */}
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-4xl">🍽️</span>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-secondary-800 mb-1">{item.name}</h3>
                    <p className="text-primary-600 font-semibold">${item.price.toFixed(2)} each</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border-2 border-secondary-300 hover:bg-secondary-100 transition flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-secondary-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg border-2 border-primary-600 bg-primary-50 hover:bg-primary-100 transition flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 text-primary-600" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-secondary-800">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item.id, item.name)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-bold text-secondary-800 mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-secondary-600">
                    <span>Subtotal ({getItemCount()} items)</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-secondary-600">
                    <span>Delivery Fee</span>
                    <span>$5.00</span>
                  </div>
                  <div className="flex justify-between text-secondary-600">
                    <span>Tax (10%)</span>
                    <span>${(getTotal() * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-secondary-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-secondary-800">
                      <span>Total</span>
                      <span>${(getTotal() * 1.1 + 5).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Proceed to Checkout
                    </>
                  )}
                </button>

                <Link
                  to="/menu"
                  className="block text-center mt-4 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
