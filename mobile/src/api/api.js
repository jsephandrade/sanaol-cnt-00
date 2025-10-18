import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --------------------
// Backend base URL
// --------------------
const BASE_URL = 'http://192.168.1.12:8000'; // Change if deployed

// --------------------
// Axios instance
// --------------------
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --------------------
// JWT interceptor using AsyncStorage
// --------------------
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --------------------
// API functions
// --------------------

// Login user
export async function loginUser(email, password) {
  try {
    const response = await api.post('/api/auth/login', { email, password });

    if (response.data.success) {
      await AsyncStorage.setItem('userEmail', response.data.email);
      await AsyncStorage.setItem('userRole', response.data.role || '');
      // Uncomment if using JWT tokens:
      // await AsyncStorage.setItem("accessToken", response.data.accessToken);
      // await AsyncStorage.setItem("refreshToken", response.data.refreshToken);
    }

    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    return { success: false, message: 'Invalid credentials or network error' };
  }
}

// Forgot password
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error(
      'Forgot password error:',
      error.response?.data || error.message
    );
    return { success: false, message: 'Network error or server unreachable' };
  }
};

// Logout
export const logoutUser = async () => {
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
};

// Register user
export const registerUser = async (data) => {
  try {
    const response = await api.post('/api/auth/register', data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);
    return {
      success: false,
      message:
        error.response?.data?.message || 'Registration failed or network error',
    };
  }
};

// Fetch menu items
export const fetchMenuItems = async () => {
  try {
    const response = await api.get('/api/menu/');
    return response.data;
  } catch (error) {
    console.error('Fetch menu items error:', error);
    throw error;
  }
};

// Create new menu item
export const createMenuItem = async (itemData) => {
  try {
    const response = await api.post('/api/menu/', itemData);
    return response.data;
  } catch (error) {
    console.error('Create menu item error:', error);
    throw error;
  }
};

// --------------------
// ✅ Confirm payment
// --------------------

export const confirmPayment = async (orderId, method) => {
  try {
    const response = await api.post('/api/payments/confirm', {
      orderId,
      method,
    });
    return response.data; // { success: true/false, message: "..." }
  } catch (error) {
    console.error(
      'Confirm payment error:',
      error.response?.data || error.message
    );
    return { success: false, message: 'Unable to confirm payment' };
  }
};

export default api;
