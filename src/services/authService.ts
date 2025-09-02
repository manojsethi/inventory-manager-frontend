import { API_ENDPOINTS } from '../constants/apiEndpoints';
import type {
    LoginCredentials,
    LoginResponse,
    User
} from '../types/services';
import { axios } from '../utils';

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