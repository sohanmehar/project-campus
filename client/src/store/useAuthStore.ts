import { create } from 'zustand';
import axios from 'axios';

// Ensure clean string URL assignment
const rawApiUrl = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = (rawApiUrl && rawApiUrl !== 'undefined' && rawApiUrl.startsWith('http'))
  ? rawApiUrl
  : (import.meta.env.MODE === 'production'
      ? 'https://campusgpt-backend-oscx.onrender.com/api/v1'
      : 'http://localhost:5000/api/v1');

// Set base URL explicitly
axios.defaults.baseURL = BASE_URL.replace(/\/+$/, ''); // removes trailing slashes if any
axios.defaults.withCredentials = true;

// Token Storage Helpers (Prioritize sessionStorage for per-tab isolation, fallback to localStorage)
const getStoredToken = (): string | null => {
  try {
    return sessionStorage.getItem('campusgpt_token') || localStorage.getItem('campusgpt_token');
  } catch {
    return null;
  }
};

const setStoredToken = (token: string) => {
  try {
    sessionStorage.setItem('campusgpt_token', token);
    localStorage.setItem('campusgpt_token', token);
  } catch (e) {
    console.error('Failed to save token to storage', e);
  }
};

const removeStoredToken = () => {
  try {
    sessionStorage.removeItem('campusgpt_token');
    localStorage.removeItem('campusgpt_token');
  } catch (e) {
    console.error('Failed to remove token from storage', e);
  }
};

// Attach Bearer token from storage to all outgoing requests
axios.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
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
  googleLogin: (payload: { credential?: string; demoUser?: any }) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (userData: any) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/auth/login', credentials);
      const rawUser = response.data?.user;
      const token = response.data?.token;

      if (token) {
        setStoredToken(token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      if (rawUser) {
        const user = {
          ...rawUser,
          id: (rawUser.id || rawUser._id || '').toString(),
        };
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.status === 429
        ? 'Too many login attempts. Please wait 10 seconds before trying again.'
        : (err.response?.data?.message || 'Login failed. Invalid credentials.');
      set({
        error: errorMsg,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      throw err;
    }
  },

  googleLogin: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/auth/google', payload);
      const rawUser = response.data?.user;
      const token = response.data?.token;

      if (token) {
        setStoredToken(token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      if (rawUser) {
        const user = {
          ...rawUser,
          id: (rawUser.id || rawUser._id || '').toString(),
        };
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.status === 429
        ? 'Too many login attempts. Please wait 10 seconds before trying again.'
        : (err.response?.data?.message || 'Google authentication failed.');
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
      const response = await axios.post('/auth/signup', userData);
      const rawUser = response.data?.user;
      const token = response.data?.token;

      if (token) {
        setStoredToken(token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      if (rawUser) {
        const user = {
          ...rawUser,
          id: (rawUser.id || rawUser._id || '').toString(),
        };
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
      await axios.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      removeStoredToken();
      delete axios.defaults.headers.common['Authorization'];
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  checkAuth: async () => {
    const token = getStoredToken();
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    set({ isLoading: true });
    try {
      const response = await axios.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.user) {
        const rawUser = response.data.user;
        const user = {
          ...rawUser,
          id: (rawUser.id || rawUser._id || '').toString(),
        };
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        removeStoredToken();
        set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      }
    } catch (err) {
      removeStoredToken();
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  updateUser: (updatedUser: any) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedUser } : updatedUser,
    }));
  },
}));