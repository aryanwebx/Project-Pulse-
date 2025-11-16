import { useState, useEffect } from 'react';
import { communityService } from '../services/communityService';
import { useAuth } from '../contexts/AuthContext';
import PaginationControls from '../components/Layout/PaginationControls';

const ManageUsers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Get the currently logged-in admin user

  // ADD PAGINATION STATE
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Function to load members from the API
  const loadMembers = async () => {
    try {
      setError(null); // Clear previous errors
      setLoading(true);
      // Pass the current page state to the service
      const data = await communityService.getCommunityMembers(pagination.page, 20); // 20 per page

      // *** FIX: Filter out super_admins before setting state ***
      const filteredMembers = (data.members || []).filter(
        (member) => member.role !== 'super_admin'
      );
      setMembers(filteredMembers);

      // Set pagination data from the response
      setPagination({
        page: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        total: data.total || 0,
      });
    } catch (err) {
      setError(err.message);
      setMembers([]); // Clear members on error
    } finally {
      setLoading(false);
    }
  };

  // UPDATE useEffect to re-run on page change
  useEffect(() => {
    loadMembers();
  }, [pagination.page]); // Re-run when pagination.page changes

  // ADD page change handler
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages && newPage !== pagination.page) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // UPDATE handlers to refetch data on success
  const handleRoleChange = async (userId, newRole) => {
    // Prevent admin from changing their own role
    if (userId === user?._id) {
      alert("As a security measure, you cannot change your own role.");
      loadMembers(); // Reload to reset the dropdown visually
      return;
    }

    try {
      setLoading(true); // Indicate loading
      await communityService.updateUserRole(userId, newRole);
      await loadMembers(); // Refetch the current page data
    } catch (err) {
      setError(`Failed to update role: ${err.message}`);
      setLoading(false); // Stop loading indicator on error
    }
  };

  // Handler for activating/deactivating a user
  const handleStatusChange = async (userId, currentStatus) => {
    // Prevent admin from deactivating themselves
    if (userId === user?._id && currentStatus === true) {
      alert("You cannot deactivate your own account.");
      return;
    }

    const newStatus = !currentStatus; // Toggle the status
    try {
      setLoading(true); // Indicate loading
      await communityService.updateUserStatus(userId, newStatus);
      await loadMembers(); // Refetch the current page data
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
      setLoading(false); // Stop loading indicator on error
    }
  };

  // Initial loading state
  if (loading && members.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-500">Loading community members...</p>
      </div>
    );
  }

  // Error state (if loading failed and no members were loaded)
  if (error && members.length === 0) {
    return (
      <div className="card bg-red-50 border border-red-200 text-center py-8">
        <p className="text-red-700 font-semibold">Error loading members:</p>
        <p className="text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Manage Community Users</h1>
      <p className="text-gray-600">Total manageable users: {pagination.total}</p>

      {/* Display error even if some members are loaded */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="card">
        {/* Loading overlay for refresh */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}
        <div className="overflow-x-auto relative"> {/* Added relative for overlay */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* *** NOTE: members array is now pre-filtered *** */}
              {members.map((member) => (
                <tr key={member._id} className={loading ? 'opacity-70' : ''}> {/* Slightly dim row while loading */}
                  {/* Name Cell */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    {member.apartmentNumber && <div className="text-xs text-gray-500">Apt: {member.apartmentNumber}</div>}
                  </td>
                  {/* Email Cell */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                  {/* Role Cell */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member._id, e.target.value)}
                      // No need to disable for super_admin here, as they are already filtered out
                      disabled={member._id === user?._id || loading}
                      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    >
                      {/* We know member.role is not super_admin here */}
                      <option value="resident">Resident</option>
                      <option value="community_admin">Community Admin</option>
                    </select>
                  </td>
                  {/* Status Cell */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {member.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  {/* Actions Cell */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleStatusChange(member._id, member.isActive)}
                      // No need to disable for super_admin here
                      disabled={member._id === user?._id || loading}
                      className={`font-medium ${
                        member.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {member.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Show message if no members found (after filtering) */}
          {members.length === 0 && !loading && (
            <p className="text-center py-4 text-gray-500">No manageable members found on this page.</p>
          )}
        </div>

        {/* ADD PAGINATION CONTROLS */}
        <div className="pt-4">
          <PaginationControls
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;