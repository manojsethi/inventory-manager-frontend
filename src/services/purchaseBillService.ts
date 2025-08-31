import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { axios } from '../utils';

// Types
export interface PurchaseBillItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
}

export interface PurchaseBill {
    _id: string;
    billNumber: string;
    supplierId: any;
    supplierName: string;
    supplierBillNumber: string;
    billDate: string;
    dueDate: string;
    items: PurchaseBillItem[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    status: 'draft' | 'paid';
    notes?: string;
    attachments?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CreatePurchaseBillRequest {
    supplierId: string;
    supplierBillNumber: string;
    billDate: string;
    dueDate: string;
    items: Omit<PurchaseBillItem, 'productName' | 'totalPrice'>[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    notes?: string;
    attachments?: string[];
}

export interface UpdatePurchaseBillRequest extends Partial<CreatePurchaseBillRequest> {
    status?: 'draft' | 'paid';
}

export interface PurchaseBillQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'draft' | 'paid';
    supplierId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

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
