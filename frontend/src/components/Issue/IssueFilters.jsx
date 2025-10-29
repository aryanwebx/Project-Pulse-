import { useState, useEffect, useRef } from 'react'; // useRef might not be needed anymore

// Receive filters (excluding search), searchTerm, and specific handlers
const IssueFilters = ({ filters, searchTerm, onFilterChange, onSearchChange, onClearAll }) => {

  // Local state for dropdown/sort values (synced from parent)
  const [localFilters, setLocalFilters] = useState({
    status: filters.status || '',
    urgency: filters.urgency || '',
    category: filters.category || '',
    sort: filters.sort || '-createdAt'
  });

  // Effect to update local dropdown state if parent filters change
  useEffect(() => {
    setLocalFilters({
      status: filters.status || '',
      urgency: filters.urgency || '',
      category: filters.category || '',
      sort: filters.sort || '-createdAt'
    });
  }, [filters]); // Run when the 'filters' prop changes


  // Handle immediate changes for dropdowns/sort
  const handleDropdownChange = (key, value) => {
    // Update local state immediately for visual feedback
    const newLocalFilters = { ...localFilters, [key]: value };
    setLocalFilters(newLocalFilters);
    // Call the specific handler passed from parent for dropdowns/sort
    onFilterChange(key, value);
  };

  // Handle typing in the search bar
  const handleSearchInputChange = (e) => {
    // Call the specific handler passed from parent immediately
    // The parent (Issues.jsx) handles the debouncing.
    onSearchChange(e.target.value);
  };

  // Check if any filter (dropdown or search) is active
  const hasActiveFilters =
    Object.values(localFilters).some(value => value && value !== '-createdAt') ||
    searchTerm; // Use the searchTerm prop here

  // Define filter options (keep these definitions)
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' }
  ];
  const urgencyOptions = [
    { value: '', label: 'All Priority' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Plumbing', label: 'Plumbing' },
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Security', label: 'Security' },
    { value: 'Cleanliness', label: 'Cleanliness' },
    { value: 'Parking', label: 'Parking' },
    { value: 'Other', label: 'Other' }
    // Consider fetching these from community context in parent later
  ];
  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: '-upvoteCount', label: 'Most Upvoted' },
    { value: 'upvoteCount', label: 'Least Upvoted' },
    // Removed priority sort for simplicity, add back if needed
  ];

  return (
    <div className="card relative"> {/* Add relative for potential loading overlay */}
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Filters & Sorting</h3>
        </div>

        {/* Search Bar - Controlled Input */}
        <div>
          <label htmlFor="search-issues" className="block text-xs font-medium text-gray-700 mb-1 sr-only">Search</label>
          <input
            type="search" // Use type="search" for better semantics/clear button
            id="search-issues"
            placeholder="Search by title, description, or location..."
            value={searchTerm} // Controlled by parent state
            onChange={handleSearchInputChange} // Calls parent handler
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder-gray-400"
          />
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Status Filter */}
          <div>
            <label htmlFor="filter-status" className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              id="filter-status"
              value={localFilters.status}
              onChange={(e) => handleDropdownChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label htmlFor="filter-priority" className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
            <select
              id="filter-priority"
              value={localFilters.urgency}
              onChange={(e) => handleDropdownChange('urgency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              {urgencyOptions.map(option => (
                 <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="filter-category" className="block text-xs font-medium text-gray-700 mb-1">Category</label>
            <select
              id="filter-category"
              value={localFilters.category}
              onChange={(e) => handleDropdownChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              {categoryOptions.map(option => (
                 <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label htmlFor="filter-sort" className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
            <select
              id="filter-sort"
              value={localFilters.sort}
              onChange={(e) => handleDropdownChange('sort', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              {sortOptions.map(option => (
                 <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={onClearAll} // Call parent's clear handler
              disabled={!hasActiveFilters} // Disable if no filters are active
              className="w-full px-4 py-2 text-sm text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear all filters and search"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 font-medium">Active:</span>
            <div className="flex flex-wrap gap-2">
              {/* Status Pill */}
              {localFilters.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Status: {statusOptions.find(opt => opt.value === localFilters.status)?.label}
                  <button onClick={() => handleDropdownChange('status', '')} className="ml-1.5 text-blue-600 hover:text-blue-800 focus:outline-none">&times;</button>
                </span>
              )}
              {/* Priority Pill */}
              {localFilters.urgency && (
                 <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Priority: {urgencyOptions.find(opt => opt.value === localFilters.urgency)?.label}
                  <button onClick={() => handleDropdownChange('urgency', '')} className="ml-1.5 text-yellow-600 hover:text-yellow-800 focus:outline-none">&times;</button>
                </span>
              )}
              {/* Category Pill */}
              {localFilters.category && (
                 <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Category: {categoryOptions.find(opt => opt.value === localFilters.category)?.label}
                  <button onClick={() => handleDropdownChange('category', '')} className="ml-1.5 text-purple-600 hover:text-purple-800 focus:outline-none">&times;</button>
                </span>
              )}
              {/* Search Pill (Uses searchTerm prop) */}
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Search: "{searchTerm}"
                  {/* Clear search by calling onSearchChange with empty string */}
                  <button onClick={() => onSearchChange('')} className="ml-1.5 text-gray-600 hover:text-gray-800 focus:outline-none">&times;</button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IssueFilters;