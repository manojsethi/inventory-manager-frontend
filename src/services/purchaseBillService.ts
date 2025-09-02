import { API_ENDPOINTS } from '../constants/apiEndpoints';
import type { PaginatedResponse } from '../types/common';
import type {
    CreatePurchaseBillRequest,
    PurchaseBill,
    PurchaseBillQueryParams,
    UpdatePurchaseBillRequest
} from '../types/services';
import { axios } from '../utils';

class PurchaseBillService {
    async getNextBillNumber(): Promise<string> {
        const response = await axios.get(API_ENDPOINTS.PURCHASE_BILLS.NEXT_NUMBER);
        return response.data.data.billNumber;
    }

    async getAll(params?: PurchaseBillQueryParams): Promise<PaginatedResponse<PurchaseBill>> {
        const response = await axios.get(API_ENDPOINTS.PURCHASE_BILLS.BASE, { params });
        return response.data;
    }

    async getById(id: string): Promise<PurchaseBill> {
        const response = await axios.get(`${API_ENDPOINTS.PURCHASE_BILLS.BASE}/${id}`);
        return response.data.data;
    }

    async create(data: CreatePurchaseBillRequest): Promise<PurchaseBill> {
        const response = await axios.post(API_ENDPOINTS.PURCHASE_BILLS.BASE, data);
        return response.data.data.purchaseBill;
    }

    async update(id: string, data: UpdatePurchaseBillRequest): Promise<PurchaseBill> {
        const response = await axios.put(`${API_ENDPOINTS.PURCHASE_BILLS.BASE}/${id}`, data);
        return response.data.data.purchaseBill;
    }

    async delete(id: string): Promise<void> {
        await axios.delete(`${API_ENDPOINTS.PURCHASE_BILLS.BASE}/${id}`);
    }

    async markAsPaid(id: string): Promise<PurchaseBill> {
        const response = await axios.post(`${API_ENDPOINTS.PURCHASE_BILLS.BASE}/${id}/mark-paid`);
        return response.data.data.purchaseBill;
    }

    async getBySupplier(supplierId: string, params?: PurchaseBillQueryParams): Promise<PaginatedResponse<PurchaseBill>> {
        const response = await axios.get(`${API_ENDPOINTS.PURCHASE_BILLS.SUPPLIER}/${supplierId}`, { params });
        return response.data.data;
    }

    async getPending(params?: PurchaseBillQueryParams): Promise<PaginatedResponse<PurchaseBill>> {
        const response = await axios.get(API_ENDPOINTS.PURCHASE_BILLS.PENDING, { params });
        return response.data.data;
    }

    async search(query: string, params?: PurchaseBillQueryParams): Promise<PaginatedResponse<PurchaseBill>> {
        const searchParams = { ...params, search: query };
        const response = await axios.get(API_ENDPOINTS.PURCHASE_BILLS.BASE, { params: searchParams });
        return response.data.data;
    }
}

export const purchaseBillService = new PurchaseBillService();
export default purchaseBillService;
