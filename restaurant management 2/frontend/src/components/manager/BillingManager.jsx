import React, { useState, useEffect, useMemo, useRef } from 'react';
import { billsAPI, ordersAPI, tablesAPI } from '../../services/api';
import Card from '../shared/Card';
import PrintBill from './PrintBill';
import toast from 'react-hot-toast';

const BillingManager = () => {
  const [bills, setBills] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [filterStatus, setFilterStatus] = useState('Unpaid');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Payment state
  const [discountType, setDiscountType] = useState('none'); // none, percentage, flat
  const [discountValue, setDiscountValue] = useState(0);
  const [splitBy, setSplitBy] = useState(1);
  const [paymentMethods, setPaymentMethods] = useState([{ method: 'Cash', amount: 0 }]);
  const [tenderedAmount, setTenderedAmount] = useState(0);
  const [taxRate, setTaxRate] = useState(5); // 5% tax
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const printRef = useRef(null);

  useEffect(() => {
    fetchBills();
    fetchCompletedOrders();
    fetchTables();
    
    // Poll every 15 seconds
    const interval = setInterval(() => {
      fetchBills();
      fetchCompletedOrders();
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchBills = async () => {
    try {
      const response = await billsAPI.getAll();
      setBills(response.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Failed to load bills');
    }
  };

  const fetchCompletedOrders = async () => {
    try {
      const response = await ordersAPI.getAll(true);
      const readyOrCompleted = response.data.filter((order) => 
        order.status === 'Ready' || order.status === 'Completed'
      );
      setOrders(readyOrCompleted);
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  const generateBill = async (orderId) => {
    if (!orderId) return;
    try {
      const response = await billsAPI.create({ order_id: parseInt(orderId) });
      toast.success('Bill generated successfully!');
      fetchBills();
      fetchCompletedOrders();
      // Select the newly created bill
      const newBills = await billsAPI.getAll();
      const newBill = newBills.data.find(b => b.order_id === parseInt(orderId));
      if (newBill) {
        selectBill(newBill);
      }
    } catch (error) {
      console.error('Error generating bill:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate bill');
    }
  };

  const processPayment = async () => {
    if (!selectedBill) return;
    
    const finalAmount = calculateFinalAmount();
    const totalPaid = paymentMethods.reduce((sum, pm) => sum + parseFloat(pm.amount || 0), 0);
    
    if (totalPaid < finalAmount) {
      toast.error(`Insufficient payment! Need ₹${(finalAmount - totalPaid).toFixed(2)} more`);
      return;
    }
    
    try {
      await billsAPI.updatePayment(selectedBill.id, true);
      toast.success('Payment processed successfully!');
      fetchBills();
      resetPaymentState();
      setSelectedBill(null);
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    }
  };
  
  const resetPaymentState = () => {
    setDiscountType('none');
    setDiscountValue(0);
    setSplitBy(1);
    setPaymentMethods([{ method: 'Cash', amount: 0 }]);
    setTenderedAmount(0);
    setCustomerName('');
    setCustomerEmail('');
  };

  // Calculation functions
  const calculateSubtotal = () => {
    if (!selectedBill) return 0;
    return selectedBill.total_amount;
  };
  
  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === 'percentage') {
      return (subtotal * discountValue) / 100;
    } else if (discountType === 'flat') {
      return Math.min(discountValue, subtotal);
    }
    return 0;
  };
  
  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return ((subtotal - discount) * taxRate) / 100;
  };
  
  const calculateFinalAmount = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    const finalAmount = subtotal - discount + tax;
    return finalAmount / splitBy;
  };
  
  const calculateChange = () => {
    const finalAmount = calculateFinalAmount();
    return Math.max(0, tenderedAmount - finalAmount);
  };
  
  const addPaymentMethod = () => {
    setPaymentMethods([...paymentMethods, { method: 'Cash', amount: 0 }]);
  };
  
  const updatePaymentMethod = (index, field, value) => {
    const updated = [...paymentMethods];
    updated[index][field] = value;
    setPaymentMethods(updated);
  };
  
  const removePaymentMethod = (index) => {
    if (paymentMethods.length > 1) {
      setPaymentMethods(paymentMethods.filter((_, i) => i !== index));
    }
  };
  
  const selectBill = (bill) => {
    setSelectedBill(bill);
    resetPaymentState();
    // Auto-set payment amount to final amount
    const subtotal = bill.total_amount;
    const discount = 0;
    const tax = (subtotal * taxRate) / 100;
    const finalAmount = subtotal + tax;
    setPaymentMethods([{ method: 'Cash', amount: finalAmount }]);
    setTenderedAmount(finalAmount);
  };
  
  const getOrderForBill = (bill) => {
    return orders.find(o => o.id === bill?.order_id);
  };
  
  const getTableForOrder = (order) => {
    return tables.find(t => t.id === order?.table_id);
  };
  
  const getBillAge = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const minutes = Math.floor((now - created) / 1000 / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };
  
  // Filter and search bills
  const filteredBills = useMemo(() => {
    let filtered = bills;
    
    // Filter by status
    if (filterStatus === 'Paid') {
      filtered = filtered.filter(b => b.paid);
    } else if (filterStatus === 'Unpaid') {
      filtered = filtered.filter(b => !b.paid);
    }
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(bill => {
        const order = getOrderForBill(bill);
        const table = getTableForOrder(order);
        const billId = bill.id.toString();
        const tableNum = table?.table_number?.toString() || '';
        const orderId = bill.order_id.toString();
        return billId.includes(searchTerm) || 
               tableNum.includes(searchTerm) || 
               orderId.includes(searchTerm);
      });
    }
    
    return filtered.sort((a, b) => {
      // Unpaid bills first, then by date
      if (a.paid !== b.paid) return a.paid ? 1 : -1;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [bills, filterStatus, searchTerm, orders, tables]);
  
  // Get orders without bills
  const ordersWithoutBills = useMemo(() => {
    const billOrderIds = new Set(bills.map(b => b.order_id));
    return orders.filter(order => !billOrderIds.has(order.id));
  }, [orders, bills]);

  return (
    <div className="flex h-screen bg-slate-950">
      {/* LEFT PANEL - Bill Selection */}
      <div className="w-96 glass-card border-r border-slate-700/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">Point of Sale</h2>
          
          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search bills or tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 glass-card border border-slate-700 rounded-xl focus:outline-none focus:border-primary-500 text-white placeholder-slate-400"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('All')}
              className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                filterStatus === 'All'
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({bills.length})
            </button>
            <button
              onClick={() => setFilterStatus('Unpaid')}
              className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                filterStatus === 'Unpaid'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unpaid ({bills.filter(b => !b.paid).length})
            </button>
            <button
              onClick={() => setFilterStatus('Paid')}
              className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                filterStatus === 'Paid'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Paid ({bills.filter(b => b.paid).length})
            </button>
          </div>
        </div>
        
        {/* Bills List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredBills.map((bill) => {
            const order = getOrderForBill(bill);
            const table = getTableForOrder(order);
            const isSelected = selectedBill?.id === bill.id;
            const isOverdue = !bill.paid && getBillAge(bill.created_at).includes('h');
            
            return (
              <div
                key={bill.id}
                onClick={() => selectBill(bill)}
                className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50 shadow-lg'
                    : isOverdue
                    ? 'border-orange-300 bg-orange-50 hover:border-orange-400'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {table ? `Table ${table.table_number}` : `Order #${bill.order_id}`}
                    </h3>
                    <p className="text-sm text-gray-600">Bill #{bill.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    bill.paid
                      ? 'bg-green-100 text-green-700'
                      : isOverdue
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {bill.paid ? '✓ PAID' : 'UNPAID'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-teal-600 mb-1">
                  ₹{bill.total_amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">{getBillAge(bill.created_at)}</p>
              </div>
            );
          })}
          
          {filteredBills.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-6xl mb-4">📄</div>
              <p>No {filterStatus.toLowerCase()} bills</p>
            </div>
          )}
        </div>
        
        {/* Generate Bill for Orders */}
        {ordersWithoutBills.length > 0 && (
          <div className="p-4 border-t-2 border-gray-200 bg-gray-50">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Ready to Bill ({ordersWithoutBills.length})
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {ordersWithoutBills.map(order => {
                const table = getTableForOrder(order);
                return (
                  <button
                    key={order.id}
                    onClick={() => generateBill(order.id)}
                    className="w-full p-2 bg-white border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all text-left"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">
                        {table ? `Table ${table.table_number}` : `Order #${order.id}`}
                      </span>
                      <span className="text-teal-600 font-bold text-sm">
                        ₹{order.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* RIGHT PANEL - Bill Details & Payment */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedBill ? (
          <>
            {/* Bill Header */}
            <div className="glass-card border-b border-slate-700/50 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {(() => {
                      const order = getOrderForBill(selectedBill);
                      const table = getTableForOrder(order);
                      return table ? `Table ${table.table_number}` : `Order #${selectedBill.order_id}`;
                    })()}
                  </h1>
                  <p className="text-slate-400">Bill #{selectedBill.id} • {new Date(selectedBill.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedBill(null)}
                    className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl font-semibold hover:bg-slate-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
            
            {/* Bill Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Itemized List */}
                <div className="glass-card rounded-xl border border-slate-700/50 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
                  <div className="space-y-3">
                    {(() => {
                      const order = getOrderForBill(selectedBill);
                      const items = order?.items || [];
                      const grouped = {};
                      items.forEach(item => {
                        if (grouped[item.name]) {
                          grouped[item.name].quantity += 1;
                        } else {
                          grouped[item.name] = { ...item, quantity: 1 };
                        }
                      });
                      
                      return Object.values(grouped).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-200">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">₹{item.price.toFixed(2)} × {item.quantity}</p>
                          </div>
                          <p className="text-lg font-bold text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
                
                {/* Discount Section */}
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Discounts & Adjustments</h2>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <select
                        value={discountType}
                        onChange={(e) => {
                          setDiscountType(e.target.value);
                          setDiscountValue(0);
                        }}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold focus:outline-none focus:border-teal-500"
                        disabled={selectedBill.paid}
                      >
                        <option value="none">No Discount</option>
                        <option value="percentage">Percentage Discount</option>
                        <option value="flat">Flat Amount Discount</option>
                      </select>
                      
                      {discountType !== 'none' && (
                        <input
                          type="number"
                          min="0"
                          max={discountType === 'percentage' ? 100 : calculateSubtotal()}
                          value={discountValue}
                          onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                          className="w-32 px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-right focus:outline-none focus:border-teal-500"
                          placeholder={discountType === 'percentage' ? '%' : '₹'}
                          disabled={selectedBill.paid}
                        />
                      )}
                    </div>
                    
                    {calculateDiscount() > 0 && (
                      <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                        <p className="text-green-700 font-semibold">
                          💰 Discount Applied: -₹{calculateDiscount().toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Bill Splitting */}
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Bill Splitting</h2>
                  <div className="flex items-center gap-4">
                    <label className="text-gray-700 font-semibold">Split equally between:</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSplitBy(Math.max(1, splitBy - 1))}
                        className="w-10 h-10 bg-gray-200 rounded-lg font-bold hover:bg-gray-300 transition"
                        disabled={selectedBill.paid}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={splitBy}
                        onChange={(e) => setSplitBy(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-4 py-2 border-2 border-gray-200 rounded-xl font-bold text-center focus:outline-none focus:border-teal-500"
                        disabled={selectedBill.paid}
                      />
                      <button
                        onClick={() => setSplitBy(splitBy + 1)}
                        className="w-10 h-10 bg-gray-200 rounded-lg font-bold hover:bg-gray-300 transition"
                        disabled={selectedBill.paid}
                      >
                        +
                      </button>
                      <span className="text-gray-700 font-semibold ml-2">
                        {splitBy > 1 ? 'persons' : 'person'}
                      </span>
                    </div>
                  </div>
                  {splitBy > 1 && (
                    <div className="mt-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <p className="text-blue-700 font-semibold">
                        📊 Amount per person: ₹{calculateFinalAmount().toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Bill Summary */}
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border-2 border-teal-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Bill Summary</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-700">Subtotal</span>
                      <span className="font-semibold">₹{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    {calculateDiscount() > 0 && (
                      <div className="flex justify-between items-center text-lg text-green-600">
                        <span>Discount</span>
                        <span className="font-semibold">-₹{calculateDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-700">Tax ({taxRate}%)</span>
                      <span className="font-semibold">₹{calculateTax().toFixed(2)}</span>
                    </div>
                    <div className="border-t-2 border-teal-300 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-900">GRAND TOTAL</span>
                        <span className="text-4xl font-bold text-teal-600">
                          ₹{(calculateFinalAmount() * splitBy).toFixed(2)}
                        </span>
                      </div>
                      {splitBy > 1 && (
                        <p className="text-right text-sm text-gray-600 mt-1">
                          (₹{calculateFinalAmount().toFixed(2)} × {splitBy} persons)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="bg-white border-t-2 border-gray-200 p-6">
              <div className="max-w-4xl mx-auto flex gap-4">
                <PrintBill 
                  bill={selectedBill} 
                  order={getOrderForBill(selectedBill)} 
                  table={getTableForOrder(getOrderForBill(selectedBill))} 
                />
                <button
                  className="flex-1 px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all"
                  onClick={() => {
                    toast.success('Email feature coming soon!');
                  }}
                >
                  📧 Email Receipt
                </button>
                {!selectedBill.paid && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all"
                  >
                    💳 Process Payment
                  </button>
                )}
                {selectedBill.paid && (
                  <div className="flex-1 px-8 py-4 bg-green-100 text-green-700 rounded-xl font-bold text-lg text-center border-2 border-green-300">
                    ✓ Payment Completed
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-9xl mb-6">💳</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Select a Bill to Begin
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-md">
                Choose an active table from the left panel or start a new order to begin the billing process
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setFilterStatus('Unpaid')}
                  className="px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg text-lg"
                >
                  View Unpaid Bills
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Payment Modal */}
      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-2xl font-bold">Payment Processing</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Amount Due */}
              <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-6 text-center">
                <p className="text-gray-700 font-semibold mb-2">Amount Due</p>
                <p className="text-5xl font-bold text-teal-600">
                  ₹{calculateFinalAmount().toFixed(2)}
                </p>
                {splitBy > 1 && (
                  <p className="text-sm text-gray-600 mt-2">Per person (Split by {splitBy})</p>
                )}
              </div>
              
              {/* Payment Methods */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Payment Methods</h3>
                  <button
                    onClick={addPaymentMethod}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 text-sm"
                  >
                    + Add Method
                  </button>
                </div>
                
                {paymentMethods.map((pm, idx) => (
                  <div key={idx} className="flex gap-3 mb-3 items-center">
                    <select
                      value={pm.method}
                      onChange={(e) => updatePaymentMethod(idx, 'method', e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold focus:outline-none focus:border-teal-500"
                    >
                      <option value="Cash">💵 Cash</option>
                      <option value="Card">💳 Card</option>
                      <option value="UPI">📱 UPI</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={pm.amount}
                      onChange={(e) => updatePaymentMethod(idx, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-40 px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-right focus:outline-none focus:border-teal-500"
                      placeholder="₹0.00"
                    />
                    {paymentMethods.length > 1 && (
                      <button
                        onClick={() => removePaymentMethod(idx)}
                        className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                
                {/* Total Paid */}
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Total Being Paid:</span>
                    <span className="text-2xl font-bold text-teal-600">
                      ₹{paymentMethods.reduce((sum, pm) => sum + (parseFloat(pm.amount) || 0), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Cash Tendered (for Cash payments) */}
              {paymentMethods.some(pm => pm.method === 'Cash') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cash Tendered (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tenderedAmount}
                    onChange={(e) => setTenderedAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-right focus:outline-none focus:border-teal-500"
                    placeholder="₹0.00"
                  />
                  {tenderedAmount > calculateFinalAmount() && (
                    <div className="mt-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-green-700">Change Due:</span>
                        <span className="text-2xl font-bold text-green-600">
                          ₹{calculateChange().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Customer Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all"
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManager;
