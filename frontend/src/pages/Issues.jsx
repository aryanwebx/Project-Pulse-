import { useState, useEffect, useCallback, useRef } from "react"; // Added useRef
import { useLocation, Link, useNavigate } from "react-router"; // Use react-router-dom for Link and useNavigate
import { useCommunity } from "../contexts/CommunityContext";
import { issueService } from "../services/issueService";
import IssueCard from "../components/Issue/IssueCard";
import IssueFilters from "../components/Issue/IssueFilters";

const Issues = () => {
  const { currentCommunity } = useCommunity();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters object now ONLY holds values used directly in the API call
  const [filters, setFilters] = useState({
    status: "",
    urgency: "",
    category: "",
    sort: "-createdAt",
    search: ""
  });

  // NEW: State specifically for the search input value
  const [searchTermInput, setSearchTermInput] = useState('');
  const debounceTimer = useRef(null); // Ref for debounce timer

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0 // Renamed totalIssues to total for consistency with API
  });

  const [successMessage, setSuccessMessage] = useState("");
  const location = useLocation(); // Get location from hook
  const navigate = useNavigate(); // For clearing location state

  // Check for success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the location state properly using navigate
      navigate(location.pathname, { replace: true, state: {} });
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname]); // Add navigate and pathname to dependencies

  // Main effect for loading issues based on API filters
  useEffect(() => {
    let isMounted = true; // Flag for async cleanup
    const loadIssues = async () => {
      // Don't load if community context isn't ready
      if (!currentCommunity?.community?._id) {
          console.log("loadIssues: No community ID, skipping fetch.");
          setLoading(false); // Stop loading if no community
          setIssues([]);
          setPagination({ currentPage: 1, totalPages: 1, total: 0 }); // Reset pagination
          return;
      }

      setLoading(true);
      console.log("loadIssues: Fetching with filters:", filters, " Page:", pagination.currentPage);
      try {
        // communityId is handled by backend tenant middleware now
        const issuesData = await issueService.getIssues(
          filters, // Pass the combined filters state
          pagination.currentPage,
          12 // Example limit
        );

        if (isMounted) {
            console.log("loadIssues: Received data:", issuesData);
            setIssues(issuesData.issues || []);
            // Update pagination based on API response
            setPagination({
                currentPage: issuesData.currentPage || 1,
                totalPages: issuesData.totalPages || 1,
                total: issuesData.total || 0
            });
        }
      } catch (error) {
        if (isMounted) {
            console.error("Failed to load issues:", error);
            setIssues([]); // Clear issues on error
            // Optionally set an error state here
             setPagination({ currentPage: 1, totalPages: 1, total: 0 }); // Reset pagination
        }
      } finally {
        if (isMounted) {
            setLoading(false);
        }
      }
    };

    loadIssues();

    // Cleanup function
    return () => { isMounted = false; };

  }, [currentCommunity, filters, pagination.currentPage]); // Re-runs when these change

   // NEW: Debounce effect for search term input
  useEffect(() => {
    // Clear previous timer if user types again quickly
    if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
    }
    // Set a new timer
    debounceTimer.current = setTimeout(() => {
        // When timer fires, update the main `filters` state's search property
        setFilters(prevFilters => {
            // Only update if the search term actually changed
            if (prevFilters.search !== searchTermInput) {
                console.log("Debounce Timer Fired: Updating search filter to:", searchTermInput);
                return { ...prevFilters, search: searchTermInput };
            }
            return prevFilters; // No change needed
        });
         // Reset pagination when search term changes via debounce
         // Check if the search term actually triggered a filter update
         if (filters.search !== searchTermInput) {
            setPagination(prev => ({ ...prev, currentPage: 1 }));
         }
    }, 500); // 500ms delay

    // Cleanup function to clear timer if component unmounts
    return () => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
    };
  // IMPORTANT: Only depend on searchTermInput. Do not include 'filters' here.
  }, [searchTermInput]);


  // MODIFIED: handleFilterChange now only handles dropdowns/sort
  // It receives the specific key and value that changed.
  const handleDropdownFilterChange = useCallback((filterKey, value) => {
    console.log(`Dropdown/Sort Changed: ${filterKey} = ${value}`);
    setFilters(prevFilters => ({
        ...prevFilters,
        [filterKey]: value
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset page
  }, []); // Empty dependency array makes this stable

  // NEW: Handler specifically for the search input's onChange event
  // Updates the local searchTermInput state IMMEDIATELY
  const handleSearchChange = useCallback((newSearchTerm) => {
    setSearchTermInput(newSearchTerm);
    // The debouncing useEffect handles updating the main `filters` state later
  }, []);

  // NEW: Handler for the "Clear All" button
  const handleClearAllFilters = useCallback(() => {
      console.log("Clearing all filters");
      if (debounceTimer.current) { // Clear pending debounce timer too
          clearTimeout(debounceTimer.current);
      }
      setSearchTermInput(''); // Clear the search input state
      setFilters({ // Reset the main API filters state
        status: "",
        urgency: "",
        category: "",
        sort: "-createdAt",
        search: "" // Ensure search is cleared in the main filter too
      });
      setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset page
  }, []);

  // Handler for pagination button clicks
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
        setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  // Handler for upvote clicks from IssueCard (updates local state optimistically)
  const handleUpvote = (issueId, newUpvoteCount) => {
    setIssues((prevIssues) =>
      prevIssues.map((issue) =>
        issue._id === issueId
          ? { ...issue, upvoteCount: newUpvoteCount, hasCurrentUserUpvoted: true } // Assume success
          : issue
      )
    );
  };

  // Calculate hasPrev/hasNext based on current state
  const hasPrev = pagination.currentPage > 1;
  const hasNext = pagination.currentPage < pagination.totalPages;

  // Render initial loading skeleton ONLY if issues array is empty
  if (loading && issues.length === 0) {
    return (
      <div className="space-y-6">
         {/* Simple Loading Text */}
         <p className="text-center text-gray-500 py-10">Loading issues...</p>
         {/* Or keep your more detailed skeleton */}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10"> {/* Added padding bottom */}
      {/* Success Message */}
      {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative transition-opacity duration-300" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Community Issues
          </h1>
          <p className="text-gray-600 mt-1">
            {/* Show total count from pagination */}
            {loading ? 'Searching...' : `${pagination.total} issue${pagination.total !== 1 ? "s" : ""} found`}
            {currentCommunity?.community && ` in ${currentCommunity.community.name}`}
          </p>
        </div>
        <Link
          to="/app/issues/new"
          className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span>Report Issue</span>
        </Link>
      </div>

      {/* Filters Component - Pass down necessary props */}
      <IssueFilters
        // Pass only the non-search filters for dropdowns/sort
        filters={{
            status: filters.status,
            urgency: filters.urgency,
            category: filters.category,
            sort: filters.sort
        }}
        // Pass the controlled search term state
        searchTerm={searchTermInput}
        // Pass the specific handlers
        onFilterChange={handleDropdownFilterChange} // For dropdowns/sort
        onSearchChange={handleSearchChange}       // For search input typing
        onClearAll={handleClearAllFilters}         // For the clear button
      />

      {/* Loading overlay for subsequent loads */}
      {loading && issues.length > 0 && (
        <div className="relative text-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading...</p>
        </div>
      )}

      {/* Issues Grid */}
      {!loading && issues.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <IssueCard
                key={issue._id}
                issue={issue}
                onUpvote={handleUpvote}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-6 border-t border-gray-200">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!hasPrev || loading} // Disable if loading
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <span className="text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!hasNext || loading} // Disable if loading
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        // No Issues Found Message
        !loading && ( // Only show if not loading
          <div className="card text-center py-16">
            <div className="text-6xl mb-4" role="img" aria-label="Magnifying glass">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Issues Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {filters.search
                ? `No issues matched your search for "${filters.search}". Try different keywords or clear the filters.`
                : "No issues match your current filters. Try clearing them or report a new issue!"
              }
            </p>
            {/* Show clear button only if filters are active */}
             {(Object.values(filters).some(f => f && f !== '-createdAt') || filters.search) && (
                 <button
                    onClick={handleClearAllFilters}
                    className="btn-secondary"
                >
                    Clear All Filters
                </button>
             )}
          </div>
        )
      )}
    </div>
  );
};

export default Issues;