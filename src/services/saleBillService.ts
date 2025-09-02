import { API_ENDPOINTS } from '../constants/apiEndpoints';
import type { PaginatedResponse } from '../types/common';
import type { CreateSaleBillRequest, SaleBill, UpdateSaleBillRequest } from '../types/saleBill';
import { axios } from '../utils';

export interface SaleBillQueryParams {
    page?: number;
    limit?: number;
    customer?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}


class SaleBillService {
    async getAll(params?: SaleBillQueryParams): Promise<PaginatedResponse<SaleBill>> {
        const response = await axios.get(API_ENDPOINTS.SALES.BASE, { params });
        return response.data.data;
    }

    async getById(id: string): Promise<SaleBill> {
        const response = await axios.get(`${API_ENDPOINTS.SALES.BASE}/${id}`);
        return response.data.data;
    }

    async create(data: CreateSaleBillRequest): Promise<SaleBill> {
        const response = await axios.post(API_ENDPOINTS.SALES.BASE, data);
        return response.data.data;
    }

    async update(id: string, data: UpdateSaleBillRequest): Promise<SaleBill> {
        const response = await axios.put(`${API_ENDPOINTS.SALES.BASE}/${id}`, data);
        return response.data.data;
    }

    async delete(id: string): Promise<void> {
        await axios.delete(`${API_ENDPOINTS.SALES.BASE}/${id}`);
    }

    async addReturnItems(id: string, returnData: {
        dateOfReturn: Date;
        note?: string;
        items: {
            variantId?: string;
            sku: string;
            name: string;
            quantity: number;
            unitPrice: number;
            unitCost: number;
            notes?: string;
            returnReason?: string;
        }[];
    }): Promise<SaleBill> {
        const response = await axios.post(`${API_ENDPOINTS.SALES.BASE}/${id}/return-items`, returnData);
        return response.data.data;
    }

    async getNextBillNumber(): Promise<string> {
        const response = await axios.get(API_ENDPOINTS.SALES.NEXT_NUMBER);
        return response.data.data.nextBillNumber;
    }

    async searchCustomers(query: string, limit: number = 10): Promise<any[]> {
        const response = await axios.get(API_ENDPOINTS.CUSTOMERS.SEARCH, {
            params: { q: query, limit }
        });
        return response.data.data;
    }

    async createCustomer(data: { name: string; phone: string }): Promise<any> {
        const response = await axios.post(API_ENDPOINTS.CUSTOMERS.BASE, data);
        return response.data.data;
    }
}

export const saleBillService = new SaleBillService();
export default saleBillService;
