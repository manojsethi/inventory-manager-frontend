export interface SaleBillCustomer {
    _id: string;
    name: string;
    phone?: string;
    email?: string;
}

export interface SaleBillItem {
    productId?: string;
    variantId?: string;
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    unitCost?: number;
    totalPrice: number;
    totalCost?: number;
    notes?: string;
    returnReason?: string;
}

export interface ReturnRecord {
    dateOfReturn: string;
    note?: string;
    items: SaleBillItem[];
    processedBy: {
        _id: string;
        name: string;
    };
}

export interface SaleBill {
    _id: string;
    billNumber: string;
    customer: SaleBillCustomer;
    billDate: string;
    status: 'paid' | 'cancelled';
    items: SaleBillItem[];
    subtotal: number;
    taxAmount?: number;
    shippingAmount?: number;
    totalAmount: number;
    realEffectiveTotalAmount?: number;
    notes?: string;
    paymentMethod?: string;
    paymentReference?: string;
    images?: string[];
    returnRecords?: ReturnRecord[];
    createdBy: {
        _id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateSaleBillRequest {
    customer: string;
    billDate: Date;
    items: {
        variantId?: string;
        sku: string;
        quantity: number;
        unitPrice: number;
        notes?: string;
    }[];
    taxAmount?: number;
    shippingAmount?: number;
    notes?: string;
    paymentMethod?: string;
    paymentReference?: string;
    images?: string[];
}

export interface UpdateSaleBillRequest extends Partial<CreateSaleBillRequest> {
    status?: 'paid' | 'cancelled';
}


