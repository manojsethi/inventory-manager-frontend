// Purchase bill service response types

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

export interface PurchaseBillItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
}
