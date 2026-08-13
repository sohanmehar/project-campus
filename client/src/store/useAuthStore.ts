import { create } from 'zustand';
import axios from 'axios';

axios.defaults.baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === 'production'
    ? 'https://campusgpt-backend-oscx.onrender.com/api/v1'
    : 'http://localhost:5000/api/v1');

axios.defaults.withCredentials = true;

// Attach Bearer token from localStorage to all outgoing requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('campusgpt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'coordinator' | 'admin';
  department: string;
  avatarUrl?: string;
  studentDetails?: any;
  facultyDetails?: any;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      // Notice trailing slash /auth/login/ to avoid 308 redirect -> 405 error
      const response = await axios.post('/auth/login/', credentials);
      const user = response.data?.user;
      const token = response.data?.token;

      if (token) {
        localStorage.setItem('campusgpt_token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      if (user) {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login failed. Invalid credentials.';
      set({
        error: errorMsg,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      throw err;
    }
  },

  signup: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/auth/signup/', userData);
      const user = response.data?.user;
      const token = response.data?.token;

      if (token) {
        localStorage.setItem('campusgpt_token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      if (user) {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Signup failed.';
      set({
        error: errorMsg,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      throw err;
    }
  },

  logout: async () => {
    try {
      await axios.post('/auth/logout/');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('campusgpt_token');
      delete axios.defaults.headers.common['Authorization'];
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  checkAuth: async () => {
    if (get().isAuthenticated && get().user) {
      set({ isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await axios.get('/auth/me/');
      if (response.data?.user) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        localStorage.removeItem('campusgpt_token');
        set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      }
    } catch (err) {
      localStorage.removeItem('campusgpt_token');
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },
}));