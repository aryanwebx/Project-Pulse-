import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from '../config/axios'; // Use local config
import { notificationService } from '../services/notificationService';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Set axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // --- Socket.io and Notification Logic ---
  useEffect(() => {
    let socket;

    // Function to fetch initial notifications
    const fetchUnreadNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (error)
      {
        console.error("Failed to fetch initial notifications:", error);
      }
    };
    
    // *** FIX: Check for 'user' and 'token' directly. ***
    // 'isAuthenticated' is not defined in this scope, only in the 'value' object below.
    if (user && token) {
      // 1. Fetch initial data
      fetchUnreadNotifications();

      // 2. Connect to socket
      socket = io(SOCKET_SERVER_URL, {
        auth: { token },
      });
      
      // 3. Join personal user room
      socket.on('connect', () => {
        console.log('Socket connected, joining user room...');
        socket.emit('join:user', user._id);
      });

      // 4. Listen for new notifications
      socket.on('notification:new', (newNotification) => {
        console.log('🔔 New Notification Received:', newNotification);
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

    }

    // Cleanup
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
    // *** FIX: Update dependency array ***
  }, [user, token]); // Was: [isAuthenticated, user, token]


  // --- Notification Management Functions ---
  const markNotificationRead = useCallback((notificationId) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
    
    notificationService.markOneAsRead(notificationId).catch((err) => {
      console.error("Failed to mark as read:", err);
      // TODO: Revert state if API call fails
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
    setUnreadCount(0);

    notificationService.markAllAsRead().catch((err) => {
      console.error("Failed to mark all as read:", err);
    });
  }, []);

  // --- Auth Functions (login, register, logout, checkAuth) ---
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('api/auth/login', { email, password });
      const { data } = response.data;
      const { token, user } = data;
      
      if (!token || !user) {
        throw new Error('Invalid response structure: missing token or user');
      }
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setToken(token);
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);

      const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Login failed. Please try again.';
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post('api/auth/register', userData);
      const { data } = response.data;
      const { token, user } = data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setToken(token);
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Register error:', error);
      
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
      
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    // Also clear notifications on logout
    setNotifications([]);
    setUnreadCount(0);
  };

  const checkAuth = async () => {
    if (token) {
      try {
        console.log('Checking auth with token...');
        const response = await axios.get('api/auth/me');
        const userData = response.data.data?.user || response.data.user;
        
        if (userData) {
          setUser(userData);
        } else {
          throw new Error('No user data in response');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  };
  
  useEffect(() => {
    checkAuth();
  }, []); // This empty dependency array is correct

  // --- Context Value ---
  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user, // 'isAuthenticated' is defined HERE
    setUser,
    // Notification values
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};