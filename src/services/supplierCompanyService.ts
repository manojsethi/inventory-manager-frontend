import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { axios } from '../utils';

// Types
export interface MarginTier {
    minAmount: number;
    maxAmount?: number;
    marginPercentage: number;
    description?: string;
}

export interface SupplierCompany {
    _id: string;
    supplierId: {
        _id: string;
        name: string;
        contactPerson: string;
        email: string;
        phone: string;
    };
    companyId: {
        _id: string;
        name: string;
        logo?: string;
        isActive: boolean;
    };
    marginTiers: MarginTier[];
    isActive: boolean;
    notes?: string;
    totalOrders: number;
    totalValue: number;
    averageMargin: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateSupplierCompanyRequest {
    supplierId: string;
    companyId: string;
    marginTiers?: MarginTier[];
    isActive?: boolean;
    notes?: string;
}

export interface UpdateSupplierCompanyRequest extends Partial<CreateSupplierCompanyRequest> { }

export interface SupplierCompanyQueryParams {
    page?: number;
    limit?: number;
    supplierId?: string;
    companyId?: string;
    isActive?: boolean;
}

export interface SupplierCompanyStats {
    totalRelationships: number;
    activeRelationships: number;
    totalOrders: number;
    totalValue: number;
    averageMargin: number;
}

class SupplierCompanyService {
    async getAll(params?: SupplierCompanyQueryParams): Promise<SupplierCompany[]> {
        const response = await axios.get(API_ENDPOINTS.SUPPLIER_COMPANIES.BASE, { params });
        return response.data.data;
    }

    async getById(id: string): Promise<SupplierCompany> {
        const response = await axios.get(`${API_ENDPOINTS.SUPPLIER_COMPANIES.BASE}/${id}`);
        return response.data.data;
    }

    async create(data: CreateSupplierCompanyRequest): Promise<SupplierCompany> {
        const response = await axios.post(API_ENDPOINTS.SUPPLIER_COMPANIES.BASE, data);
        return response.data.data;
    }

    async update(id: string, data: UpdateSupplierCompanyRequest): Promise<SupplierCompany> {
        const response = await axios.put(`${API_ENDPOINTS.SUPPLIER_COMPANIES.BASE}/${id}`, data);
        return response.data.data;
    }

    async delete(id: string): Promise<void> {
        await axios.delete(`${API_ENDPOINTS.SUPPLIER_COMPANIES.BASE}/${id}`);
    }

    async getBySupplier(supplierId: string): Promise<SupplierCompany[]> {
        const response = await axios.get(`${API_ENDPOINTS.SUPPLIER_COMPANIES.SUPPLIER}/${supplierId}/companies`);
        return response.data.data.supplierCompanies;
    }

    async getByCompany(companyId: string): Promise<SupplierCompany[]> {
        const response = await axios.get(`${API_ENDPOINTS.SUPPLIER_COMPANIES.COMPANY}/${companyId}`);
        return response.data.data.supplierCompanies;
    }

    async getMarginForAmount(id: string, amount: number): Promise<MarginTier | null> {
        const response = await axios.get(`${API_ENDPOINTS.SUPPLIER_COMPANIES.BASE}/${id}/margin?amount=${amount}`);
        return response.data.data;
    }

    async calculateMarginPercentage(id: string, amount: number): Promise<number> {
        const response = await axios.get(`${API_ENDPOINTS.SUPPLIER_COMPANIES.BASE}/${id}/margin-percentage?amount=${amount}`);
        return response.data.data;
    }
}

export const supplierCompanyService = new SupplierCompanyService();
export default supplierCompanyService; 