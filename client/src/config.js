let API_URL = import.meta.env.VITE_API_URL || 'https://server-six-flame-12.vercel.app/api';

// Auto-fix: Ensure URL ends with /api
if (API_URL && !API_URL.endsWith('/api')) {
    API_URL += '/api';
}

export default API_URL;
