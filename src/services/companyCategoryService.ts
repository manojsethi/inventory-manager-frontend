import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { axios } from '../utils';

// Types
export interface CompanyCategory {
    _id: string;
    companyId: {
        _id: string;
        name: string;
        logo?: string;
        isActive: boolean;
    };
    categoryId: {
        _id: string;
        name: string;
        description?: string;
        logo?: string;
    };
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCompanyCategoryRequest {
    companyId: string;
    categoryId: string;
    notes?: string;
}

export interface UpdateCompanyCategoryRequest extends Partial<CreateCompanyCategoryRequest> { }

export interface CompanyCategoryQueryParams {
    page?: number;
    limit?: number;
    companyId?: string;
    categoryId?: string;
}

export interface CompanyCategoryStats {
    totalRelationships: number;
    activeCompanies: number;
    activeCategories: number;
    averageRelationshipsPerCompany: number;
    averageRelationshipsPerCategory: number;
}

class CompanyCategoryService {
    async getAll(params?: CompanyCategoryQueryParams): Promise<CompanyCategory[]> {
        const response = await axios.get(API_ENDPOINTS.COMPANY_CATEGORIES.BASE, { params });
        return response.data.data;
    }

    async getById(id: string): Promise<CompanyCategory> {
        const response = await axios.get(`${API_ENDPOINTS.COMPANY_CATEGORIES.BASE}/${id}`);
        return response.data.data;
    }

    async create(data: CreateCompanyCategoryRequest): Promise<CompanyCategory> {
        const response = await axios.post(API_ENDPOINTS.COMPANY_CATEGORIES.BASE, data);
        return response.data.data;
    }

    async update(id: string, data: UpdateCompanyCategoryRequest): Promise<CompanyCategory> {
        const response = await axios.put(`${API_ENDPOINTS.COMPANY_CATEGORIES.BASE}/${id}`, data);
        return response.data.data;
    }

    async delete(id: string): Promise<void> {
        await axios.delete(`${API_ENDPOINTS.COMPANY_CATEGORIES.BASE}/${id}`);
    }

    async getByCompany(companyId: string): Promise<CompanyCategory[]> {
        const response = await axios.get(`${API_ENDPOINTS.COMPANY_CATEGORIES.COMPANY}/${companyId}`);
        return response.data.data;
    }

    async getByCategory(categoryId: string): Promise<CompanyCategory[]> {
        const response = await axios.get(`${API_ENDPOINTS.COMPANY_CATEGORIES.CATEGORY}/${categoryId}`);
        return response.data.data;
    }

    async getStats(): Promise<CompanyCategoryStats> {
        const response = await axios.get(API_ENDPOINTS.COMPANY_CATEGORIES.STATS);
        return response.data.data;
    }
}

export const companyCategoryService = new CompanyCategoryService();
export default companyCategoryService; 