import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });
  },
  logout: () => api.post('/auth/logout'),
  verifyToken: () => api.post('/auth/verify-token'),
  getMe: () => api.get('/auth/me'),
};

// Menu API
export const menuAPI = {
  getAll: () => api.get('/menu/'),
  getOne: (id) => api.get(`/menu/${id}/`),
  create: (data) => api.post('/menu/', data),
  update: (id, data) => api.put(`/menu/${id}/`, data),
  delete: (id) => api.delete(`/menu/${id}/`),
};

// Tables API
export const tablesAPI = {
  getAll: () => api.get('/tables/'),
  getOne: (id) => api.get(`/tables/${id}/`),
  create: (data) => api.post('/tables/', data),
  update: (id, data) => api.put(`/tables/${id}/`, data),
};

// Orders API
export const ordersAPI = {
  getAll: (activeOnly = false) => api.get('/orders/', { params: { active_only: activeOnly } }),
  getOne: (id) => api.get(`/orders/${id}/`),
  create: (data) => api.post('/orders/', data),
  update: (id, data) => api.put(`/orders/${id}/`, data),
};

// Bills API
export const billsAPI = {
  getAll: () => api.get('/bills/'),
  create: (data) => api.post('/bills/', data),
  updatePayment: (id, paid) => api.patch(`/bills/${id}/payment`, null, { params: { paid } }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
};

// Dishes API (Global Dishes Search)
export const dishesAPI = {
  search: (query) => api.get('/dishes/search', { params: { query } }),
  getOne: (id) => api.get(`/dishes/${id}`),
  getAll: (params = {}) => api.get('/dishes/', { params }),
};

// Inventory API
export const inventoryAPI = {
  // Ingredients
  getAllIngredients: (params = {}) => api.get('/inventory/ingredients', { params }),
  getIngredient: (id) => api.get(`/inventory/ingredients/${id}`),
  createIngredient: (data) => api.post('/inventory/ingredients', data),
  updateIngredient: (id, data) => api.put(`/inventory/ingredients/${id}`, data),
  deleteIngredient: (id) => api.delete(`/inventory/ingredients/${id}`),
  
  // Usage Tracking
  recordUsage: (data) => api.post('/inventory/usage', data),
  getUsageHistory: (params = {}) => api.get('/inventory/usage', { params }),
  
  // Alerts & Reports
  getLowStockAlerts: () => api.get('/inventory/alerts/low-stock'),
  getExpiringIngredients: (days = 7) => api.get('/inventory/alerts/expiring-soon', { params: { days } }),
  generateGroceryList: () => api.get('/inventory/grocery-list'),
  
  // Dish Requirements
  getRequiredIngredients: (menuItemId) => api.get(`/inventory/required-ingredients/${menuItemId}`),
};

// Chef API
export const chefAPI = {
  // Orders
  getActiveOrders: () => api.get('/chef/orders/active'),
  updateOrder: (id, data) => api.put(`/chef/orders/${id}`, data),
  
  // Menu Items (86 feature)
  toggleAvailability: (itemId, isAvailable) => 
    api.patch(`/chef/menu-items/${itemId}/toggle-availability`, null, { 
      params: { is_available: isAvailable } 
    }),
  
  // Messages
  sendMessage: (data) => api.post('/chef/messages', data),
  getMessages: (params = {}) => api.get('/chef/messages', { params }),
  markMessageRead: (id) => api.patch(`/chef/messages/${id}/read`),
  
  // Shift Handover
  createHandover: (data) => api.post('/chef/shift-handover', data),
  getLatestHandover: () => api.get('/chef/shift-handover/latest'),
  getHandovers: (limit = 10) => api.get('/chef/shift-handover', { params: { limit } }),
  
  // Batch Usage
  recordBatchUsage: (usages) => api.post('/chef/inventory/batch-usage', usages),
};

export default api;
