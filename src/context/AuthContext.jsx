import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No mock users logic needed here

    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (token && stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Invalid email or password');
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password, phone });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  };

  const forgotPassword = async (email) => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to send reset email');
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { newPassword });
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.put('/auth/profile', profileData);
      const updated = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, forgotPassword, resetPassword, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
