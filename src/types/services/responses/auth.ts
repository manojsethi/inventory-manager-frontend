// Authentication service response types

export interface User {
    _id: string;
    email: string;
    name: string;
    role: 'admin' | 'manager' | 'employee';
    createdAt?: string;
    updatedAt?: string;
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
