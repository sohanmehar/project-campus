import { create } from 'zustand';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000/api/v1';
axios.defaults.withCredentials = true;

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
      const response = await axios.post('/auth/login', credentials);
      const user = response.data?.user;

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
      const response = await axios.post('/auth/signup', userData);
      const user = response.data?.user;

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
      await axios.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  checkAuth: async () => {
    // If the user was just authenticated by login(), don't wipe out the session
    if (get().isAuthenticated && get().user) {
      set({ isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await axios.get('/auth/me');
      if (response.data?.user) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      }
    } catch (err) {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },
}));