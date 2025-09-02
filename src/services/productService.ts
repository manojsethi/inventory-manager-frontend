import { API_ENDPOINTS } from '../constants/apiEndpoints';
import type {
    CreateProductRequest,
    Product,
    ProductQueryParams,
    UpdateProductRequest
} from '../types/services';
import { axios } from '../utils';

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

    async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
        const response = await axios.get(API_ENDPOINTS.PRODUCTS.SEARCH, {
            params: {
                q: query,
                limit
            }
        });
        return response.data.data?.products || response.data.products || response.data;
    }


}

export const productService = new ProductService();
export default productService; 