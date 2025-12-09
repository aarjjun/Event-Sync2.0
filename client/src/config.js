let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Auto-fix: Ensure URL ends with /api
if (API_URL && !API_URL.endsWith('/api')) {
    API_URL += '/api';
}

export default API_URL;
