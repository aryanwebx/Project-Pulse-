import { useState, useEffect } from 'react'
import { useCommunity } from '../../contexts/CommunityContext'

const CommunitySelector = () => {
  const { currentCommunity, communities, switchCommunity, loading } = useCommunity()
  const [isOpen, setIsOpen] = useState(false)

  const handleCommunitySwitch = async (community) => {
    const result = await switchCommunity(community)
    if (result.success) {
      setIsOpen(false)
      // Refresh the page to update community-specific data
      window.location.reload()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
        <span>Loading communities...</span>
      </div>
    )
  }

  if (!currentCommunity && communities.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No communities available
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Current Community Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
      >
        {currentCommunity ? (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium text-gray-900">{currentCommunity.name}</span>
            <span className="text-gray-500 text-sm">({communities.length})</span>
          </>
        ) : (
          <span className="text-gray-500">Select Community</span>
        )}
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Your Communities</h3>
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {communities.map((community) => (
                <button
                  key={community._id}
                  onClick={() => handleCommunitySwitch(community)}
                  className={`w-full text-left px-3 py-2 flex items-center space-x-3 transition-colors ${
                    currentCommunity?._id === community._id
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    currentCommunity?._id === community._id ? 'bg-primary-600' : 'bg-gray-300'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{community.name}</p>
                    <p className="text-xs text-gray-500 truncate">{community.description}</p>
                  </div>
                  {currentCommunity?._id === community._id && (
                    <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {communities.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">
                No communities found. Contact an administrator to get added to a community.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default CommunitySelector