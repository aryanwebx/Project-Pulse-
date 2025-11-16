import { useState, useEffect } from 'react';
import { useCommunity } from '../contexts/CommunityContext';
import { communityService } from '../services/communityService';
import { Link } from 'react-router';

const CommunitySettings = () => {
  const { currentCommunity, setCurrentCommunity } = useCommunity();
  const [formData, setFormData] = useState({
    primaryColor: '#3B82F6',
    categories: 'Plumbing, Electrical, Security, Cleanliness, Parking, Other',
    aiFeatures: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load current settings into the form
  useEffect(() => {
    if (currentCommunity?.community?.settings) {
      const settings = currentCommunity.community.settings;
      setFormData({
        primaryColor: settings.primaryColor || '#3B82F6',
        // Join the array into a comma-separated string for the textarea
        categories: (settings.categories || []).join(', '),
        aiFeatures: settings.aiFeatures !== undefined ? settings.aiFeatures : true,
      });
    }
  }, [currentCommunity]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Convert categories string back into an array
      const categoriesArray = formData.categories
        .split(',')
        .map(cat => cat.trim())
        .filter(cat => cat.length > 0);

      const settingsToUpdate = {
        primaryColor: formData.primaryColor,
        categories: categoriesArray,
        aiFeatures: formData.aiFeatures,
      };

      const updatedCommunity = await communityService.updateCommunitySettings(settingsToUpdate);

      // Update the global community context
      setCurrentCommunity((prev) => ({
        ...prev,
        community: updatedCommunity,
      }));
      
      setSuccess('Settings updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentCommunity) {
    return <div>Loading community settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <Link
          to="/app/admin"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Admin Dashboard</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900">Community Settings</h1>
      <p className="text-gray-600">
        Manage settings for <span className="font-semibold">{currentCommunity.community.name}</span>.
      </p>

      <div className="card">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Categories */}
          <div>
            <label htmlFor="categories" className="block text-sm font-medium text-gray-700">
              Issue Categories
            </label>
            <textarea
              id="categories"
              name="categories"
              rows={3}
              value={formData.categories}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Plumbing, Electrical, Security..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter categories separated by a comma (e.g., Plumbing, Electrical, Other).
            </p>
          </div>

          {/* AI Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700">AI Features</label>
            <div className="mt-2 flex items-center">
              <input
                id="aiFeatures"
                name="aiFeatures"
                type="checkbox"
                checked={formData.aiFeatures}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
              <label htmlFor="aiFeatures" className="ml-2 block text-sm text-gray-900">
                Enable AI analysis (category, sentiment, summary) on new issues.
              </label>
            </div>
          </div>

          {/* Primary Color */}
          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
              Primary Theme Color
            </label>
            <div className="mt-1 flex items-center space-x-2">
              <input
                type="color"
                name="primaryColor"
                id="primaryColor"
                value={formData.primaryColor}
                onChange={handleChange}
                className="w-10 h-10 border-gray-300 rounded-lg"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={handleChange}
                name="primaryColor"
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              This feature is cosmetic and may not be fully implemented.
            </p>
          </div>

          {/* Form Actions */}
          <div className="text-right pt-4 border-t border-gray-200">
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? 'Saving Settings...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunitySettings;