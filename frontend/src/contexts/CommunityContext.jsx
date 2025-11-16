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
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated, token } = useAuth()

  // Load user's community when they authenticate
  useEffect(() => {
    const loadUserCommunity = async () => {
      if (isAuthenticated && user && token) {
        try {
          setLoading(true)
          console.log('Loading user community...')
          const userCommunity = await communityService.getUserCommunity()
          console.log('User communities loaded:', userCommunity)
          
          // Since user belongs to only one community, take the first one
          if (userCommunity) {
            setCurrentCommunity(userCommunity)
            console.log('Set current community:', userCommunity)
          } else {
            console.log('No community found for user')
          }
        } catch (error) {
          console.error('Failed to load user community:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setCurrentCommunity(null)
        setLoading(false)
      }
    }

    loadUserCommunity()
  }, [isAuthenticated, user,token])

  const value = {
    currentCommunity,
    loading,
    hasMultipleCommunities: false, // Add this flag for future use
    setCurrentCommunity,
  }

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  )
}