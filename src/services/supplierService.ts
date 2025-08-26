import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { axios } from '../utils';

// Types
export interface Supplier {
    _id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    isActive: boolean;
    taxId?: string;
    paymentTerms?: number;
    creditLimit?: number;
    currentBalance?: number;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateSupplierRequest {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    taxId?: string;
    paymentTerms?: number;
    creditLimit?: number;
    notes?: string;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {
    isActive?: boolean;
}

export interface SupplierQueryParams {
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

class SupplierService {
    async getAll(params?: SupplierQueryParams): Promise<PaginatedResponse<Supplier>> {
        const response = await axios.get(API_ENDPOINTS.SUPPLIERS.BASE, { params });
        return response.data.data;
    }

    async getById(id: string): Promise<Supplier> {
        const response = await axios.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/${id}`);
        return response.data.data.supplier;
    }

    async create(data: CreateSupplierRequest): Promise<Supplier> {
        const response = await axios.post(API_ENDPOINTS.SUPPLIERS.BASE, data);
        return response.data.data.supplier;
    }

    async update(id: string, data: UpdateSupplierRequest): Promise<Supplier> {
        const response = await axios.put(`${API_ENDPOINTS.SUPPLIERS.BASE}/${id}`, data);
        return response.data.data.supplier;
    }

    async delete(id: string): Promise<void> {
        await axios.delete(`${API_ENDPOINTS.SUPPLIERS.BASE}/${id}`);
    }

    async getActiveSuppliers(): Promise<Supplier[]> {
        const response = await axios.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/active`);
        return response.data.data;
    }

    async getSuppliersWithLowCredit(threshold?: number): Promise<Supplier[]> {
        const params = threshold ? { threshold } : {};
        const response = await axios.get(`${API_ENDPOINTS.SUPPLIERS.BASE}/low-credit`, { params });
        return response.data.data;
    }

    async search(query: string, params?: SupplierQueryParams): Promise<PaginatedResponse<Supplier>> {
        const searchParams = { ...params, search: query };
        const response = await axios.get(API_ENDPOINTS.SUPPLIERS.SEARCH, { params: searchParams });
        return response.data.data;
    }
}

export const supplierService = new SupplierService();
export default supplierService; 