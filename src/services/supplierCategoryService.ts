import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { axios } from '../utils';

// Types
export interface SupplierCategory {
    _id: string;
    supplierId: {
        _id: string;
        name: string;
        contactPerson: string;
        email: string;
        phone: string;
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

export interface CreateSupplierCategoryRequest {
    supplierId: string;
    categoryId: string;
    notes?: string;
}

export interface UpdateSupplierCategoryRequest extends Partial<CreateSupplierCategoryRequest> { }

export interface SupplierCategoryQueryParams {
    page?: number;
    limit?: number;
    supplierId?: string;
    categoryId?: string;
}

export interface SupplierCategoryStats {
    totalRelationships: number;
    activeSuppliers: number;
    activeCategories: number;
    averageRelationshipsPerSupplier: number;
    averageRelationshipsPerCategory: number;
}

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