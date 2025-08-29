import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import authService from '@/api/services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('auth_token');
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          authService.apiClient?.setAuthToken(storedToken);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(email, password, options);
      
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('auth_token', response.token);
        authService.apiClient?.setAuthToken(response.token);
        
        if (options.remember) {
          localStorage.setItem('remember_me', 'true');
        }
        
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${response.user.name}!`,
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('auth_token', response.token);
        authService.apiClient?.setAuthToken(response.token);
        
        toast({
          title: 'Registration Successful',
          description: `Welcome to the team, ${response.user.name}!`,
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (provider) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.socialLogin(provider);
      
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('auth_token', response.token);
        authService.apiClient?.setAuthToken(response.token);
        
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${response.user.name}!`,
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Social Login Failed',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      await authService.logout();
      
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('remember_me');
      authService.apiClient?.setAuthToken(null);
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if API call fails
      setUser(null);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        toast({
          title: 'Reset Email Sent',
          description: response.message,
        });
        return true;
      }
      
      return false;
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Reset Failed',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken();
      
      if (response.success) {
        localStorage.setItem('auth_token', response.token);
        authService.apiClient?.setAuthToken(response.token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return false;
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    socialLogin,
    logout,
    forgotPassword,
    refreshToken,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager' || user?.role === 'admin',
  };
};

export default useAuth;