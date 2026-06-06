import axios from 'axios';
import { store } from '../store';
import { setCredentials, logout } from '../features/auth/authSlice';

// Create a configured Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // Crucial: Ensures the HTTP-only refresh cookie is sent
});

// Request Interceptor: Attach the Access Token to every outgoing request
api.interceptors.request.use((config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Variables to handle multiple requests failing at the same time
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// Response Interceptor: Catch 401s and attempt silent refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register')) {
            return Promise.reject(error);
        }

        // If error is 401 and we haven't already retried this specific request
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // If another request is already refreshing the token, queue this one up
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to get a new token using the secure HTTP-only cookie
                const { data } = await axios.post(
                    `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = data.data.accessToken;
                
                // Update Redux with the new token
                store.dispatch(setCredentials({ accessToken: newAccessToken }));
                
                // Process any requests that were waiting
                processQueue(null, newAccessToken);
                
                // Replay the original failed request with the new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                // If the refresh fails (e.g., session expired completely), purge state and queue
                processQueue(refreshError, null);
                store.dispatch(logout());
                
                // Optional: Force reload to push them to the login screen
                window.location.href = '/login'; 
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;