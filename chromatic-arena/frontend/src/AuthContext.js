import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch(`${API}/auth/me`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);


  const login = async (email, password) => {
    const response = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    setUser(data);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    return data;
  };

  const register = async (username, email, password) => {
    const response = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    const data = await response.json();
    setUser(data);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    return data;
  };

  // Redirect to our own backend for Google OAuth
  const loginWithGoogle = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  const handleGoogleCallback = async (sessionId) => {
    // Session already set via cookie, just fetch user data
    try {
      const userData = await checkAuth();
      return userData;
    } catch (error) {
      console.error('Google callback failed:', error);
      throw error;
    }
  };

  async function logout() {
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  }

  const updateUserCoins = (newCoins) => {
    if (user) {
      setUser({ ...user, coins: newCoins });
    }
  };

  const value = {
    user,
    setUser,
    loading,
    token,
    login,
    register,
    loginWithGoogle,
    handleGoogleCallback,
    logout,
    checkAuth,
    updateUserCoins,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};