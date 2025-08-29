// AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';

// Mock user
const ADMIN_EMAIL = 'admin@canteen.com';
const ADMIN_PASS = '1234';

const AuthContext = createContext({
  user: null, // { name: string, email: string } | null
  login: async () => false,
  socialLogin: async () => false,
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      const newUser = { name: 'Admin', email };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const socialLogin = async (provider) => {
    // Simulate a successful login
    const newUser = { name: 'Admin', email: ADMIN_EMAIL };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, socialLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
