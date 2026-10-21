import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const BASE_URL = API_URL ? API_URL.replace('/api', '') : '';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-CSRF-TOKEN'
});

// Attach the admin token and archive headers to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

        if (token && token !== "undefined") {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Inject the archive year into headers for historical data browsing
        const archiveYear = sessionStorage.getItem("archiveViewYear");
        if (archiveYear) {
            config.headers['archiveviewyear'] = archiveYear;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

let isAlertShown = false;

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url || '';

        // Skip auth redirect for public/auth endpoints
        const isAuthRequest = (
            requestUrl.includes('/login') || 
            requestUrl.includes('/register') || 
            requestUrl.includes('/forgot-password') || 
            requestUrl.includes('/reset-password') || 
            requestUrl.includes('/send-signup-otp') ||
            requestUrl.includes('/accept-offer-public')
        );

        // Transform Pydantic validation errors (array of objects) into a readable string
        if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
            error.response.data.detail = error.response.data.detail
                .map(d => typeof d === 'string' ? d : (d.msg || JSON.stringify(d)))
                .join(", ");
        }

        // Handle expired admin sessions
        if ((status === 401 || status === 403) && !isAuthRequest) {
            console.warn("Session expired or unauthorized.");

            if (!isAlertShown) {
                isAlertShown = true;
                localStorage.removeItem('adminToken');
                localStorage.removeItem('token');
                localStorage.removeItem('isAdminAuthenticated');
                window.location.reload();
            }
        }
        return Promise.reject(error);
    }
);

export const acceptOfferPublic = (slug) => api.post('/applicant/accept-offer-public', { tracking_slug: slug, slug });

export default api;
