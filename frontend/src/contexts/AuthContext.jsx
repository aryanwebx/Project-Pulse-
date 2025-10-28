import { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Set axios default headers and base URL
  useEffect(() => {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    
    // This effect still handles the initial load from localStorage
    // and token changes from checkAuth
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await axios.post('/api/auth/login', { email, password })
      const { data } = response.data
      const { token, user } = data
      
      if (!token || !user) {
        throw new Error('Invalid response structure: missing token or user')
      }
      
      // --- FIX: Set header *before* setting state ---
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // ---------------------------------------------
      
      setToken(token)
      setUser(user)
      
      return { success: true, user }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      // --- FIX: Clear token/header on failed login ---
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      setToken(null)
      setUser(null)
      // -----------------------------------------------

      const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Login failed. Please try again.'
      
      return { 
        success: false, 
        error: errorMessage 
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await axios.post('/api/auth/register', userData)
      const { data } = response.data
      const { token, user } = data
      
      // --- FIX: Set header *before* setting state ---
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // ---------------------------------------------
      
      setToken(token)
      setUser(user)
      
      return { success: true, user }
    } catch (error) {
      console.error('Register error:', error)
      
      // --- FIX: Clear token/header on failed register ---
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      setToken(null)
      setUser(null)
      // ------------------------------------------------
      
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.'
      return { 
        success: false, 
        error: errorMessage 
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    // --- FIX: Explicitly delete header on logout ---
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    // --------------------------------------------
    setToken(null)
    setUser(null)
  }

  const checkAuth = async () => {
    if (token) {
      try {
        console.log('Checking auth with token...')
        // This relies on the useEffect[token] having run, which is fine on page load
        const response = await axios.get('/api/auth/me')
        const userData = response.data.data?.user || response.data.user
        
        if (userData) {
          setUser(userData)
        } else {
          throw new Error('No user data in response')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization'] // Also clear here
        setToken(null)
        setUser(null)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    checkAuth()
  }, []) // This empty dependency array is correct

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}