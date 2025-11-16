import { useState, useEffect } from 'react';
import { communityService } from '../services/communityService';
import { superAdminService } from '../services/superAdminService';
import { Link } from 'react-router';

// Stats Card Component (no changes)
const StatCard = ({ title, value, icon }) => (
  <div className="card text-center">
    <div className="text-4xl mb-2">{icon}</div>
    <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-gray-600 font-medium">{title}</div>
  </div>
);

// Community Form Component (MODIFIED)
const CreateCommunityForm = ({ onCommunityCreated }) => {
  // 1. Add description to initial state
  const [formData, setFormData] = useState({
     name: '',
     subdomain: '',
     contactEmail: '',
     description: '' // <-- ADDED
   });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
     // Clear error on input change
     if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // formData now includes description, communityService.createCommunity sends the whole object
      await communityService.createCommunity(formData);
      // Clear form (including description)
      setFormData({ name: '', subdomain: '', contactEmail: '', description: '' });
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
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {/* Row for Name, Subdomain, Email */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text" name="name" value={formData.name} onChange={handleChange}
              placeholder="e.g., Sunrise Apartments"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subdomain *</label>
            <input
              type="text" name="subdomain" value={formData.subdomain} onChange={handleChange}
              placeholder="e.g., 'sunrise' (no spaces)"
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
              title="Lowercase letters, numbers, hyphens only."
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Email *</label>
            <input
              type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange}
              placeholder="e.g., admin@sunrise.com"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
        </div>
        {/* 2. Add Description Textarea */}
        <div>
           <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
           <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Briefly describe the community (e.g., location, type)..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm resize-none"
                maxLength={500} // Matches model validation
            />
            <p className="mt-1 text-xs text-gray-500">{formData.description.length}/500 characters</p>
        </div>
        {/* End Description */}

        <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Community'}
        </button>
      </form>
    </div>
  );
};

// Main Page Component (no changes needed below)
const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // Added error state for loading

  const loadData = async () => {
    setLoading(true);
    setError(''); // Clear previous errors
    try {
      const [statsData, commData] = await Promise.all([
        superAdminService.getPlatformStats(),
        communityService.getAllCommunities() // Uses the correct service
      ]);
      setStats(statsData);
      setCommunities(commData.communities || []);
    } catch (error) {
      console.error("Failed to load super admin data:", error);
      setError(error.message || 'Failed to load data.'); // Set error message
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

 // Improved Loading/Error States
  if (loading) {
      return <div className="p-6 text-center text-gray-500">Loading platform data...</div>;
  }
   if (error) {
     return <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg">Error: {error}</div>;
   }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>

      {/* Platform Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Communities" value={stats.totalCommunities ?? '?'} icon="🏢" />
          <StatCard title="Total Users" value={stats.totalUsers ?? '?'} icon="👥" />
          <StatCard title="Total Issues" value={stats.totalIssues ?? '?'} icon="🐛" />
          <StatCard title="Open Issues" value={stats.openIssues ?? '?'} icon="🚨" />
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
                {communities.length === 0 && (
                    <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No communities created yet.</td>
                    </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;