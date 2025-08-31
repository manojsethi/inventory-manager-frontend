import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { axios } from '../utils';

// Types
export interface Customer {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    notes?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCustomerRequest {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    notes?: string;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
    isActive?: boolean;
}

export interface CustomerQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

class CustomerService {
    async getAll(params?: CustomerQueryParams): Promise<PaginatedResponse<Customer>> {
        const response = await axios.get(API_ENDPOINTS.CUSTOMERS.BASE, { params });
        return response.data.data;
    }

    async getById(id: string): Promise<Customer> {
        const response = await axios.get(`${API_ENDPOINTS.CUSTOMERS.BASE}/${id}`);
        return response.data.data;
    }

    async create(data: CreateCustomerRequest): Promise<Customer> {
        const response = await axios.post(API_ENDPOINTS.CUSTOMERS.BASE, data);
        return response.data.data;
    }

    async update(id: string, data: UpdateCustomerRequest): Promise<Customer> {
        const response = await axios.put(`${API_ENDPOINTS.CUSTOMERS.BASE}/${id}`, data);
        return response.data.data;
    }

    async delete(id: string): Promise<void> {
        await axios.delete(`${API_ENDPOINTS.CUSTOMERS.BASE}/${id}`);
    }

    async search(query: string, params?: CustomerQueryParams): Promise<PaginatedResponse<Customer>> {
        const searchParams = { ...params, search: query };
        const response = await axios.get(API_ENDPOINTS.CUSTOMERS.SEARCH, { params: searchParams });
        return response.data.data;
    }

    async bulkUpdate(ids: string[], data: Partial<Customer>): Promise<Customer[]> {
        const response = await axios.patch(`${API_ENDPOINTS.CUSTOMERS.BASE}/bulk-update`, { ids, data });
        return response.data.data;
    }

    async bulkDelete(ids: string[]): Promise<void> {
        await axios.delete(`${API_ENDPOINTS.CUSTOMERS.BASE}/bulk-delete`, { data: { ids } });
    }
}

export const customerService = new CustomerService();
export default customerService; 