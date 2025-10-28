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
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      console.log('Axios headers set with token')
    } else {
      delete axios.defaults.headers.common['Authorization']
      console.log('Axios headers cleared')
    }
  }, [token])

  const login = async (email, password) => {
    try {
      setLoading(true)
      console.log('Login attempt with:', { email })
      
      const response = await axios.post('/api/auth/login', { email, password })
      console.log('Raw login response:', response.data)
      
      // FIX: Extract data from the nested structure
      const { data } = response.data
      const { token, user } = data
      
      console.log('Extracted login data:', { token, user })
      
      if (!token || !user) {
        throw new Error('Invalid response structure: missing token or user')
      }
      
      localStorage.setItem('token', token)
      setToken(token)
      setUser(user)
      
      console.log('Auth state updated:', { user, token })
      
      return { success: true, user }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
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
      console.log('Raw register response:', response.data)
      
      // FIX: Extract data from the nested structure
      const { data } = response.data
      const { token, user } = data
      
      console.log('Extracted register data:', { token, user })
      
      localStorage.setItem('token', token)
      setToken(token)
      setUser(user)
      
      return { success: true, user }
    } catch (error) {
      console.error('Register error:', error)
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
    console.log('Logging out user')
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const checkAuth = async () => {
    if (token) {
      try {
        console.log('Checking auth with token...')
        const response = await axios.get('/api/auth/me')
        console.log('Auth check response:', response.data)
        
        // FIX: Extract user from nested structure
        const userData = response.data.data?.user || response.data.user
        console.log('Extracted user data:', userData)
        
        if (userData) {
          setUser(userData)
          console.log('User set from auth check')
        } else {
          throw new Error('No user data in response')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  }

  console.log('AuthContext value:', value)

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}