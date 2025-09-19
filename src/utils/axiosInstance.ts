import { message } from 'antd';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

// Create a custom axios instance with interceptors
const axiosInstance: AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_INVENTORY_APP_API_URL || 'http://localhost:8000',
    withCredentials: true, // Enable sending cookies with requests
});



// Type for logout function
export type LogoutFunction = () => void;

// Variables to store callback functions
let logoutCallback: LogoutFunction | null = null;
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Request interceptor to ensure credentials are sent
axiosInstance.interceptors.request.use(
    (config) => {
        // Ensure credentials are sent with every request
        config.withCredentials = true;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh and errors
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as any;
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // If we're already refreshing, wait for that to complete
            if (isRefreshing && refreshPromise) {
                try {
                    const success = await refreshPromise;
                    if (success) {
                        return axiosInstance(originalRequest);
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                }
            } else {
                // Start a new refresh process
                try {
                    isRefreshing = true;
                    refreshPromise = performTokenRefresh();
                    const success = await refreshPromise;
                    if (success) {
                        return axiosInstance(originalRequest);
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                } finally {
                    isRefreshing = false;
                    refreshPromise = null;
                }
            }

            // If refresh failed, logout user
            if (logoutCallback) {
                logoutCallback();
            }
            return Promise.reject(error);
        }

        // Handle other errors
        if (error.response?.status === 403) {
            message.error('Access denied. You do not have permission to perform this action.');
        } else if (error.response?.status === 404) {
            message.error('Resource not found.');
        } else if (error.response?.status && error.response.status >= 500) {
            message.error('Server error. Please try again later.');
        } else if (error.response?.data && typeof error.response.data === 'object' && 'error' in error.response.data) {
            message.error((error.response.data as any).error);
        } else if (error.message === 'Network Error') {
            message.error('Network error. Please check your connection.');
        } else {
            message.error('An unexpected error occurred.');
        }

        return Promise.reject(error);
    }
);

// Internal function to perform token refresh
const performTokenRefresh = async (): Promise<boolean> => {
    try {
        await axios.post(`${process.env.REACT_APP_INVENTORY_APP_API_URL || 'http://localhost:8000'}/api/auth/refresh`, {}, {
            withCredentials: true,
        });
        // If refresh is successful, the response should contain user data
        // but we don't need to update the user state here as it will be handled by the calling component
        return true;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
};

// Function to set the logout callback
export const setLogoutCallback = (callback: LogoutFunction) => {
    logoutCallback = callback;
};

// Function to clear callbacks (useful for cleanup)
export const clearCallbacks = () => {
    logoutCallback = null;
    isRefreshing = false;
    refreshPromise = null;
};

// Export the custom axios instance (with interceptors)
export { axiosInstance };
