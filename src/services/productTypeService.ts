import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { axios } from '../utils';

// Types
export interface ProductType {
    _id: string;
    name: string;
    description?: string;
    logo?: string;
    skuPrefix: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProductTypeRequest {
    name: string;
    description?: string;
    logo?: string;
    skuPrefix: string;
}

export interface UpdateProductTypeRequest extends Partial<CreateProductTypeRequest> {
}

// ProductTypeCategory types
export interface ProductTypeCategory {
    _id: string;
    name: string;
    description?: string;
    logo?: string;
    skuPrefix: string;
    isActive: boolean;
    productType: string; // ProductType ID
    latestNumber: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProductTypeCategoryRequest {
    name: string;
    description?: string;
    logo?: string;
    skuPrefix: string;
    isActive?: boolean;
}

export interface UpdateProductTypeCategoryRequest extends Partial<CreateProductTypeCategoryRequest> {
}

class ProductTypeService {
    // ProductType methods
    async getAll(): Promise<ProductType[]> {
        const response = await axios.get(API_ENDPOINTS.PRODUCT_TYPES.BASE);
        const data = response.data.data?.productTypes || response.data.productTypes || response.data;
        return Array.isArray(data) ? data : [];
    }

    async getById(id: string): Promise<ProductType> {
        const response = await axios.get(`${API_ENDPOINTS.PRODUCT_TYPES.BASE}/${id}`);
        return response.data.data?.productType || response.data.productType || response.data;
    }

    async create(data: CreateProductTypeRequest): Promise<ProductType> {
        const response = await axios.post(API_ENDPOINTS.PRODUCT_TYPES.BASE, data);
        return response.data.data?.productType || response.data.productType || response.data;
    }

    async update(id: string, data: UpdateProductTypeRequest): Promise<ProductType> {
        const response = await axios.put(`${API_ENDPOINTS.PRODUCT_TYPES.BASE}/${id}`, data);
        return response.data.data?.productType || response.data.productType || response.data;
    }

    async delete(id: string): Promise<void> {
        await axios.delete(`${API_ENDPOINTS.PRODUCT_TYPES.BASE}/${id}`);
    }

    async getNextSkuCode(id: string): Promise<string> {
        const response = await axios.get(`${API_ENDPOINTS.PRODUCT_TYPES.BASE}/${id}/next-sku`);
        return response.data.data?.nextSkuCode || response.data.nextSkuCode || response.data;
    }

    // ProductTypeCategory methods
    async getAllCategories(productTypeId: string): Promise<ProductTypeCategory[]> {
        const response = await axios.get(`${API_ENDPOINTS.PRODUCT_TYPES.BASE}/${productTypeId}/categories`);
        const data = response.data.data?.categories || response.data.categories || response.data;
        return Array.isArray(data) ? data : [];
    }

    async getCategoryById(productTypeId: string, categoryId: string): Promise<ProductTypeCategory> {
        const response = await axios.get(`${API_ENDPOINTS.PRODUCT_TYPES.BASE}/${productTypeId}/categories/${categoryId}`);
        return response.data.data?.category || response.data.category || response.data;
    }

    async createCategory(productTypeId: string, data: CreateProductTypeCategoryRequest): Promise<ProductTypeCategory> {
        const response = await axios.post(`${API_ENDPOINTS.PRODUCT_TYPES.BASE}/${productTypeId}/categories`, data);
        return response.data.data?.category || response.data.category || response.data;
    }

    async updateCategory(productTypeId: string, categoryId: string, data: UpdateProductTypeCategoryRequest): Promise<ProductTypeCategory> {
        const response = await axios.put(`${API_ENDPOINTS.PRODUCT_TYPES.BASE}/${productTypeId}/categories/${categoryId}`, data);
        return response.data.data?.category || response.data.category || response.data;
    }

    async deleteCategory(productTypeId: string, categoryId: string): Promise<void> {
        await axios.delete(`${API_ENDPOINTS.PRODUCT_TYPES.BASE}/${productTypeId}/categories/${categoryId}`);
    }
}

export const productTypeService = new ProductTypeService();
export default productTypeService; 