import { useState, useEffect } from 'react';
import { superAdminService } from '../services/superAdminService';
import { communityService } from '../services/communityService'; // To get list of communities for dropdown

const GlobalUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load all users and all communities
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [allUsers, commData] = await Promise.all([
        superAdminService.getAllUsers(),
        communityService.getAllCommunities() // Use existing service
      ]);
      setUsers(allUsers || []);
      setCommunities(commData.communities || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUserUpdate = async (userId, field, value) => {
    // Optimistic update
    setUsers(prevUsers =>
      prevUsers.map(u => (u._id === userId ? { ...u, [field]: value } : u))
    );

    try {
      await superAdminService.updateUser(userId, { [field]: value });
      // Optional: Full reload on success if needed
      // loadData(); 
    } catch (err) {
      setError(`Failed to update user: ${err.message}`);
      loadData(); // Revert optimistic update on failure
    }
  };

  if (loading) return <div>Loading all users...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="card">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Global User Management ({users.length})</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Community</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 text-sm">
                  <select
                    value={user.role}
                    onChange={(e) => handleUserUpdate(user._id, 'role', e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm text-sm"
                  >
                    <option value="resident">Resident</option>
                    <option value="community_admin">Community Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm">
                  <select
                    value={user.community?._id || ''}
                    onChange={(e) => handleUserUpdate(user._id, 'community', e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm text-sm"
                    disabled={user.role === 'super_admin'}
                  >
                    <option value="">-- None --</option>
                    {communities.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-sm">
                  <select
                    value={user.isActive ? 'true' : 'false'}
                    onChange={(e) => handleUserUpdate(user._id, 'isActive', e.target.value === 'true')}
                    className={`border-gray-300 rounded-md shadow-sm text-sm ${
                      user.isActive ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GlobalUserManagement;