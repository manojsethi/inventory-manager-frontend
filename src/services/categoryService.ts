import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { axios } from '../utils';

// Types
export interface Category {
    _id: string;
    name: string;
    description?: string;
    logo?: string;
    isActive: boolean;
    productCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCategoryRequest {
    name: string;
    description?: string;
    logo?: string;
    isActive?: boolean;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
    isActive?: boolean;
}


class CategoryService {
    async getAll(): Promise<Category[]> {
        const response = await axios.get(API_ENDPOINTS.CATEGORIES.BASE);
        return response.data.data.categories;
    }

    async getById(id: string): Promise<Category> {
        const response = await axios.get(`${API_ENDPOINTS.CATEGORIES.BASE}/${id}`);
        return response.data.data.category;
    }

    async create(data: CreateCategoryRequest): Promise<Category> {
        const response = await axios.post(API_ENDPOINTS.CATEGORIES.BASE, data);
        return response.data.data.category;
    }

    async update(id: string, data: UpdateCategoryRequest): Promise<Category> {
        const response = await axios.put(`${API_ENDPOINTS.CATEGORIES.BASE}/${id}`, data);
        return response.data.data.category;
    }

    async delete(id: string, hardDelete?: boolean): Promise<void> {
        const params = hardDelete ? { hard: 'true' } : {};
        await axios.delete(`${API_ENDPOINTS.CATEGORIES.BASE}/${id}`, { params });
    }
}

export const categoryService = new CategoryService();
export default categoryService; 