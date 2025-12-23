import axios from 'axios';
import { getDeviceId } from '../utils/device-id';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production'
        ? 'https://mateluxy-backend-5p27.onrender.com'
        : 'http://localhost:3001'),
    withCredentials: true, // Send cookies
});

api.interceptors.request.use((config) => {
    config.headers['X-Device-ID'] = getDeviceId();
    return config;
});

// List of endpoints that should not trigger token refresh
const PUBLIC_ENDPOINTS = [
    '/auth/login',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/refresh',
];

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if this is a public endpoint that shouldn't trigger refresh
        const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint =>
            originalRequest.url?.includes(endpoint)
        );

        // Only try to refresh token if:
        // 1. It's a 401 error
        // 2. We haven't already retried
        // 3. It's not a public endpoint
        if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint) {
            originalRequest._retry = true;
            try {
                await api.get('/auth/refresh');
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, clear auth cookie and redirect to login
                document.cookie = 'isAuthenticated=; path=/; max-age=0';
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    },
);

export default api;

