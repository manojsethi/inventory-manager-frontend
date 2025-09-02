import { API_ENDPOINTS } from '../constants/apiEndpoints';
import type {
    CompanyCategory,
    CompanyCategoryQueryParams,
    CompanyCategoryStats,
    CreateCompanyCategoryRequest,
    UpdateCompanyCategoryRequest
} from '../types/services';
import { axios } from '../utils';

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