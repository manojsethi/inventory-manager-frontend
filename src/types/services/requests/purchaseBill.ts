// Purchase bill service request types

import type { PurchaseBillItem } from '../responses/purchaseBill';

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

// Note: PurchaseBillItem is defined in responses to avoid duplication
