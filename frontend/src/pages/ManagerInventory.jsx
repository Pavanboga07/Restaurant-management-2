import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CalendarIcon,
  CubeIcon,
  LinkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { inventoryAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';

const ManagerInventory = () => {
  const { user } = useAuthStore();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, low, expired, expiring
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    quantity: '',
    unit: 'kg',
    cost_per_unit: '',
    supplier: '',
    expiry_date: '',
    storage_location: '',
    reorder_level: '',
  });

  useEffect(() => {
    if (user?.restaurant_id) {
      fetchIngredients();
    }
  }, [user]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      filterIngredients();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, filterStatus]);

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const response = await inventoryAPI.getAll(user.restaurant_id);
      setIngredients(response.data.ingredients || []);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const filterIngredients = () => {
    let filtered = ingredients;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(ing =>
        ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ing.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus === 'low') {
      filtered = filtered.filter(ing => ing.quantity <= (ing.reorder_level || 10));
    } else if (filterStatus === 'expired') {
      filtered = filtered.filter(ing => 
        ing.expiry_date && new Date(ing.expiry_date) < new Date()
      );
    } else if (filterStatus === 'expiring') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      filtered = filtered.filter(ing =>
        ing.expiry_date && 
        new Date(ing.expiry_date) < thirtyDaysFromNow &&
        new Date(ing.expiry_date) > new Date()
      );
    }

    return filtered;
  };

  const getStockStatus = (ingredient) => {
    const quantity = ingredient.quantity || 0;
    const reorderLevel = ingredient.reorder_level || 10;

    if (quantity === 0) {
      return { status: 'out', color: 'red', label: 'Out of Stock' };
    } else if (quantity <= reorderLevel * 0.5) {
      return { status: 'critical', color: 'red', label: 'Critical' };
    } else if (quantity <= reorderLevel) {
      return { status: 'low', color: 'yellow', label: 'Low Stock' };
    } else {
      return { status: 'good', color: 'green', label: 'In Stock' };
    }
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;

    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'red', label: 'Expired', days: Math.abs(daysUntilExpiry) };
    } else if (daysUntilExpiry <= 7) {
      return { status: 'critical', color: 'red', label: `${daysUntilExpiry} days left`, days: daysUntilExpiry };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'warning', color: 'yellow', label: `${daysUntilExpiry} days left`, days: daysUntilExpiry };
    } else {
      return { status: 'good', color: 'green', label: `${daysUntilExpiry} days left`, days: daysUntilExpiry };
    }
  };

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.create(user.restaurant_id, formData);
      toast.success('Ingredient added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchIngredients();
    } catch (error) {
      console.error('Error adding ingredient:', error);
      toast.error('Failed to add ingredient');
    }
  };

  const handleUpdateIngredient = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.update(user.restaurant_id, selectedIngredient.id, formData);
      toast.success('Ingredient updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchIngredients();
    } catch (error) {
      console.error('Error updating ingredient:', error);
      toast.error('Failed to update ingredient');
    }
  };

  const handleDeleteIngredient = async (ingredientId) => {
    if (!confirm('Are you sure you want to delete this ingredient?')) return;

    try {
      await inventoryAPI.delete(user.restaurant_id, ingredientId);
      toast.success('Ingredient deleted successfully!');
      fetchIngredients();
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      toast.error('Failed to delete ingredient');
    }
  };

  const openEditModal = (ingredient) => {
    setSelectedIngredient(ingredient);
    setFormData({
      name: ingredient.name || '',
      category: ingredient.category || 'Vegetables',
      quantity: ingredient.quantity?.toString() || '',
      unit: ingredient.unit || 'kg',
      cost_per_unit: ingredient.cost_per_unit?.toString() || '',
      supplier: ingredient.supplier || '',
      expiry_date: ingredient.expiry_date || '',
      storage_location: ingredient.storage_location || '',
      reorder_level: ingredient.reorder_level?.toString() || '',
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Vegetables',
      quantity: '',
      unit: 'kg',
      cost_per_unit: '',
      supplier: '',
      expiry_date: '',
      storage_location: '',
      reorder_level: '',
    });
    setSelectedIngredient(null);
  };

  const filteredIngredients = filterIngredients();
  const lowStockCount = ingredients.filter(ing => ing.quantity <= (ing.reorder_level || 10)).length;
  const expiredCount = ingredients.filter(ing => 
    ing.expiry_date && new Date(ing.expiry_date) < new Date()
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <CubeIcon className="w-8 h-8 text-primary-600" />
                Inventory Management
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your ingredients, track stock levels, and monitor expiry dates
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <PlusIcon className="w-5 h-5" />
              Add Ingredient
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{ingredients.length}</p>
              </div>
              <CubeIcon className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
              </div>
              <ExclamationTriangleIcon className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
              </div>
              <CalendarIcon className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {[...new Set(ingredients.map(i => i.category))].length}
                </p>
              </div>
              <ChartBarIcon className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search ingredients by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('low')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'low'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Low Stock
              </button>
              <button
                onClick={() => setFilterStatus('expiring')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'expiring'
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Expiring Soon
              </button>
              <button
                onClick={() => setFilterStatus('expired')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'expired'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Expired
              </button>
            </div>

            <button
              onClick={fetchIngredients}
              className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Refresh"
            >
              <ArrowPathIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          {loading ? 'Loading...' : `${filteredIngredients.length} ingredients found`}
        </div>

        {/* Ingredients Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading inventory...</p>
          </div>
        ) : filteredIngredients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <CubeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No ingredients found</p>
            <p className="text-gray-400 text-sm mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Add Your First Ingredient
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingredient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIngredients.map((ingredient) => {
                  const stockStatus = getStockStatus(ingredient);
                  const expiryStatus = getExpiryStatus(ingredient.expiry_date);

                  return (
                    <tr key={ingredient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {ingredient.name}
                          </div>
                          <div className="text-sm text-gray-500">{ingredient.category}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ingredient.quantity} {ingredient.unit}
                        </div>
                        {ingredient.reorder_level && (
                          <div className="text-xs text-gray-500">
                            Reorder at: {ingredient.reorder_level} {ingredient.unit}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            stockStatus.color === 'green'
                              ? 'bg-green-100 text-green-800'
                              : stockStatus.color === 'yellow'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {expiryStatus ? (
                          <div>
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                expiryStatus.color === 'green'
                                  ? 'bg-green-100 text-green-800'
                                  : expiryStatus.color === 'yellow'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {expiryStatus.label}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(ingredient.expiry_date).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No expiry</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ingredient.cost_per_unit ? `₹${ingredient.cost_per_unit}/${ingredient.unit}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ingredient.supplier || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(ingredient)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteIngredient(ingredient.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {showAddModal ? 'Add Ingredient' : 'Edit Ingredient'}
              </h2>
              <button
                onClick={() => {
                  showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={showAddModal ? handleAddIngredient : handleUpdateIngredient} className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ingredient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Tomatoes, Chicken, Rice"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Meat">Meat</option>
                    <option value="Spices">Spices</option>
                    <option value="Grains">Grains</option>
                    <option value="Oils">Oils</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit *
                  </label>
                  <select
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="l">Liters (l)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="dozen">Dozen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost per Unit
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_per_unit}
                    onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="50.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Fresh Foods Pvt Ltd"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Storage Location
                  </label>
                  <input
                    type="text"
                    value={formData.storage_location}
                    onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Cold Storage Room 1, Shelf A3"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {showAddModal ? 'Add Ingredient' : 'Update Ingredient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerInventory;
