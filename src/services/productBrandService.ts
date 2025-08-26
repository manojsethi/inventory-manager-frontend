import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { axios } from '../utils';

// Types
export interface ProductBrand {
    _id: string;
    name: string;
    logo: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProductBrandRequest {
    name: string;
    logo: string;
    isActive?: boolean;
}

export interface UpdateProductBrandRequest extends Partial<CreateProductBrandRequest> {
}

class ProductBrandService {
    async getAll(): Promise<ProductBrand[]> {
        const response = await axios.get(API_ENDPOINTS.PRODUCT_BRANDS.BASE);
        const data = response.data.data?.productBrands || response.data.productBrands || response.data;
        return Array.isArray(data) ? data : [];
    }

    async getById(id: string): Promise<ProductBrand> {
        const response = await axios.get(`${API_ENDPOINTS.PRODUCT_BRANDS.BASE}/${id}`);
        return response.data.data?.productBrand || response.data.productBrand || response.data;
    }

    async create(data: CreateProductBrandRequest): Promise<ProductBrand> {
        const response = await axios.post(API_ENDPOINTS.PRODUCT_BRANDS.BASE, data);
        return response.data.data?.productBrand || response.data.productBrand || response.data;
    }

    async update(id: string, data: UpdateProductBrandRequest): Promise<ProductBrand> {
        const response = await axios.put(`${API_ENDPOINTS.PRODUCT_BRANDS.BASE}/${id}`, data);
        return response.data.data?.productBrand || response.data.productBrand || response.data;
    }

    async delete(id: string): Promise<void> {
        await axios.delete(`${API_ENDPOINTS.PRODUCT_BRANDS.BASE}/${id}`);
    }
}

export const productBrandService = new ProductBrandService();
export default productBrandService;
