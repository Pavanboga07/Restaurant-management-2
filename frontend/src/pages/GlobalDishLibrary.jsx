import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  SparklesIcon,
  ClockIcon,
  FireIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { globalDishesAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';

const GlobalDishLibrary = () => {
  const { user } = useAuthStore();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [categories, setCategories] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [addingDish, setAddingDish] = useState(false);
  const [customPrice, setCustomPrice] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchCuisines();
    fetchDishes();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchDishes();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedCategory, selectedCuisine]);

  const fetchDishes = async () => {
    setLoading(true);
    try {
      const params = {
        limit: 50,
        ...(searchQuery && { search_query: searchQuery }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedCuisine && { cuisine: selectedCuisine }),
      };
      const response = await globalDishesAPI.search(params);
      setDishes(response.data.dishes || []);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      toast.error('Failed to load dishes');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await globalDishesAPI.getCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCuisines = async () => {
    try {
      const response = await globalDishesAPI.getCuisines();
      setCuisines(response.data.cuisines || []);
    } catch (error) {
      console.error('Error fetching cuisines:', error);
    }
  };

  const handlePreview = async (dish) => {
    setSelectedDish(dish);
    setShowPreview(true);
    setCustomPrice(dish.default_price?.toString() || '');
    
    try {
      const response = await globalDishesAPI.previewMapping(user.restaurant_id, dish.id);
      setPreviewData(response.data);
    } catch (error) {
      console.error('Error loading preview:', error);
      toast.error('Failed to load ingredient preview');
    }
  };

  const handleAddDish = async () => {
    if (!selectedDish) return;
    
    setAddingDish(true);
    try {
      const payload = {
        price_override: customPrice ? parseFloat(customPrice) : selectedDish.default_price,
        auto_create_missing: true,
      };
      
      await globalDishesAPI.addToMenu(user.restaurant_id, selectedDish.id, payload);
      toast.success(`${selectedDish.name} added to your menu!`);
      setShowPreview(false);
      setSelectedDish(null);
      setPreviewData(null);
    } catch (error) {
      console.error('Error adding dish:', error);
      toast.error(error.response?.data?.detail || 'Failed to add dish');
    } finally {
      setAddingDish(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCuisine('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <SparklesIcon className="w-8 h-8 text-yellow-500" />
                Global Dish Library
              </h1>
              <p className="mt-2 text-gray-600">
                Browse and add popular dishes to your menu with one click
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FunnelIcon className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search dishes by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter Dropdowns */}
          {showFilters && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.category} value={cat.category}>
                        {cat.category} ({cat.count})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cuisine
                  </label>
                  <select
                    value={selectedCuisine}
                    onChange={(e) => setSelectedCuisine(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Cuisines</option>
                    {cuisines.map((cui) => (
                      <option key={cui.cuisine} value={cui.cuisine}>
                        {cui.cuisine} ({cui.count})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          {loading ? 'Loading...' : `${dishes.length} dishes found`}
        </div>

        {/* Dishes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : dishes.length === 0 ? (
          <div className="text-center py-12">
            <SparklesIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No dishes found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dishes.map((dish) => (
              <div
                key={dish.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200"
              >
                {/* Dish Image */}
                {dish.image_url && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={dish.image_url}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {dish.name}
                    </h3>
                    {dish.is_vegetarian && (
                      <span className="text-green-600 text-xs px-2 py-1 bg-green-50 rounded">
                        VEG
                      </span>
                    )}
                  </div>

                  {/* Cuisine & Category */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span className="px-2 py-1 bg-gray-100 rounded">{dish.cuisine}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">{dish.category}</span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {dish.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{dish.prep_time_minutes || 'N/A'} min</span>
                    </div>
                    {dish.spice_level && (
                      <div className="flex items-center gap-1">
                        <FireIcon className="w-4 h-4 text-orange-500" />
                        <span>{dish.spice_level}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <InformationCircleIcon className="w-4 h-4" />
                      <span>{dish.ingredient_count} ingredients</span>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <span className="text-lg font-bold text-gray-900">
                        ₹{dish.default_price}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">suggested</span>
                    </div>
                    <button
                      onClick={() => handlePreview(dish)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <PlusCircleIcon className="w-5 h-5" />
                      Add to Menu
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedDish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedDish.name}</h2>
                <p className="text-sm text-gray-600">{selectedDish.cuisine} • {selectedDish.category}</p>
              </div>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setSelectedDish(null);
                  setPreviewData(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Description */}
              <div className="mb-6">
                <p className="text-gray-700">{selectedDish.description}</p>
              </div>

              {/* Price Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set Price for Your Menu
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter price"
                  />
                  <span className="text-sm text-gray-500">
                    Suggested: ₹{selectedDish.default_price}
                  </span>
                </div>
              </div>

              {/* Ingredient Preview */}
              {previewData && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Ingredient Mapping Preview
                  </h3>
                  
                  {/* Cost & Stock Impact Summary */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-blue-900 mb-3">Cost Analysis</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ingredient Cost:</span>
                          <span className="font-semibold">₹{previewData.total_cost?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Menu Price:</span>
                          <span className="font-semibold">₹{customPrice || selectedDish?.base_price}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-blue-300">
                          <span className="text-gray-900 font-medium">Profit Margin:</span>
                          <span className={`font-bold ${
                            (customPrice || selectedDish?.base_price) - (previewData.total_cost || 0) > 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            ₹{((customPrice || selectedDish?.base_price) - (previewData.total_cost || 0)).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Margin %:</span>
                          <span>
                            {(((customPrice || selectedDish?.base_price) - (previewData.total_cost || 0)) / 
                              (customPrice || selectedDish?.base_price) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-purple-900 mb-3">Stock Impact</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Ingredients:</span>
                          <span className="font-semibold">{previewData.total_ingredients}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Can Make:</span>
                          <span className="font-semibold">{previewData.can_make_servings} servings</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Low Stock Items:</span>
                          <span className="font-semibold text-yellow-600">
                            {previewData.ingredients?.filter(i => i.best_match && i.best_match.stock_status === 'low').length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Need to Create:</span>
                          <span className="font-semibold text-yellow-600">
                            {previewData.ingredients?.filter(i => !i.best_match).length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {previewData.ingredients?.map((ing, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          ing.best_match
                            ? 'bg-green-50 border-green-200'
                            : 'bg-yellow-50 border-yellow-200'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {ing.global_ingredient_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({ing.quantity_needed} {ing.unit})
                            </span>
                            {ing.best_match && (
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                ing.best_match.current_stock >= ing.quantity_needed * 10
                                  ? 'bg-green-100 text-green-700'
                                  : ing.best_match.current_stock >= ing.quantity_needed
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {ing.best_match.current_stock} {ing.best_match.unit} in stock
                              </span>
                            )}
                          </div>
                          {ing.best_match ? (
                            <div className="text-sm text-gray-600 mt-1">
                              → Mapped to: <span className="font-medium">{ing.best_match.name}</span>
                              <span className="ml-2 text-xs text-green-600">
                                ({Math.round(ing.best_match.similarity_score * 100)}% match)
                              </span>
                              {ing.best_match.cost_per_unit && (
                                <span className="ml-2 text-xs text-gray-500">
                                  • Cost: ₹{(ing.best_match.cost_per_unit * ing.quantity_needed).toFixed(2)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-yellow-700 mt-1">
                              → Will be created (no match found)
                              <span className="ml-2 text-xs text-gray-600">
                                Add to inventory manually after adding dish
                              </span>
                            </div>
                          )}
                        </div>
                        {ing.best_match ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <PlusCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setSelectedDish(null);
                    setPreviewData(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={addingDish}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDish}
                  disabled={addingDish || !customPrice}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addingDish ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      Confirm & Add to Menu
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalDishLibrary;
