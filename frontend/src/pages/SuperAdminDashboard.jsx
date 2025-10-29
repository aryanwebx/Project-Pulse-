import { useState, useEffect } from 'react';
import { communityService } from '../services/communityService';
import { superAdminService } from '../services/superAdminService';
import { Link } from 'react-router';

// Stats Card Component
const StatCard = ({ title, value, icon }) => (
  <div className="card text-center">
    <div className="text-4xl mb-2">{icon}</div>
    <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-gray-600 font-medium">{title}</div>
  </div>
);

// Community Form Component
const CreateCommunityForm = ({ onCommunityCreated }) => {
  const [formData, setFormData] = useState({ name: '', subdomain: '', contactEmail: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await communityService.createCommunity(formData);
      setFormData({ name: '', subdomain: '', contactEmail: '' }); // Clear form
      onCommunityCreated(); // Tell parent to reload list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Create New Community</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-600">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text" name="name" value={formData.name} onChange={handleChange}
              placeholder="e.g., Sunrise Apartments"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subdomain</label>
            <input
              type="text" name="subdomain" value={formData.subdomain} onChange={handleChange}
              placeholder="e.g., 'sunrise' (no spaces)"
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
              title="Lowercase letters, numbers, and hyphens only."
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Email</label>
            <input
              type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange}
              placeholder="e.g., admin@sunrise.com"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
              required
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Community'}
        </button>
      </form>
    </div>
  );
};

// Main Page Component
const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, commData] = await Promise.all([
        superAdminService.getPlatformStats(),
        communityService.getAllCommunities()
      ]);
      setStats(statsData);
      setCommunities(commData.communities || []);
    } catch (error) {
      console.error("Failed to load super admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !stats) return <div>Loading platform data...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
      
      {/* Platform Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Communities" value={stats.totalCommunities} icon="🏢" />
          <StatCard title="Total Users" value={stats.totalUsers} icon="👥" />
          <StatCard title="Total Issues" value={stats.totalIssues} icon="🐛" />
          <StatCard title="Open Issues" value={stats.openIssues} icon="🚨" />
        </div>
      )}

      {/* Quick Link to Global User Management */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-2">Platform Management</h2>
        <Link to="/app/superadmin/users" className="text-primary-600 hover:underline font-medium">
          Manage All Platform Users &rarr;
        </Link>
      </div>

      {/* Create Community Form */}
      <CreateCommunityForm onCommunityCreated={loadData} />

      {/* Community List */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">All Communities ({communities.length})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subdomain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {communities.map((comm) => (
                <tr key={comm._id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{comm.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{comm.subdomain}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{comm.contactEmail}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      comm.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {comm.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;