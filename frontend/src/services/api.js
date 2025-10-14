import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const menuAPI = {
  getAll: () => api.get(`/menu`),
  getById: (itemId) => api.get(`/menu/${itemId}`),
  create: (itemData) => api.post(`/menu`, itemData),
  update: (itemId, itemData) => api.put(`/menu/${itemId}`, itemData),
  delete: (itemId) => api.delete(`/menu/${itemId}`),
};

export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (orderId) => api.get(`/orders/${orderId}`),
  create: (orderData) => api.post('/orders', orderData),
  update: (orderId, status) => api.put(`/orders/${orderId}`, { status }),
  delete: (orderId) => api.delete(`/orders/${orderId}`),
};

export const staffAPI = {
  getAll: (restaurantId) => api.get(`/restaurants/${restaurantId}/staff`),
  create: (restaurantId, staffData) => api.post(`/restaurants/${restaurantId}/staff`, staffData),
  update: (restaurantId, staffId, staffData) => api.put(`/restaurants/${restaurantId}/staff/${staffId}`, staffData),
  delete: (restaurantId, staffId) => api.delete(`/restaurants/${restaurantId}/staff/${staffId}`),
};

export const tablesAPI = {
  getAll: (restaurantId) => api.get(`/restaurants/${restaurantId}/tables`),
  create: (restaurantId, tableData) => api.post(`/restaurants/${restaurantId}/tables`, tableData),
  update: (restaurantId, tableId, tableData) => api.put(`/restaurants/${restaurantId}/tables/${tableId}`, tableData),
  book: (restaurantId, tableId, bookingData) => api.post(`/restaurants/${restaurantId}/tables/${tableId}/book`, bookingData),
};

export const inventoryAPI = {
  getAll: (restaurantId) => api.get(`/restaurants/${restaurantId}/inventory`),
  getById: (restaurantId, itemId) => api.get(`/restaurants/${restaurantId}/inventory/${itemId}`),
  create: (restaurantId, data) => api.post(`/restaurants/${restaurantId}/inventory`, data),
  update: (restaurantId, itemId, data) => api.put(`/restaurants/${restaurantId}/inventory/${itemId}`, data),
  delete: (restaurantId, itemId) => api.delete(`/restaurants/${restaurantId}/inventory/${itemId}`),
  checkLowStock: (restaurantId) => api.get(`/restaurants/${restaurantId}/inventory/low-stock`),
  getLinkedDishes: (restaurantId, itemId) => api.get(`/restaurants/${restaurantId}/inventory/${itemId}/linked-dishes`),
};

export const paymentsAPI = {
  createOrder: (amount) => api.post('/payments/create-order', { amount }),
  verify: (paymentData) => api.post('/payments/verify', paymentData),
};

export const restaurantsAPI = {
  getAll: () => api.get('/restaurants'),
  getById: (id) => api.get(`/restaurants/${id}`),
  create: (data) => api.post('/restaurants', data),
  update: (id, data) => api.put(`/restaurants/${id}`, data),
};

export const globalDishesAPI = {
  search: (params) => api.get('/global-dishes/search', { params }),
  getById: (dishId) => api.get(`/global-dishes/${dishId}`),
  getCategories: () => api.get('/global-dishes/categories'),
  getCuisines: () => api.get('/global-dishes/cuisines'),
  getTrending: () => api.get('/global-dishes/trending'),
  previewMapping: (restaurantId, dishId) => api.get(`/restaurants/${restaurantId}/preview-mapping/${dishId}`),
  addToMenu: (restaurantId, dishId, data) => api.post(`/restaurants/${restaurantId}/add-from-global/${dishId}`, data),
};

export default api;
