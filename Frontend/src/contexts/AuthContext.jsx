import React, { useState, createContext, useContext, useEffect } from 'react';

// API Configuration
const API_BASE_URL = 'https://www.astroshivaurica.com/api';

// Authentication Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if user is logged in on component mount
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      setUser(savedUser);
      setToken(savedToken);
      // Verify token is still valid
      verifyToken(savedToken);
    }
  }, []);

  // Verify if token is still valid
  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
        console.log('✅ Token verification successful');
      } else if (response.status === 401) {
        // Only logout on 401 (unauthorized), not on network errors
        console.log('❌ Token invalid, logging out');
        logout();
      } else {
        // For other errors (500, network issues), keep user logged in
        console.log('⚠️ Token verification failed but keeping user logged in:', response.status);
      }
    } catch (error) {
      console.error('⚠️ Token verification network error, keeping user logged in:', error);
      // Don't logout on network errors - user might be offline
    }
  };

  const login = async (email, password, userType = null) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, userType })
      });

      const data = await response.json();

      if (response.ok) {
        const { user: userData, token: authToken } = data.data;
        
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', authToken);
        
        setLoading(false);
        return userData;
      } else {
        setLoading(false);
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (email, password, name, userType = 'jobseeker') => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name, userType })
      });

      const data = await response.json();

      if (response.ok) {
        const { user: userData, token: authToken } = data.data;
        
        // Set user data and token
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', authToken);
        
        console.log('✅ User registered and logged in automatically:', userData.email, 'Type:', userData.userType);
        
        setLoading(false);
        return userData;
      } else {
        setLoading(false);
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateProfile = async (profileData) => {
    try {
      console.log('🌐 Making API call to:', `${API_BASE_URL}/users/profile`);
      console.log('📤 Request data:', profileData);
      console.log('🔑 Using token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      const data = await response.json();
      console.log('📥 Response data:', data);

      if (response.ok) {
        const updatedUser = data.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('✅ Profile updated successfully in context');
        return updatedUser;
      } else {
        console.error('❌ Profile update failed:', data);
        console.error('❌ Validation errors:', data.errors);
        // Handle validation errors
        if (data.errors && data.errors.length > 0) {
          const errorMessages = data.errors.map(err => err.msg || err.message || err).join(', ');
          console.error('❌ Error messages:', errorMessages);
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Profile update failed');
      }
    } catch (error) {
      throw error;
    }
  };

  // Helper function to make authenticated API calls
  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...options
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API call failed');
    }

    return data;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      login, 
      register, 
      logout, 
      updateProfile, 
      loading,
      apiCall 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;