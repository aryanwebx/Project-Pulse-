import { createContext, useState, useContext, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { communityService } from '../services/communityService'

const CommunityContext = createContext()

export const useCommunity = () => {
  const context = useContext(CommunityContext)
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider')
  }
  return context
}

export const CommunityProvider = ({ children }) => {
  const [currentCommunity, setCurrentCommunity] = useState(null)
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()

  // Load user's communities when they authenticate
  useEffect(() => {
    const loadUserCommunities = async () => {
      if (isAuthenticated && user) {
        try {
          setLoading(true)
          console.log('Loading user communities...')
          const userCommunities = await communityService.getUserCommunities()
          console.log('User communities loaded:', userCommunities)
          
          setCommunities(userCommunities)
          
          // Set the first community as default, or restore from localStorage
          const savedCommunityId = localStorage.getItem('currentCommunityId')
          const savedCommunity = userCommunities.find(c => c._id === savedCommunityId)
          
          if (savedCommunity) {
            setCurrentCommunity(savedCommunity)
          } else if (userCommunities.length > 0) {
            setCurrentCommunity(userCommunities[0])
            localStorage.setItem('currentCommunityId', userCommunities[0]._id)
          }
        } catch (error) {
          console.error('Failed to load user communities:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setCommunities([])
        setCurrentCommunity(null)
        setLoading(false)
      }
    }

    loadUserCommunities()
  }, [isAuthenticated, user])

  const switchCommunity = async (community) => {
    try {
      console.log('Switching to community:', community)
      setCurrentCommunity(community)
      localStorage.setItem('currentCommunityId', community._id)
      
      // Update axios headers with community context if needed
      // You might want to set a header for community-specific API calls
      return { success: true }
    } catch (error) {
      console.error('Failed to switch community:', error)
      return { success: false, error: error.message }
    }
  }

  const refreshCommunities = async () => {
    if (isAuthenticated && user) {
      try {
        const userCommunities = await communityService.getUserCommunities()
        setCommunities(userCommunities)
        
        // Update current community if it still exists
        if (currentCommunity) {
          const updatedCurrent = userCommunities.find(c => c._id === currentCommunity._id)
          if (updatedCurrent) {
            setCurrentCommunity(updatedCurrent)
          } else if (userCommunities.length > 0) {
            // If current community was removed, switch to first available
            setCurrentCommunity(userCommunities[0])
          } else {
            setCurrentCommunity(null)
          }
        }
      } catch (error) {
        console.error('Failed to refresh communities:', error)
      }
    }
  }

  const value = {
    currentCommunity,
    communities,
    switchCommunity,
    refreshCommunities,
    loading
  }

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  )
}