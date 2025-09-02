// Supplier service response types

export interface Supplier {
    _id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    isActive: boolean;
    taxId?: string;
    paymentTerms?: number;
    creditLimit?: number;
    currentBalance?: number;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}
