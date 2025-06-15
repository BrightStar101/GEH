import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const storageToken = localStorage.getItem('token');
  let initialUser = null;
  if (storageToken) {
    try {
      const decoded = jwtDecode(storageToken);
      initialUser = decoded;
      axios.defaults.headers.common['Authorization'] = `Bearer ${storageToken}`;
    } catch {
      logout();
    }
  }

  const [token, setToken] = useState(storageToken);
  const [user, setUser] = useState(initialUser);
  const [isAdmin, setIsAdmin] = useState(initialUser?.role === 'admin');

  const setAuthToken = (newToken, navigate) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    const decoded = jwtDecode(newToken);
    if (decoded.role === 'admin') {
      setIsAdmin(true);
      navigate('/admin/dashboard');
    } else {
      navigate('/free-form');
    }
    setUser(decoded);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAdmin(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, token, setAuthToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

axios.defaults.baseURL = import.meta.env.VITE_API_BASE;