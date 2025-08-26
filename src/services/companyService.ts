import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { axios } from '../utils';

// Types
export interface Company {
    _id: string;
    name: string;
    logo: string;
    isActive: boolean;
    totalProducts: number;
    totalCategories: number;
    totalSuppliers: number;
    totalSales: number;
    totalRevenue: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCompanyRequest {
    name: string;
    logo: string;
    isActive?: boolean;
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {
    isActive?: boolean;
}

export interface CompanyQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

class CompanyService {
    async getAll(params?: CompanyQueryParams): Promise<Company[]> {
        const response = await axios.get(API_ENDPOINTS.COMPANIES.BASE, { params });
        return response.data.data.companies;
    }

    async getById(id: string): Promise<Company> {
        const response = await axios.get(`${API_ENDPOINTS.COMPANIES.BASE}/${id}`);
        return response.data.data.company;
    }

    async create(data: CreateCompanyRequest): Promise<Company> {
        const response = await axios.post(API_ENDPOINTS.COMPANIES.BASE, data);
        return response.data.data.company;
    }

    async update(id: string, data: UpdateCompanyRequest): Promise<Company> {
        const response = await axios.put(`${API_ENDPOINTS.COMPANIES.BASE}/${id}`, data);
        return response.data.data.company;
    }

    async delete(id: string, hardDelete?: boolean): Promise<void> {
        const params = hardDelete ? { hard: 'true' } : {};
        await axios.delete(`${API_ENDPOINTS.COMPANIES.BASE}/${id}`, { params });
    }

    async search(query: string): Promise<Company[]> {
        const response = await axios.get(`${API_ENDPOINTS.COMPANIES.SEARCH}?q=${encodeURIComponent(query)}`);
        return response.data.data.companies;
    }
}

export const companyService = new CompanyService();
export default companyService; 