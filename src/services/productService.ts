import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { axios } from '../utils';

// Types
export interface ProductVariant {
    sku: string;
    name: string;
    description?: string;
    price: number;
    costPrice: number;
    stockQuantity: number;
    isActive: boolean;
    barcode?: string;
    images?: string[];
    attributes?: Record<string, any>;
    attributeGroups?: {
        id: string;
        name: string;
        attributes: string[];
    }[];
    differentiators?: string[];
}

export interface Product {
    _id: string;
    name: string;
    description?: string;
    productType: {
        _id: string;
        name: string;
        skuPrefix: string;
    };
    productTypeCategory: {
        _id: string;
        name: string;
        skuPrefix: string;
    };
    productBrand: {
        _id: string;
        name: string;
        logo?: string;
    };
    variants: ProductVariant[];
    defaultVariantIndex: number;
    // Differentiator configuration at product level
    differentiators?: {
        attributes: string[];
        values: Record<string, string[]>;
    };
    isActive: boolean;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProductRequest {
    name: string;
    description?: string;
    productType: string;
    productTypeCategory: string;
    productBrand: string;
    variants: {
        name: string;
        description?: string;
        price: number;
        costPrice: number;
        stockQuantity: number;
        barcode?: string;
        images?: string[];
        attributes?: Record<string, any>;
        attributeGroups?: {
            id: string;
            name: string;
            attributes: string[];
        }[];
        differentiators?: string[];
        isActive?: boolean;
    }[];
    defaultVariantIndex?: number;
    // Differentiator configuration
    differentiators?: {
        attributes: string[];
        values: Record<string, string[]>;
    };
    isActive?: boolean;
    notes?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
    variants?: {
        name: string;
        description?: string;
        price: number;
        costPrice: number;
        stockQuantity: number;
        barcode?: string;
        images?: string[];
        attributes?: Record<string, any>;
        attributeGroups?: {
            id: string;
            name: string;
            attributes: string[];
        }[];
        differentiators?: string[];
        sku?: string;
        isActive?: boolean;
    }[];
}

export interface ProductQueryParams {
    name?: string;
    productType?: string;
    productTypeCategory?: string;
    productBrand?: string;
    isActive?: boolean;
    // Filter by differentiator attributes
    differentiators?: Record<string, any>;
}

class ProductService {
    async getAll(params?: ProductQueryParams): Promise<Product[]> {
        const response = await axios.get(API_ENDPOINTS.PRODUCTS.BASE, { params });
        return response.data.data?.products || response.data.products || response.data;
    }

    async getById(id: string): Promise<Product> {
        const response = await axios.get(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`);
        return response.data.data?.product || response.data.product || response.data;
    }

    async getBySku(sku: string): Promise<Product> {
        const response = await axios.get(`${API_ENDPOINTS.PRODUCTS.BASE}/sku/${sku}`);
        return response.data.data?.product || response.data.product || response.data;
    }

    async create(data: CreateProductRequest): Promise<Product> {
        const response = await axios.post(API_ENDPOINTS.PRODUCTS.BASE, data);
        return response.data.data?.product || response.data.product || response.data;
    }

    async update(id: string, data: UpdateProductRequest): Promise<Product> {
        const response = await axios.put(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`, data);
        return response.data.data?.product || response.data.product || response.data;
    }

    async delete(id: string): Promise<void> {
        await axios.delete(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`);
    }

    async getByProductType(productTypeId: string): Promise<Product[]> {
        const response = await axios.get(`${API_ENDPOINTS.PRODUCTS.BASE}/product-type/${productTypeId}`);
        return response.data.data?.products || response.data.products || response.data;
    }

    async getByProductTypeCategory(categoryId: string): Promise<Product[]> {
        const response = await axios.get(`${API_ENDPOINTS.PRODUCTS.BASE}/category/${categoryId}`);
        return response.data.data?.products || response.data.products || response.data;
    }

    async getByProductBrand(brandId: string): Promise<Product[]> {
        const response = await axios.get(`${API_ENDPOINTS.PRODUCTS.BASE}/brand/${brandId}`);
        return response.data.data?.products || response.data.products || response.data;
    }

    // New variant management methods
    async addVariant(productId: string, variantData: any): Promise<Product> {
        const response = await axios.post(`${API_ENDPOINTS.PRODUCTS.BASE}/${productId}/variants`, variantData);
        return response.data.data?.product || response.data.product || response.data;
    }

    async updateVariant(productId: string, variantSku: string, variantData: any): Promise<Product> {
        const response = await axios.put(`${API_ENDPOINTS.PRODUCTS.BASE}/${productId}/variants/${variantSku}`, variantData);
        return response.data.data?.variant || response.data.variant || response.data;
    }

    async deleteVariant(productId: string, variantSku: string): Promise<Product> {
        const response = await axios.delete(`${API_ENDPOINTS.PRODUCTS.BASE}/${productId}/variants/${variantSku}`);
        return response.data.data?.product || response.data.product || response.data;
    }

    async getVariantsById(productId: string): Promise<any[]> {
        const response = await axios.get(`${API_ENDPOINTS.PRODUCTS.BASE}/${productId}/variants`);
        return response.data.data?.variants || response.data.variants || response.data;
    }

    async getProductVariants(productId: string): Promise<any[]> {
        const response = await axios.get(`${API_ENDPOINTS.PRODUCTS.BASE}/${productId}/variants`);
        return response.data.data?.variants || response.data.variants || response.data;
    }

    async getVariantBySku(sku: string): Promise<any> {
        const response = await axios.get(`${API_ENDPOINTS.PRODUCTS.BASE}/variants/${sku}`);
        return response.data.data?.variant || response.data.variant || response.data;
    }

    async previewNextSku(productTypeId: string, productTypeCategoryId: string): Promise<string> {
        const response = await axios.get(`${API_ENDPOINTS.PRODUCTS.BASE}/preview-sku`, {
            params: { productTypeId, productTypeCategoryId }
        });
        return response.data.data?.nextSku || response.data.nextSku || response.data;
    }


}

export const productService = new ProductService();
export default productService; 