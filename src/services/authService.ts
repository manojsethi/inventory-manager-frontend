import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { axios } from '../utils';

// Types
export interface User {
    _id: string;
    email: string;
    name: string;
    role: 'admin' | 'manager' | 'employee';
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    data: {
        user: User;
        message?: string;
    }
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
}

class AuthService {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
        return response.data;
    }

    async logout(): Promise<void> {
        await axios.post(API_ENDPOINTS.AUTH.LOGOUT);
    }

    async getCurrentUser(): Promise<User> {
        const response = await axios.get(API_ENDPOINTS.AUTH.ME);
        return response.data.data.user;
    }

    async refreshToken(): Promise<User> {
        const response = await axios.post(API_ENDPOINTS.AUTH.REFRESH);
        return response.data.data.user;
    }
}

export const authService = new AuthService();
export default authService; 