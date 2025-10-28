import { useCommunity } from "../../contexts/CommunityContext";

const CommunityDisplay = () => {
  const { currentCommunity, loading } = useCommunity();

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600"></div>
        <span className="text-sm">Loading community...</span>
      </div>
    );
  }

  if (!currentCommunity) {
    return (
      <div className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
        No community assigned
      </div>
    );
  }

  const communityName =
    currentCommunity.community?.name ||
    currentCommunity.name ||
    "Unknown Community";
  const communityDescription =
    currentCommunity.community?.description || currentCommunity.description;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
      <div className="flex items-center space-x-3">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-blue-900 text-sm">
            {currentCommunity.community.name}
          </div>
          {currentCommunity.description && (
            <div className="text-xs text-blue-700 truncate">
              {currentCommunity.description}
            </div>
          )}
        </div>
        {/* You can add a community badge or icon */}
        <div className="text-blue-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CommunityDisplay;
