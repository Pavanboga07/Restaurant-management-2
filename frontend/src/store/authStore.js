import { create } from 'zustand';
import { authAPI } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.login(email, password);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      
      const { data: userData } = await authAPI.getCurrentUser();
      set({ user: userData, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Login failed', isLoading: false });
      return { success: false, error: error.response?.data?.detail };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.register(userData);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Registration failed', isLoading: false });
      return { success: false, error: error.response?.data?.detail };
    }
  },

  loadUser: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const { data } = await authAPI.getCurrentUser();
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: () => {
    try {
      authAPI.logout();
    } catch (error) {
      // Ignore logout errors
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },
}));
