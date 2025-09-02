// Supplier service request types

export interface CreateSupplierRequest {
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
    taxId?: string;
    paymentTerms?: number;
    creditLimit?: number;
    notes?: string;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {
    isActive?: boolean;
}

export interface SupplierQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
