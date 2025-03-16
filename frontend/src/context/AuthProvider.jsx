import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const USER_STORAGE_KEY = 'user';

export const AuthProvider = ({ children }) => {
  // Initialize user state directly from localStorage (prevents flash of unauthenticated state)
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      const userData = savedUser ? JSON.parse(savedUser) : null;
      
      // Set axios header immediately if user exists
      if (userData) {
        axios.defaults.headers.common['X-Auth-Key'] = userData.authKey;
      }
      
      return userData;
    } catch (error) {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  });

  // Update localStorage and headers when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      axios.defaults.headers.common['X-Auth-Key'] = user.authKey;
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
      delete axios.defaults.headers.common['X-Auth-Key'];
    }
  }, [user]);

  // API-based login function
  const login = (email, password) => {
    return axios.post('http://localhost:8080/api/v1/auth/login', { email, password })
      .then(res => {
        setUser(res.data);
        return true;
      })
      .catch(err => {
        console.error('Login failed:', err);
        return false;
      });
  };

  const logout = () => {
    setUser(null);
    return true;
  };

  // Permission checks based on role
  const can = {
    view: () => true,
    edit: () => user && ['Admin', 'Org_Treasurer', 'Class_Treasurer'].includes(user.role),
    create: () => user && ['Admin', 'Org_Treasurer', 'Class_Treasurer'].includes(user.role),
    delete: () => user && user.role === 'Admin',
    manageUsers: () => user && user.role === 'Admin'
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated,
      can 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);