import { API_ENDPOINTS } from '../constants/apiEndpoints';
import type {
    CreateSupplierCategoryRequest,
    SupplierCategory,
    SupplierCategoryQueryParams,
    SupplierCategoryStats,
    UpdateSupplierCategoryRequest
} from '../types/services';
import { axios } from '../utils';

class SupplierCategoryService {
    async getAll(params?: SupplierCategoryQueryParams): Promise<SupplierCategory[]> {
        const response = await axios.get(API_ENDPOINTS.SUPPLIER_CATEGORIES.BASE, { params });
        return response.data.data;
    }

    async getById(id: string): Promise<SupplierCategory> {
        const response = await axios.get(`${API_ENDPOINTS.SUPPLIER_CATEGORIES.BASE}/${id}`);
        return response.data.data;
    }

    async create(data: CreateSupplierCategoryRequest): Promise<SupplierCategory> {
        const response = await axios.post(API_ENDPOINTS.SUPPLIER_CATEGORIES.BASE, data);
        return response.data.data;
    }

    async update(id: string, data: UpdateSupplierCategoryRequest): Promise<SupplierCategory> {
        const response = await axios.put(`${API_ENDPOINTS.SUPPLIER_CATEGORIES.BASE}/${id}`, data);
        return response.data.data;
    }

    async delete(id: string): Promise<void> {
        await axios.delete(`${API_ENDPOINTS.SUPPLIER_CATEGORIES.BASE}/${id}`);
    }

    async getBySupplier(supplierId: string): Promise<SupplierCategory[]> {
        const response = await axios.get(`${API_ENDPOINTS.SUPPLIER_CATEGORIES.SUPPLIER}/${supplierId}`);
        return response.data.data;
    }

    async getByCategory(categoryId: string): Promise<SupplierCategory[]> {
        const response = await axios.get(`${API_ENDPOINTS.SUPPLIER_CATEGORIES.CATEGORY}/${categoryId}`);
        return response.data.data;
    }

    async getStats(): Promise<SupplierCategoryStats> {
        const response = await axios.get(API_ENDPOINTS.SUPPLIER_CATEGORIES.STATS);
        return response.data.data;
    }
}

export const supplierCategoryService = new SupplierCategoryService();
export default supplierCategoryService; 