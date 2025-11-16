import axios from 'axios';

// Get the base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Set the default base URL for all axios requests
// FIX: Add the /api prefix
axios.defaults.baseURL = `${API_BASE_URL}`;

export default axios;