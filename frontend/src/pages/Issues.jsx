import { useState, useEffect } from "react";
import { useCommunity } from "../contexts/CommunityContext";
import { issueService } from "../services/issueService";
import IssueCard from "../components/Issue/IssueCard";
import IssueFilters from "../components/Issue/IssueFilters";
import { Link } from "react-router";

const Issues = () => {
  const { currentCommunity } = useCommunity();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    urgency: "",
    category: "",
    sort: "-createdAt",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalIssues: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [successMessage, setSuccessMessage] = useState("");

  // Check for success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the location state
      window.history.replaceState({}, document.title);

      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    const loadIssues = async () => {
      if (currentCommunity) {
        setLoading(true);
        try {
          const communityId = currentCommunity.community._id;
          const issuesData = await issueService.getIssues(
            filters,
            pagination.currentPage,
            12
          );
          console.log("Loaded issues:", issuesData);

          setIssues(issuesData.issues || []);
          setPagination(
            issuesData.pagination || {
              currentPage: 1,
              totalPages: 1,
              totalIssues: issuesData.issues?.length || 0,
              hasNext: false,
              hasPrev: false,
            }
          );
        } catch (error) {
          console.error("Failed to load issues:", error);
          setIssues([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadIssues();
  }, [currentCommunity, filters, pagination.currentPage]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleUpvote = (issueId, newUpvoteCount) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue._id === issueId
          ? { ...issue, upvoteCount: newUpvoteCount }
          : issue
      )
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="card animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>

        {/* Issues Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex justify-between mb-3">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Community Issues
          </h1>
          <p className="text-gray-600 mt-1">
            {pagination.totalIssues} issue
            {pagination.totalIssues !== 1 ? "s" : ""} reported
            {currentCommunity && ` in ${currentCommunity.community.name}`}
          </p>
        </div>
        <Link
          to="/app/issues/new"
          className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Report Issue</span>
        </Link>
      </div>

      {/* Filters */}
      <IssueFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Issues Grid */}
      {issues.length > 0 ? (
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
                disabled={!pagination.hasPrev}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center space-x-1">
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      page === pagination.currentPage
                        ? "bg-primary-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Issues Found
          </h3>
          <p className="text-gray-600 mb-6">
            {Object.values(filters).some((f) => f)
              ? "Try adjusting your filters to see more results."
              : "Be the first to report an issue in your community!"}
          </p>
          <Link
            to="/app/issues/new"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Report First Issue</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Issues;
